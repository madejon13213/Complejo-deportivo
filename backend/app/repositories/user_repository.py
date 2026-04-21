from app.repositories.base_repository import BaseRepository
from app.tables.tables import Usuario


class UserRepository(BaseRepository):
    def get_by_email(self, email: str) -> Usuario | None:
        return self.db.query(Usuario).filter(Usuario.email == email).first()

    def get_by_id(self, user_id: int) -> Usuario | None:
        return self.db.query(Usuario).filter(Usuario.id == user_id).first()

    def get_all(self) -> list[Usuario]:
        return self.db.query(Usuario).all()

    def create(self, user: Usuario) -> Usuario:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def delete(self, user: Usuario) -> None:
        self.db.delete(user)
        self.db.commit()
