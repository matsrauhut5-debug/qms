from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.auth import router as auth_router
from app.api.routes.products import router as products_router
from app.api.routes.test_parameters import router as parameters_router
from app.api.routes.test_results import router as results_router
from app.api.routes.batches import router as batches_router

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
    application.include_router(products_router, prefix="/api/v1")
    application.include_router(parameters_router, prefix="/api/v1")
    application.include_router(results_router, prefix="/api/v1")
    application.include_router(batches_router, prefix="/api/v1")

    @application.get("/health")
    def health_check():
        return {"status": "ok", "version": "0.1.0"}

    return application

app = create_app()