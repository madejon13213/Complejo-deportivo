import { SelectHTMLAttributes } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
}

export default function Select({ label, options, ...props }: SelectProps) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-gray-200">{label}</span>
      <select className="w-full rounded-2xl border border-white/20 bg-black/30 px-3 py-2 text-sm text-white" {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#111521] text-white">
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
