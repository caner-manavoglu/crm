import type { ComplaintStatus } from '@/types/complaint.types';

const statusConfig: Record<ComplaintStatus, { label: string; dot: string; bg: string; text: string; border: string }> = {
  pending: { label: 'Beklemede', dot: 'bg-[#EE9800]', bg: 'bg-[#EE9800]/15', text: 'text-[#FFB95F]', border: 'border-[#EE9800]/40' },
  assigned: { label: 'Atandı', dot: 'bg-[#4D8EFF]', bg: 'bg-[#4D8EFF]/20', text: 'text-[#ADC6FF]', border: 'border-[#4D8EFF]/40' },
  in_progress: { label: 'İşlemde', dot: 'bg-[#A78BFA]', bg: 'bg-[#A78BFA]/20', text: 'text-[#DDD6FE]', border: 'border-[#A78BFA]/40' },
  resolved: { label: 'Çözüldü', dot: 'bg-[#22C55E]', bg: 'bg-[#22C55E]/15', text: 'text-[#B1E5D5]', border: 'border-[#22C55E]/40' },
  closed: { label: 'Kapatıldı', dot: 'bg-[#8C909F]', bg: 'bg-[#32353C]', text: 'text-[#C2C6D6]', border: 'border-[#8C909F]/40' },
};

export function ComplaintStatusBadge({ status }: { status: ComplaintStatus }) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs ${config.bg} ${config.text} ${config.border}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
