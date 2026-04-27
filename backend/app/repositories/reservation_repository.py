from datetime import datetime, date
from typing import Optional

from sqlalchemy import func

from app.repositories.base_repository import BaseRepository
from app.tables.tables import Reserva, Usuario


class ReservationRepository(BaseRepository):
    def get_all(self) -> list[Reserva]:
        return self.db.query(Reserva).all()

    def get_by_id(self, id: int) -> Optional[Reserva]:
        return self.db.query(Reserva).filter(Reserva.id == id).first()

    def get_by_user(self, user_id: int) -> list[Reserva]:
        return self.db.query(Reserva).filter(Reserva.id_user == user_id).all()

    def get_by_space(self, space_id: int) -> list[Reserva]:
        return self.db.query(Reserva).filter(Reserva.id_espacio == space_id).all()

    def get_active(self) -> list[Reserva]:
        ahora = datetime.now()
        ahora_fecha = ahora.date()
        ahora_hora = ahora.time()
        return self.db.query(Reserva).filter(
            (Reserva.fecha > ahora_fecha)
            | ((Reserva.fecha == ahora_fecha) & (Reserva.hora_fin > ahora_hora))
        ).all()

    def get_filtered_paginated(
        self,
        fecha: Optional[date],
        usuario: Optional[str],
        page: int,
        limit: int,
    ):
        base_query = self.db.query(Reserva, Usuario).join(Usuario, Usuario.id == Reserva.id_user)

        if fecha:
            base_query = base_query.filter(Reserva.fecha == fecha)

        if usuario:
            normalized = f"%{usuario.strip().lower()}%"
            base_query = base_query.filter(
                func.lower(
                    func.concat(
                        Usuario.nombre,
                        " ",
                        Usuario.pri_ape,
                        " ",
                        func.coalesce(Usuario.seg_ape, ""),
                    )
                ).like(normalized)
            )

        total = base_query.count()
        items = (
            base_query
            .order_by(Reserva.fecha.desc(), Reserva.hora_inicio.desc(), Reserva.id.desc())
            .offset((page - 1) * limit)
            .limit(limit)
            .all()
        )

        return items, total

    def create(self, reserva: Reserva) -> Reserva:
        self.db.add(reserva)
        self.db.commit()
        self.db.refresh(reserva)
        return reserva

    def update(self, reserva: Reserva) -> Reserva:
        self.db.merge(reserva)
        self.db.commit()
        self.db.refresh(reserva)
        return reserva

    def delete(self, reserva: Reserva) -> bool:
        self.db.delete(reserva)
        self.db.commit()
        return True
