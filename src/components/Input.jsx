import { useId } from 'react';

function Input({
  label,
  type = 'text',
  className = '',
  error,
  ...props
}) {
  const id = useId();

  return (
    <div>
      {label && (
        <label
          className="block text-foreground mb-1.5 text-sm font-medium"
          htmlFor={id}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        id={id}
        {...props}
        className={`w-full px-4 py-3 rounded-xl border border-border bg-input-bg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition ${className}`}
      />
      {error && (
        <p className="mt-1 text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}

export default Input;