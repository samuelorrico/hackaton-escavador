package main

import (
	"bufio"
	"flag"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"time"
)

const defaultBatchSize = 1000
const defaultProgressEvery = 100000
const defaultCSVPath = "assets/banco_de_dados.csv"

var nonIdentifierChars = regexp.MustCompile(`[^0-9a-zA-Z_]`)
var parensRegex = regexp.MustCompile(`[\(\)]`)
var slashCommaRegex = regexp.MustCompile(`[,/]`)
var spacesRegex = regexp.MustCompile(`\s+`)
var multiUnderscoreRegex = regexp.MustCompile(`_+`)

func sanitize(name string) string {
	name = strings.TrimSpace(name)
	name = parensRegex.ReplaceAllString(name, "")
	name = slashCommaRegex.ReplaceAllString(name, "_")
	name = spacesRegex.ReplaceAllString(name, "_")
	name = multiUnderscoreRegex.ReplaceAllString(name, "_")
	name = strings.Trim(name, "_")
	if name == "" {
		return "coluna"
	}
	return name
}

func sanitizeTableName(name string) string {
	name = sanitize(name)
	name = nonIdentifierChars.ReplaceAllString(name, "_")
	if name == "" {
		return "dados"
	}
	if name[0] >= '0' && name[0] <= '9' {
		return "tabela_" + name
	}
	return name
}

func makeUnique(names []string) []string {
	counts := make(map[string]int, len(names))
	unique := make([]string, 0, len(names))

	for _, name := range names {
		base := sanitize(name)
		count := counts[base]

		if count == 0 {
			unique = append(unique, base)
		} else {
			unique = append(unique, fmt.Sprintf("%s_%d", base, count))
		}

		counts[base] = count + 1
	}

	return unique
}

func quoteIdentifier(name string) string {
	return `"` + strings.ReplaceAll(name, `"`, `""`) + `"`
}

func quoteValue(value string) string {
	return `'` + strings.ReplaceAll(value, `'`, `''`) + `'`
}

func normalizeRecord(record []string, expected int) []string {
	if len(record) == expected {
		return record
	}

	normalized := make([]string, expected)
	copy(normalized, record)

	for i := len(record); i < expected; i++ {
		normalized[i] = ""
	}

	return normalized
}

type csvStreamReader struct {
	reader *bufio.Reader
}

func newCSVStreamReader(r io.Reader) *csvStreamReader {
	return &csvStreamReader{
		reader: bufio.NewReaderSize(r, 1<<20),
	}
}

func (r *csvStreamReader) Read() ([]string, error) {
	var record []string
	var field strings.Builder
	inQuotes := false
	recordStarted := false

	for {
		ch, _, err := r.reader.ReadRune()
		if err != nil {
			if err == io.EOF {
				if !recordStarted && field.Len() == 0 && len(record) == 0 {
					return nil, io.EOF
				}
				record = append(record, field.String())
				return record, nil
			}
			return nil, err
		}

		recordStarted = true

		switch ch {
		case '"':
			if inQuotes {
				next, _, err := r.reader.ReadRune()
				if err == io.EOF {
					record = append(record, field.String())
					return record, nil
				}
				if err != nil {
					return nil, err
				}

				if next == '"' {
					field.WriteRune('"')
					continue
				}

				inQuotes = false
				if err := r.reader.UnreadRune(); err != nil {
					return nil, err
				}
			} else if field.Len() == 0 {
				inQuotes = true
			} else {
				field.WriteRune(ch)
			}
		case ',':
			if inQuotes {
				field.WriteRune(ch)
			} else {
				record = append(record, field.String())
				field.Reset()
			}
		case '\n':
			if inQuotes {
				field.WriteRune(ch)
			} else {
				record = append(record, field.String())
				return record, nil
			}
		case '\r':
			if inQuotes {
				field.WriteRune(ch)
				continue
			}

			next, _, err := r.reader.ReadRune()
			if err == nil {
				if next != '\n' {
					if unreadErr := r.reader.UnreadRune(); unreadErr != nil {
						return nil, unreadErr
					}
				}
			} else if err != io.EOF {
				return nil, err
			}

			record = append(record, field.String())
			return record, nil
		default:
			field.WriteRune(ch)
		}
	}
}

