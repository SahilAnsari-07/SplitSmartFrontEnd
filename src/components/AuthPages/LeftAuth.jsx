import Logo from '../Logo';

function LeftAuth() {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12">
      <div className="flex items-center gap-3">
        <Logo variant="light" />
      </div>

      <div>
        <h1 className="text-white mb-6 text-5xl leading-tight font-bold">
          Split expenses.
          <br />
          Live peacefully.
        </h1>
        <p className="text-white/70 text-lg leading-relaxed">
          Track your personal spending, manage shared costs with flatmates and
          hostelers — all in one place.
        </p>

        <div className="mt-10 space-y-4">
          {[
            {
              emoji: '💳',
              title: 'Individual Tracking',
              desc: 'Log your personal expenses by category',
            },
            {
              emoji: '🤝',
              title: 'Shared Expenses',
              desc: 'Split bills fairly with flatmates & groups',
            },
            {
              emoji: '⚡',
              title: 'Instant Balances',
              desc: 'See who owes what at a glance',
            },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xl">{item.emoji}</span>
              </div>
              <div>
                <p className="text-white font-semibold">{item.title}</p>
                <p className="text-white/60 text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-white/40 text-xs">
        © 2026 SplitSmart · For Hostelers & Flatmates
      </p>
    </div>
  );
}

export default LeftAuth;