import React from 'react';

const Button = React.memo(function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  ...props
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all active:scale-[0.99]';

  const variants = {
    primary: 'bg-primary text-primary-foreground hover:opacity-90 shadow-sm',
    secondary: 'bg-card border border-border text-foreground hover:bg-muted',
    danger: 'bg-destructive text-white hover:bg-red-600',
    success: 'bg-green-500 text-white hover:bg-green-600 shadow-sm',
    ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
    full: 'w-full py-3.5 text-base',
  };

  return (
    <button
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
