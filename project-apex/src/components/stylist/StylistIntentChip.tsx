interface Props {
  icon: string;
  label: string;
}

export default function StylistIntentChip({ icon, label }: Props) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#F9F6F1] border border-[#E3E1DD] rounded-full text-xs text-[#4B4B4B] capitalize font-medium">
      {icon} {label}
    </span>
  );
}
