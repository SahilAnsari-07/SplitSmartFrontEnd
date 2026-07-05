import { useEffect, useState } from "react";
import { CheckCircle, X } from "lucide-react";
import {
  formatAmount,
  getAvatarColor,
  getInitials,
} from "../../utils/constants";

function SettleUpModal({ group, debts, currentUserId, onSettle, onClose }) {
  const [pendingKey, setPendingKey] = useState("");
  const [settleAmounts, setSettleAmounts] = useState({});

  useEffect(() => {
    setSettleAmounts(
      debts.reduce((accumulator, debt) => {
        accumulator[`${debt.fromId}-${debt.toId}`] = String(debt.amount);
        return accumulator;
      }, {}),
    );
  }, [debts]);

  const handleSettle = async (debt) => {
    const key = `${debt.fromId}-${debt.toId}`;
    const amount = Number(settleAmounts[key] ?? debt.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }

    setPendingKey(key);
    try {
      await onSettle({ ...debt, amount: Math.min(amount, debt.amount) });
    } finally {
      setPendingKey("");
    }
  };

  const allSettled = debts.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-md bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
          <h2 className="text-foreground" style={{ fontSize: "1.1rem" }}>
            Settle Up - {group.name}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto flex-1 hide-scrollbar">
          {allSettled ? (
            <div className="flex flex-col items-center py-8">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-foreground" style={{ fontWeight: 600 }}>
                All settled up!
              </p>
              <p
                className="text-muted-foreground mt-1"
                style={{ fontSize: "0.875rem" }}
              >
                No outstanding debts in this group
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p
                className="text-muted-foreground mb-4"
                style={{ fontSize: "0.875rem" }}
              >
                Settle the full amount or enter a partial payment.
              </p>
              {debts.map((debt) => {
                const key = `${debt.fromId}-${debt.toId}`;
                const isYouDebtor = debt.fromId === currentUserId;
                const isYouCreditor = debt.toId === currentUserId;
                const fromColor = getAvatarColor(debt.fromName);
                const currentAmount = settleAmounts[key] ?? String(debt.amount);

                return (
                  <div
                    key={key}
                    className="p-4 rounded-xl border bg-input-bg border-border transition-all"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0"
                        style={{
                          background: fromColor,
                          fontSize: "0.8rem",
                          fontWeight: 700,
                        }}
                      >
                        {getInitials(
                          debt.fromId === currentUserId ? "You" : debt.fromName,
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-foreground"
                          style={{ fontWeight: 500, fontSize: "0.9rem" }}
                        >
                          <span
                            style={{
                              color: isYouDebtor ? "#f43f5e" : "inherit",
                            }}
                          >
                            {debt.fromId === currentUserId
                              ? "You"
                              : debt.fromName}
                          </span>
                          <span className="text-muted-foreground mx-1.5">
                            →
                          </span>
                          <span
                            style={{
                              color: isYouCreditor ? "#10b981" : "inherit",
                            }}
                          >
                            {debt.toId === currentUserId ? "You" : debt.toName}
                          </span>
                        </p>
                        <p
                          className="text-muted-foreground"
                          style={{ fontSize: "0.8rem" }}
                        >
                          {isYouDebtor
                            ? `You owe ${debt.toName}`
                            : isYouCreditor
                              ? `${debt.fromName} owes you`
                              : `${debt.fromName} owes ${debt.toName}`}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p style={{ fontWeight: 700, color: "#0f172a" }}>
                          {formatAmount(debt.amount)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        max={debt.amount}
                        value={currentAmount}
                        onChange={(e) =>
                          setSettleAmounts((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button
                        onClick={() => handleSettle(debt)}
                        disabled={pendingKey === key}
                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition disabled:opacity-60"
                        style={{ fontSize: "0.85rem", fontWeight: 600 }}
                      >
                        {pendingKey === key ? "Saving..." : "Settle"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl border border-border text-foreground hover:bg-muted transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettleUpModal;
