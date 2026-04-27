export type UserRole = "cliente" | "club" | "administrador" | "admin" | string;

export interface User {
  id: number;
  nombre: string;
  pri_ape: string;
  seg_ape?: string | null;
  email: string;
  telefono?: string | null;
  id_rol?: number;
  rol?: UserRole;
}

export interface Reservation {
  id: number;
  id_espacio: number;
  id_user: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  plazas_parciales?: number | null;
  tipo_reserva: string;
  courtName?: string;
  userName?: string;
}

export interface ReservationCreatePayload {
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  plazas_parciales?: number | null;
  tipo_reserva: string;
  id_user: number;
  id_espacio: number;
}

export interface ReservationSearchItem extends Reservation {
  usuario_nombre: string;
}

export interface ReservationSearchResponse {
  items: ReservationSearchItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface Court {
  id: number;
  nombre: string;
  capacidad?: number;
  precio_hora?: number;
  precio_hora_parcial?: number | null;
  permite_reserva_parcial?: boolean;
  id_tipo_espacio?: number;
  tipo_espacio?: string;
  rating?: number;
  descripcion?: string;
}

export interface SpaceType {
  id: number;
  tipo: string;
  permite_reserva_parcial: boolean;
}

export interface Penalty {
  id: number;
  fecha_inicio: string;
  fecha_fin: string;
  tipo_penalizacion: string;
  id_reserva: number;
}

export interface PenalizationCreatePayload {
  id_reserva: number;
  motivo: string;
  fecha_penalizacion?: string;
}
