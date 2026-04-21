export type UserRole = "cliente" | "administrador" | string;

export interface User {
  id: number;
  nombre: string;
  pri_ape: string;
  seg_ape?: string;
  email: string;
  telefono?: string;
  id_rol?: number;
  rol?: UserRole;
}

export interface Reservation {
  id: number;
  id_espacio?: number;
  id_usuario?: number;
  fecha: string;
  hora_inicio?: string;
  hora_fin?: string;
  estado?: string;
  courtName?: string;
  userName?: string;
}

export interface Court {
  id: number;
  nombre: string;
  capacidad?: number;
  precio?: number;
  permite_reserva_parcial?: boolean;
  id_tipo_espacio?: number;
  tipo_espacio?: string;
  rating?: number;
  descripcion?: string;
}

export interface SpaceType {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface Penalty {
  id: number;
  motivo?: string;
  estado?: string;
  fecha?: string;
}
