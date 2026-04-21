import { InputHTMLAttributes } from "react";

interface DatePickerProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function DatePicker({ label, ...props }: DatePickerProps) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium">{label}</span>
      <input type="date" className="w-full rounded-xl border border-acero bg-white px-3 py-2 text-sm" {...props} />
    </label>
  );
}
