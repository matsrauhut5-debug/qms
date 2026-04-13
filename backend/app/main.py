from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.auth import router as auth_router

def create_app() -> FastAPI:
    application = FastAPI(
        title="QMS API",
        version="0.1.0",
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    application.include_router(auth_router, prefix="/api/v1")

    @application.get("/health")
    def health_check():
        return {"status": "ok", "version": "0.1.0"}

    return application

app = create_app()