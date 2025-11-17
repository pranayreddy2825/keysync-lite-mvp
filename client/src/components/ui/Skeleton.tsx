interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function Skeleton({ className = '', lines = 1 }: SkeletonProps) {
  if (lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`h-4 bg-gray-800 rounded animate-pulse ${i === lines - 1 ? 'w-3/4' : 'w-full'} ${className}`}
          />
        ))}
      </div>
    );
  }

  return <div className={`h-4 bg-gray-800 rounded animate-pulse ${className}`} />;
}

