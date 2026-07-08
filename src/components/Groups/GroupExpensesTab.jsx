import React from "react";
import { Trash2 } from "lucide-react";
import {
  formatAmount,
  formatDate,
  getCategoryInfo,
} from "../../utils/constants";

// Fix #15: Static style constants extracted to avoid new object refs on every render
const STYLE_LENT_LABEL = { fontSize: "0.75rem", color: "#10b981", fontWeight: 600 };
const STYLE_LENT_AMOUNT = { fontWeight: 700, color: "#10b981" };
const STYLE_SHARE_LABEL = { fontSize: "0.75rem", color: "#f43f5e", fontWeight: 600 };
const STYLE_SHARE_AMOUNT = { fontWeight: 700, color: "#f43f5e" };

const GroupExpensesTab = React.memo(function GroupExpensesTab({
  groupedExpenses,
  myMemberId,
  deletingId,
  onDeleteExpense,
}) {
  return (
    <div className="space-y-5">
      {groupedExpenses.map(([date, expenses]) => (
        <div key={date}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
              {formatDate(date)}
            </span>
            <span className="text-muted-foreground text-xs">
              {formatAmount(
                expenses.reduce(
                  (sum, expense) => sum + expense.amount,
                  0,
                ),
              )}
            </span>
          </div>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {expenses.map((expense, index) => {
              const category = getCategoryInfo(expense.category);
              const splitCount = expense.splitBetween?.length || 1;
              const myShare = expense.amount / splitCount;
              const iPaid = expense.paidById === myMemberId;
              const iParticipate = (expense.splitBetween || []).includes(myMemberId);

              return (
                <div
                  key={expense.id}
                  className={`flex items-start gap-4 p-4 hover:bg-muted/40 transition group ${
                    index < expenses.length - 1
                      ? "border-b border-border"
                      : ""
                  }`}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: category.bg }}
                  >
                    <span className="text-xl">{category.emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-foreground truncate font-medium">
                          {expense.title}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {iPaid ? "You paid" : `${expense.paidByName || "Someone"} paid`} ·{" "}
                          {formatAmount(expense.amount)}
                        </p>
                        <p className="text-muted-foreground text-[0.75rem]">
                          Split {splitCount} ways
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {iParticipate && (
                          <div className="text-right">
                            {iPaid ? (
                              <>
                                <p style={STYLE_LENT_LABEL}>you lent</p>
                                <p style={STYLE_LENT_AMOUNT}>
                                  +{formatAmount(expense.amount - myShare)}
                                </p>
                              </>
                            ) : (
                              <>
                                <p style={STYLE_SHARE_LABEL}>your share</p>
                                <p style={STYLE_SHARE_AMOUNT}>
                                  -{formatAmount(myShare)}
                                </p>
                              </>
                            )}
                          </div>
                        )}
                        <button
                          onClick={() => onDeleteExpense(expense.id)}
                          className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-all shrink-0"
                          disabled={deletingId === expense.id}
                        >
                          {deletingId === expense.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-muted-foreground border-t-red-500 rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
});

export default GroupExpensesTab;
