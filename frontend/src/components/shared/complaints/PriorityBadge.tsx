import type { ComplaintPriority } from '@/types/complaint.types';

const priorityConfig: Record<ComplaintPriority, { label: string; className: string }> = {
  high: {
    label: 'Yüksek',
    className: 'border-[#93000A]/50 bg-[#93000A]/20 text-[#FFB4AB]',
  },
  medium: {
    label: 'Orta',
    className: 'border-[#EE9800]/40 bg-[#EE9800]/15 text-[#FFB95F]',
  },
  low: {
    label: 'Düşük',
    className: 'border-[#8C909F]/40 bg-[#32353C] text-[#C2C6D6]',
  },
};

export function PriorityBadge({ priority }: { priority: ComplaintPriority }) {
  const config = priorityConfig[priority];
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${config.className}`}>
      {config.label}
    </span>
  );
}
