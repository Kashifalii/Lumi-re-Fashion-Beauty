const variants = {
  primary: 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm hover:shadow-md',
  secondary: 'bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-white dark:border-neutral-700',
  ghost: 'hover:bg-neutral-100 text-neutral-700 dark:hover:bg-neutral-800 dark:text-neutral-300',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
  outline: 'border border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white dark:border-rose-400 dark:text-rose-400',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
  xl: 'px-8 py-4 text-base',
  icon: 'p-2',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  fullWidth = false,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500/40 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]',
        variants[variant],
        sizes[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
