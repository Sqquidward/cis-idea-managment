from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import SessionLocal
from app.routers import auth, feedback, ideas, users
from app.seed import seed_database
from voting_service import get_voting_service_status


@asynccontextmanager
async def lifespan(_app: FastAPI):
    with SessionLocal() as db:
        seed_database(db)
    yield


app = FastAPI(
    title="КИС «Управление идеями»",
    description="API корпоративной системы сбора и реализации инновационных предложений",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(ideas.router)
app.include_router(feedback.router)


@app.get("/api/health")
def healthcheck() -> dict[str, str]:
    voting_status = get_voting_service_status()
    return {
        "backend": "ok",
        "voting_service": voting_status["status"],
    }