func buildInsertSQL(tableName string, colNames []string, batch [][]string) string {
	var builder strings.Builder

	builder.Grow(len(batch) * len(colNames) * 16)
	builder.WriteString("INSERT INTO ")
	builder.WriteString(quoteIdentifier(tableName))
	builder.WriteString(" (")

	for i, col := range colNames {
		if i > 0 {
			builder.WriteString(", ")
		}
		builder.WriteString(quoteIdentifier(col))
	}

	builder.WriteString(") VALUES ")

	for rowIndex, row := range batch {
		if rowIndex > 0 {
			builder.WriteString(", ")
		}
		builder.WriteByte('(')

		for colIndex, value := range row {
			if colIndex > 0 {
				builder.WriteString(", ")
			}
			builder.WriteString(quoteValue(value))
		}

		builder.WriteByte(')')
	}

	builder.WriteString(";\n")
	return builder.String()
}

func buildCreateTableSQL(tableName string, colNames []string, overwrite bool) string {
	var builder strings.Builder

	builder.WriteString("PRAGMA journal_mode = WAL;\n")
	builder.WriteString("PRAGMA synchronous = NORMAL;\n")
	builder.WriteString("PRAGMA temp_store = MEMORY;\n")
	builder.WriteString("PRAGMA cache_size = -200000;\n")

	if overwrite {
		builder.WriteString("DROP TABLE IF EXISTS ")
		builder.WriteString(quoteIdentifier(tableName))
		builder.WriteString(";\n")
	}

	builder.WriteString("CREATE TABLE IF NOT EXISTS ")
	builder.WriteString(quoteIdentifier(tableName))
	builder.WriteString(" (")

	for i, col := range colNames {
		if i > 0 {
			builder.WriteString(", ")
		}
		builder.WriteString(quoteIdentifier(col))
		builder.WriteString(" TEXT")
	}

	builder.WriteString(");\n")
	return builder.String()
}

func flushBatch(writer *bufio.Writer, tableName string, colNames []string, batch [][]string) error {
	if len(batch) == 0 {
		return nil
	}

	if _, err := writer.WriteString(buildInsertSQL(tableName, colNames, batch)); err != nil {
		return err
	}

	return writer.Flush()
}

func importCSV(csvPath, dbPath, tableName string, batchSize, progressEvery int, overwrite bool) error {
	if batchSize <= 0 {
		return fmt.Errorf("batch-size deve ser maior que zero")
	}

	if progressEvery <= 0 {
		progressEvery = defaultProgressEvery
	}

	csvFile, err := os.Open(csvPath)
	if err != nil {
		return fmt.Errorf("erro ao abrir CSV: %w", err)
	}
	defer csvFile.Close()

	reader := newCSVStreamReader(csvFile)

	headers, err := reader.Read()
	if err != nil {
		if err == io.EOF {
			return fmt.Errorf("CSV vazio: %s", csvPath)
		}
		return fmt.Errorf("erro ao ler cabeçalho: %w", err)
	}

	if len(headers) == 0 {
		return fmt.Errorf("CSV sem cabeçalho: %s", csvPath)
	}

	headers[0] = strings.TrimPrefix(headers[0], "\ufeff")

	colNames := makeUnique(headers)
	safeTableName := sanitizeTableName(tableName)

	cmd := exec.Command("sqlite3", dbPath)
	stdin, err := cmd.StdinPipe()
	if err != nil {
		return fmt.Errorf("erro ao abrir stdin do sqlite3: %w", err)
	}

	stderr, err := cmd.StderrPipe()
	if err != nil {
		return fmt.Errorf("erro ao abrir stderr do sqlite3: %w", err)
	}

	if err := cmd.Start(); err != nil {
		return fmt.Errorf("erro ao iniciar sqlite3: %w", err)
	}

	errCh := make(chan error, 1)
	go func() {
		output, readErr := io.ReadAll(stderr)
		if readErr != nil {
			errCh <- fmt.Errorf("erro ao ler stderr do sqlite3: %w", readErr)
			return
		}
		if len(output) > 0 {
			errCh <- fmt.Errorf(strings.TrimSpace(string(output)))
			return
		}
		errCh <- nil
	}()

	writer := bufio.NewWriterSize(stdin, 1<<20)
	start := time.Now()

	if _, err := writer.WriteString(buildCreateTableSQL(safeTableName, colNames, overwrite)); err != nil {
		return err
	}

	if _, err := writer.WriteString("BEGIN TRANSACTION;\n"); err != nil {
		return err
	}

	batch := make([][]string, 0, batchSize)
	totalRows := 0
	nextProgressMark := progressEvery

	for {
		record, readErr := reader.Read()
		if readErr == io.EOF {
			break
		}
		if readErr != nil {
			return fmt.Errorf("erro ao ler linha %d: %w", totalRows+2, readErr)
		}

		normalized := normalizeRecord(record, len(colNames))
		batch = append(batch, normalized)

		if len(batch) >= batchSize {
			if err := flushBatch(writer, safeTableName, colNames, batch); err != nil {
				return fmt.Errorf("erro ao gravar lote no sqlite: %w", err)
			}

			totalRows += len(batch)
			if totalRows >= nextProgressMark {
				elapsed := time.Since(start).Round(time.Second)
				fmt.Printf("Inseridas %d linhas em %s\n", totalRows, elapsed)
				nextProgressMark += progressEvery
			}

			batch = batch[:0]
		}
	}

	if err := flushBatch(writer, safeTableName, colNames, batch); err != nil {
		return fmt.Errorf("erro ao gravar último lote no sqlite: %w", err)
	}
	totalRows += len(batch)

	if _, err := writer.WriteString("COMMIT;\n"); err != nil {
		return err
	}

	if err := writer.Flush(); err != nil {
		return err
	}

	if err := stdin.Close(); err != nil {
		return err
	}

	sqliteErr := <-errCh
	waitErr := cmd.Wait()

	if sqliteErr != nil {
		return fmt.Errorf("sqlite3 retornou erro: %w", sqliteErr)
	}
	if waitErr != nil {
		return fmt.Errorf("sqlite3 finalizou com erro: %w", waitErr)
	}

	fmt.Printf(
		"Convertido: %s -> %s (tabela: %s, %d linhas, duração: %s)\n",
		csvPath,
		dbPath,
		safeTableName,
		totalRows,
		time.Since(start).Round(time.Second),
	)

	return nil
}

