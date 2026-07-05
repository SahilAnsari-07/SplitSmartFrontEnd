function Loader({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
      <p className="text-muted-foreground text-sm">{text}</p>
    </div>
  );
}

export default Loader;
