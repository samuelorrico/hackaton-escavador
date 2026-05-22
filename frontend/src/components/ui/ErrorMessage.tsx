interface Props { message?: string }

export function ErrorMessage({ message = 'Erro ao carregar dados.' }: Props) {
  return (
    <div className="flex items-center justify-center h-40">
      <p className="text-red-400 text-sm">{message}</p>
    </div>
  )
}
