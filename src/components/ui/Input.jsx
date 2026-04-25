import { forwardRef } from 'react';

export const Input = forwardRef(function Input(
  { label, error, icon: Icon, className = '', ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
            <Icon size={18} />
          </div>
        )}
        <input
          ref={ref}
          className={[
            'w-full rounded-xl border bg-white dark:bg-neutral-800/50 dark:text-white text-neutral-800 placeholder-neutral-400 transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400',
            error
              ? 'border-red-400 focus:ring-red-400/30'
              : 'border-neutral-200 dark:border-neutral-700',
            Icon ? 'pl-10 pr-4 py-2.5' : 'px-4 py-2.5',
            className,
          ].join(' ')}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
});
