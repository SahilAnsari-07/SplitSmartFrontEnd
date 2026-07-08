import { useMemo } from "react";
import { useSelector } from "react-redux";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  useGetExpensesQuery,
  useGetGroupsQuery,
  useGetBalanceSummaryQuery,
} from "../../store/apiSlice";
import {
  formatAmount,
  formatDate,
  getCategoryInfo,
} from "../../utils/constants";
import Card from "../Card";
import Loader from "../Loader";
import { Skeleton, ExpenseSkeleton } from "../Skeleton";

function Overview() {
  const currentUser = useSelector((state) => state.auth.userData);
  const { data: expenses = [], isLoading: expLoading } = useGetExpensesQuery();
  const { data: groups = [], isLoading: grpLoading } = useGetGroupsQuery();
  const { data: balanceSummary } = useGetBalanceSummaryQuery();

  // Fix #7 & #18: Single Date, memoized so it's stable across renders
  const { currentMonth, currentYear } = useMemo(() => {
    const now = new Date();
    return { currentMonth: now.getMonth(), currentYear: now.getFullYear() };
  }, []);

  const totalOwed = balanceSummary?.totalOwed || 0;
  const totalOwe = balanceSummary?.totalOwe || 0;

  const monthlyIndividual = useMemo(() => {
    return expenses
      .filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, currentMonth, currentYear]);

  // Spending by category for pie chart
  const categorySpending = useMemo(() => {
    const map = {};
    expenses
      .filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .forEach((e) => {
        map[e.category] = (map[e.category] ?? 0) + e.amount;
      });

    return Object.entries(map)
      .map(([value, amount]) => {
        const cat = getCategoryInfo(value);
        return {
          name: cat.label,
          value: Math.round(amount),
          color: cat.color,
          emoji: cat.emoji,
        };
      })
      .filter((c) => c.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [expenses, currentMonth, currentYear]);

  // Recent activity — personal + shared tags
  const recentActivity = useMemo(() => {
    return [...expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8)
      .map((e) => ({ ...e, type: "personal" }));
  }, [expenses]);

  if (
    (expLoading && expenses.length === 0) ||
    (grpLoading && groups.length === 0)
  ) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="bg-primary pt-12 pb-24 px-6 relative">
          <div className="animate-pulse bg-white/20 h-6 w-8 rounded-lg mb-6"></div>
          <div className="flex items-center gap-4">
            <div className="animate-pulse bg-white/20 w-16 h-16 rounded-2xl"></div>
            <div className="space-y-2">
              <div className="animate-pulse bg-white/20 h-8 w-48 rounded-lg"></div>
              <div className="animate-pulse bg-white/20 h-4 w-32 rounded-lg"></div>
            </div>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-16 relative z-10">
          <div className="bg-card rounded-2xl sm:rounded-3xl shadow-xl border border-border p-4 mb-6">
            <div className="flex gap-2">
              <div className="animate-pulse bg-muted h-10 flex-1 rounded-xl"></div>
              <div className="animate-pulse bg-muted h-10 flex-1 rounded-xl"></div>
            </div>
          </div>
          <div className="space-y-4">
            <ExpenseSkeleton />
            <ExpenseSkeleton />
          </div>
        </div>
      </div>
    );
  }

  const firstName = currentUser?.name?.split(" ")[0] || "there";

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Hero / Greeting with background gradient */}
      <div
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #6366f1 0%, #818cf8 50%, #a5b4fc 100%)",
        }}
      >
        <div
          className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, #fff 0%, transparent 70%)",
            transform: "translate(30%, -30%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #fff 0%, transparent 70%)",
            transform: "translate(-30%, 30%)",
          }}
        />
        <h1
          className="text-white text-2xl font-bold relative z-10"
          id="overview-heading"
        >
          Hi, {firstName} 👋
        </h1>
        <p className="text-white/80 mt-1 text-sm relative z-10">
          Here's your financial overview for this month
        </p>
      </div>

      {/* Stats cards — 3 cards like figma */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Personal Spending */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <span className="text-muted-foreground text-xs">This month</span>
          </div>
          <p className="text-muted-foreground text-xs">Personal Spending</p>
          <p className="text-foreground mt-1 text-2xl font-bold">
            {formatAmount(monthlyIndividual)}
          </p>
        </Card>

        {/* You are owed */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-muted-foreground text-xs">Shared</span>
          </div>
          <p className="text-muted-foreground text-xs">You are owed</p>
          <p
            className="mt-1 text-2xl font-bold"
            style={{
              color: totalOwed > 0 ? "#10b981" : "#0f172a",
            }}
          >
            {formatAmount(totalOwed)}
          </p>
        </Card>

        {/* You owe */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
            <span className="text-muted-foreground text-xs">Shared</span>
          </div>
          <p className="text-muted-foreground text-xs">You owe</p>
          <p
            className="mt-1 text-2xl font-bold"
            style={{
              color: totalOwe > 0 ? "#f43f5e" : "#0f172a",
            }}
          >
            {formatAmount(totalOwe)}
          </p>
        </Card>
      </div>

      {/* Category spending chart */}
      {categorySpending.length > 0 && (
        <Card className="p-5">
          <h3 className="text-foreground font-semibold mb-4">
            Spending by Category
          </h3>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-48 h-48 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySpending}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categorySpending.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [
                      `₹${value.toLocaleString("en-IN")}`,
                      "",
                    ]}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      fontSize: "0.8rem",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2 w-full">
              {categorySpending.map((cat) => (
                <div key={cat.name} className="flex items-center gap-3">
                  <span className="text-base">{cat.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-foreground text-xs">
                        {cat.name}
                      </span>
                      <span className="text-foreground text-xs font-semibold">
                        {formatAmount(cat.value)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (cat.value / categorySpending[0].value) * 100)}%`,
                          background: cat.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Recent activity with red amounts and personal/shared badges */}
      <Card className="p-5">
        <h3 className="text-foreground font-semibold mb-4">Recent Activity</h3>
        {recentActivity.length === 0 ? (
          <p className="text-muted-foreground text-center py-6 text-sm">
            No activity yet
          </p>
        ) : (
          <div className="space-y-1">
            {recentActivity.map((item) => {
              const cat = getCategoryInfo(item.category);
              const isShared = item.type === "shared";
              return (
                <div
                  key={`${item.type}-${item.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/60 transition"
                  id={`activity-item-${item.id}`}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: cat.bg }}
                  >
                    <span className="text-lg">{cat.emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground truncate font-medium text-sm">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className="text-[0.65rem] font-medium rounded px-1.5 py-0.5"
                        style={{
                          background: isShared ? "#fef2f2" : "#f0fdf4",
                          color: isShared ? "#dc2626" : "#16a34a",
                        }}
                      >
                        {isShared ? "Shared" : "Personal"}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {formatDate(item.date)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className="font-semibold text-sm"
                      style={{ color: "#dc2626" }}
                    >
                      -{formatAmount(item.amount)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

export default Overview;
