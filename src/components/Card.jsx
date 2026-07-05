function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-card rounded-2xl border border-border shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
