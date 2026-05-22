back:
	.venv/Scripts/uvicorn backend.main:app --reload

front:
	cd frontend && npm run dev

dev:
	make -j2 back front