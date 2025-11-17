interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function Card({ children, className = '', title, subtitle }: CardProps) {
  return (
    <div className={`bg-[#111111] border border-gray-800 rounded-xl p-5 ${className}`}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-white font-semibold text-sm mb-1 uppercase tracking-wide text-gray-400">{title}</h3>
          )}
          {subtitle && <p className="text-gray-500 text-sm">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

