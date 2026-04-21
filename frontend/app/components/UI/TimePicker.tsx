import { InputHTMLAttributes } from "react";

interface TimePickerProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function TimePicker({ label, ...props }: TimePickerProps) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium">{label}</span>
      <input type="time" className="w-full rounded-xl border border-acero bg-white px-3 py-2 text-sm" {...props} />
    </label>
  );
}
