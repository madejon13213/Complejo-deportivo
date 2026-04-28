from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routes import court_router, notification_router, penalty_router, reservation_router, spaces_router, user_router

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

app.include_router(user_router.router)
app.include_router(spaces_router.router)
app.include_router(reservation_router.router)
app.include_router(court_router.router)
app.include_router(penalty_router.router)
app.include_router(notification_router.router)

Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"mensaje": "API funcionando 🚀"}
