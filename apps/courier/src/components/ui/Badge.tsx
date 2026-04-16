interface BadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { label: string; classes: string }> = {
  ASSIGNED_TO_COURIER: {
    label: 'Назначен',
    classes: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  IN_DELIVERY: {
    label: 'В пути',
    classes: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  DELIVERED: {
    label: 'Доставлен',
    classes: 'bg-green-100 text-green-800 border-green-200',
  },
  CANCELLED: {
    label: 'Отменён',
    classes: 'bg-red-100 text-red-800 border-red-200',
  },
};

export function Badge({ status, className = '' }: BadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    classes: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full border
        px-2.5 py-0.5 text-xs font-semibold
        ${config.classes} ${className}
      `}
    >
      {config.label}
    </span>
  );
}
