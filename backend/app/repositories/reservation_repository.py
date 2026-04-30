from datetime import date, datetime, time
from typing import Optional

from sqlalchemy import func

from app.repositories.base_repository import BaseRepository
from app.tables.tables import Reserva, Usuario, Espacio


class ReservationRepository(BaseRepository):
    def get_all(self) -> list[Reserva]:
        from sqlalchemy.orm import joinedload
        return self.db.query(Reserva).options(
            joinedload(Reserva.espacio_rel).joinedload(Espacio.tipo_espacio_rel)
        ).all()

    def get_by_id(self, id: int) -> Optional[Reserva]:
        return self.db.query(Reserva).filter(Reserva.id == id).first()

    def get_by_user_paginated(
        self, 
        user_id: int, 
        page: int, 
        limit: int, 
        status_group: Optional[str] = None
    ) -> tuple[list[Reserva], int]:
        from sqlalchemy.orm import joinedload
        query = self.db.query(Reserva).options(
            joinedload(Reserva.usuario_rel),
            joinedload(Reserva.espacio_rel).joinedload(Espacio.tipo_espacio_rel)
        ).filter(Reserva.id_user == user_id)
        
        if status_group == "activas":
            query = query.filter(Reserva.estado.in_(["Pendiente", "En curso"]))
        elif status_group == "pasadas":
            query = query.filter(Reserva.estado == "Finalizada")
        elif status_group == "canceladas":
            query = query.filter(Reserva.estado == "Cancelada")

        query = query.order_by(Reserva.fecha.desc(), Reserva.hora_inicio.desc())
        total = query.count()
        items = query.offset((page - 1) * limit).limit(limit).all()
        return items, total

    def get_by_user(self, user_id: int) -> list[Reserva]:
        return self.db.query(Reserva).filter(Reserva.id_user == user_id).all()

    def get_by_space(self, space_id: int) -> list[Reserva]:
        from sqlalchemy.orm import joinedload
        return self.db.query(Reserva).options(
            joinedload(Reserva.espacio_rel).joinedload(Espacio.tipo_espacio_rel)
        ).filter(Reserva.id_espacio == space_id).all()

    def get_active(self) -> list[Reserva]:
        from sqlalchemy.orm import joinedload
        ahora = datetime.now()
        ahora_fecha = ahora.date()
        ahora_hora = ahora.time()
        return self.db.query(Reserva).options(
            joinedload(Reserva.espacio_rel).joinedload(Espacio.tipo_espacio_rel)
        ).filter(
            (Reserva.fecha > ahora_fecha)
            | ((Reserva.fecha == ahora_fecha) & (Reserva.hora_fin > ahora_hora))
        ).all()

    def get_conflicting_for_update(
        self,
        space_id: int,
        fecha_reserva: date,
        hora_inicio: time,
        hora_fin: time,
    ) -> list[Reserva]:
        return (
            self.db.query(Reserva)
            .filter(
                Reserva.id_espacio == space_id,
                Reserva.fecha == fecha_reserva,
                Reserva.estado != "Cancelada",
                Reserva.hora_inicio < hora_fin,
                Reserva.hora_fin > hora_inicio,
            )
            .with_for_update()
            .all()
        )

    def get_filtered_paginated(
        self,
        fecha: Optional[date],
        usuario: Optional[str],
        page: int,
        limit: int,
    ):
        from sqlalchemy.orm import joinedload
        base_query = self.db.query(Reserva, Usuario).join(Usuario, Usuario.id == Reserva.id_user).options(
            joinedload(Reserva.espacio_rel).joinedload(Espacio.tipo_espacio_rel)
        )

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
        self.db.flush()
        return reserva

    def update(self, reserva: Reserva) -> Reserva:
        self.db.merge(reserva)
        self.db.flush()
        return reserva

    def delete(self, reserva: Reserva) -> bool:
        self.db.delete(reserva)
        self.db.flush()
        return True

    def delete_by_id(self, reservation_id: int) -> bool:
        rows = self.db.query(Reserva).filter(Reserva.id == reservation_id).delete(synchronize_session=False)
        self.db.flush()
        return rows > 0

    def count_by_user(self, id_user: int) -> int:
        return self.db.query(Reserva).filter(Reserva.id_user == id_user).count()