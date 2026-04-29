from datetime import date, datetime, time
from typing import Optional

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Time,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class Rol(Base):
    __tablename__ = "rol"

    id: Mapped[int] = mapped_column(primary_key=True)
    rol: Mapped[str] = mapped_column(String(50))


class Usuario(Base):
    __tablename__ = "usuario"

    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(100))
    pri_ape: Mapped[str] = mapped_column(String(100))
    seg_ape: Mapped[Optional[str]] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True)
    contraseña: Mapped[str] = mapped_column(String(255))
    telefono: Mapped[Optional[str]] = mapped_column(String(20))

    id_rol: Mapped[int] = mapped_column(ForeignKey("rol.id"))
    version_id: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    rol_rel: Mapped["Rol"] = relationship()

    __mapper_args__ = {
        "version_id_col": version_id
    }


class TipoEspacio(Base):
    __tablename__ = "tipo_espacio"

    id: Mapped[int] = mapped_column(primary_key=True)
    tipo: Mapped[str] = mapped_column(String(100), unique=True)
    permite_reserva_parcial: Mapped[bool] = mapped_column(Boolean)


class Espacio(Base):
    __tablename__ = "espacio"

    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(100), unique=True)
    precio_hora: Mapped[float] = mapped_column(Numeric(10, 2), CheckConstraint("precio_hora > 0"))
    capacidad: Mapped[int] = mapped_column(Integer, CheckConstraint("capacidad > 0"))
    precio_hora_parcial: Mapped[Optional[float]] = mapped_column(
        Numeric(10, 2), CheckConstraint("precio_hora_parcial > 0")
    )

    id_tipo_espacio: Mapped[int] = mapped_column(ForeignKey("tipo_espacio.id"))
    tipo_espacio_rel: Mapped["TipoEspacio"] = relationship()


class Reserva(Base):
    __tablename__ = "reserva"

    id: Mapped[int] = mapped_column(primary_key=True)
    fecha: Mapped[date] = mapped_column(Date)
    hora_inicio: Mapped[time] = mapped_column(Time)
    hora_fin: Mapped[time] = mapped_column(Time)
    estado: Mapped[str] = mapped_column(String(50))
    plazas_parciales: Mapped[Optional[int]] = mapped_column(Integer, CheckConstraint("plazas_parciales > 0"))
    tipo_reserva: Mapped[str] = mapped_column(String(50))

    id_user: Mapped[int] = mapped_column(ForeignKey("usuario.id"))
    id_espacio: Mapped[int] = mapped_column(ForeignKey("espacio.id"))
    version_id: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    __table_args__ = (
        CheckConstraint("hora_fin > hora_inicio", name="chk_reserva_horas"),
    )

    __mapper_args__ = {
        "version_id_col": version_id
    }


class Penalizacion(Base):
    __tablename__ = "penalizacion"

    id: Mapped[int] = mapped_column(primary_key=True)
    fecha_inicio: Mapped[date] = mapped_column(Date)
    fecha_fin: Mapped[date] = mapped_column(Date)
    tipo_penalizacion: Mapped[str] = mapped_column(String(100))

    id_reserva: Mapped[int] = mapped_column(ForeignKey("reserva.id"))

    __table_args__ = (
        CheckConstraint("fecha_fin >= fecha_inicio", name="chk_penalizacion_fechas"),
    )


class Notificacion(Base):
    __tablename__ = "notificacion"

    id: Mapped[int] = mapped_column(primary_key=True)
    tipo: Mapped[str] = mapped_column(String(50))
    mensaje: Mapped[str] = mapped_column(String(255))
    leida: Mapped[bool] = mapped_column(Boolean, default=False)
    creada_en: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    id_user: Mapped[int] = mapped_column(ForeignKey("usuario.id"))
    id_reserva: Mapped[Optional[int]] = mapped_column(ForeignKey("reserva.id"), nullable=True)
