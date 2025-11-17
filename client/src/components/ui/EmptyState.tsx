interface EmptyStateProps {
  title?: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      {icon && <div className="mb-4 text-4xl">{icon}</div>}
      {title && <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>}
      <p className="text-gray-400 text-sm max-w-md mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-sm font-medium hover:bg-amber-500/30 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