func usage() {
	fmt.Fprintf(flag.CommandLine.Output(), "Uso:\n")
	fmt.Fprintf(flag.CommandLine.Output(), "  go run scripts/data/csv_to_sqlite.go [caminho/do/arquivo.csv]\n")
	fmt.Fprintf(flag.CommandLine.Output(), "  go run scripts/data/csv_to_sqlite.go -csv assets/banco_de_dados.csv\n")
	fmt.Fprintf(flag.CommandLine.Output(), "  go run scripts/data/csv_to_sqlite.go -src assets/banco_de_dados.csv -db assets/banco_de_dados.db -table dados\n\n")
	fmt.Fprintf(flag.CommandLine.Output(), "Exemplo para o seu caso:\n")
	fmt.Fprintf(flag.CommandLine.Output(), "  go run scripts/data/csv_to_sqlite.go assets/banco_de_dados.csv\n")
	fmt.Fprintf(flag.CommandLine.Output(), "  go run scripts/data/csv_to_sqlite.go -src assets/banco_de_dados.csv -batch-size 10000 -progress-every 200000\n\n")
	fmt.Fprintf(flag.CommandLine.Output(), "Flags disponíveis:\n")
	flag.PrintDefaults()
}

func main() {
	var csvPath string
	var srcPath string
	var pathArg string
	var dbPath string
	var tableName string
	var batchSize int
	var progressEvery int
	var overwrite bool

	flag.StringVar(&csvPath, "csv", "", "caminho do arquivo CSV")
	flag.StringVar(&srcPath, "src", "", "alias para o caminho do arquivo CSV")
	flag.StringVar(&pathArg, "path", "", "alias para o caminho do arquivo CSV")
	flag.StringVar(&dbPath, "db", "", "caminho do arquivo SQLite de saída")
	flag.StringVar(&tableName, "table", "dados", "nome da tabela de destino")
	flag.IntVar(&batchSize, "batch-size", defaultBatchSize, "quantidade de linhas por lote")
	flag.IntVar(&progressEvery, "progress-every", defaultProgressEvery, "intervalo de progresso em linhas")
	flag.BoolVar(&overwrite, "overwrite", true, "recria a tabela antes de importar")
	flag.Usage = usage
	flag.Parse()

	if csvPath == "" {
		csvPath = srcPath
	}
	if csvPath == "" {
		csvPath = pathArg
	}
	if csvPath == "" && flag.NArg() > 0 {
		csvPath = flag.Arg(0)
	}
	if csvPath == "" {
		csvPath = defaultCSVPath
	}

	if dbPath == "" {
		ext := filepath.Ext(csvPath)
		dbPath = strings.TrimSuffix(csvPath, ext) + ".db"
	}

	if err := importCSV(csvPath, dbPath, tableName, batchSize, progressEvery, overwrite); err != nil {
		fmt.Fprintln(os.Stderr, "Erro:", err)
		os.Exit(1)
	}
}
