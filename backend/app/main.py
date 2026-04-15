from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import user_router
from app.database import engine, Base
# from app.routes.profiles import data_routes, export_routes
# from app.routes.xperience import xperience_routes
# from app.routes.xperience import costes_routes
# from app.routes.services.facilities_routes import router as facilities_router
# from app.routes.services.configuration_routes import router as configuration_router
# from app.routes.services import profile_routes, service_routes

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rutas
app.include_router(user_router.router)

Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"mensaje": "API funcionando 🚀"}
