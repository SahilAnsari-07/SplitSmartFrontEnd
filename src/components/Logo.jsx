import { Wallet } from 'lucide-react';

function Logo({ variant = 'default' }) {
  const styles = {
    default: { bg: 'bg-primary', text: 'text-foreground' },
    light: { bg: 'bg-white/20', text: 'text-white' },
    mobile: { bg: 'bg-primary', text: 'text-foreground' },
  };

  const { bg, text } = styles[variant] || styles.default;

  return (
    <>
      <div className={`w-9 h-9 ${bg} rounded-2xl flex items-center justify-center`}>
        <Wallet className="w-4 h-4 text-white" />
      </div>
      <span className={`${text} font-bold text-lg`}>SplitSmart</span>
    </>
  );
}

export default Logo;