const HOURS_START = 10;
const HOURS_END = 22;

export interface CalendarRange {
  date: string;
  startHour: number;
  endHour: number;
}

export function getWeekDays(baseDate: Date): Date[] {
  const date = new Date(baseDate);
  const day = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  // Convert to Monday as first day (if Sunday (0), go back 6 days; otherwise go back (day - 1) days)
  const mondayOffset = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + mondayOffset);
  date.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, idx) => {
    const current = new Date(date);
    current.setDate(date.getDate() + idx);
    return current;
  });
}

export function getHoursRange(): number[] {
  return Array.from({ length: HOURS_END - HOURS_START }, (_, idx) => HOURS_START + idx);
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function toLocalSlot(dateIso: string, hour: number) {
  return {
    fecha: dateIso,
    hora: `${String(hour).padStart(2, "0")}:00:00`,
  };
}

export function isPastSlot(dateIso: string, hour: number): boolean {
  const slot = new Date(`${dateIso}T${String(hour).padStart(2, "0")}:00:00`);
  return slot.getTime() < Date.now();
}

export function formatLabelDate(date: Date): string {
  return date.toLocaleDateString("es-ES", { weekday: "short", day: "2-digit", month: "2-digit" });
}
