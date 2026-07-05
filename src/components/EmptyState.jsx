function EmptyState({ emoji, title, description, action }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-12 text-center">
      <p className="text-4xl mb-4">{emoji}</p>
      <p className="text-foreground font-semibold">{title}</p>
      <p className="text-muted-foreground mt-1 text-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default EmptyState;
