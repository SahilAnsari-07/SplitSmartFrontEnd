import React from "react";
import { TrendingDown, TrendingUp, Link } from "lucide-react";
import {
  formatAmount,
  getAvatarColor,
  getInitials,
} from "../../utils/constants";
import Card from "../Card";

// Fix #15: Static style constants to avoid re-creating object refs each render
const STYLE_MEMBER_NAME = { fontWeight: 500, fontSize: "0.9rem" };
const STYLE_BALANCE_SUB = { fontSize: "0.75rem" };
const STYLE_DEBT_NAME = { fontSize: "0.875rem", fontWeight: 500 };
const STYLE_DEBT_AMOUNT = { fontWeight: 700, color: "#0f172a" };
const STYLE_CELEBRATION = { fontSize: "1.5rem", marginBottom: "0.5rem" };
const STYLE_SETTLED_TITLE = { fontWeight: 600 };
const STYLE_SETTLED_SUB = { fontSize: "0.875rem" };

function getBalanceColor(netBalance) {
  if (Math.abs(netBalance) < 0.5) return "#64748b";
  return netBalance > 0 ? "#10b981" : "#f43f5e";
}

function getBalanceStyle(netBalance) {
  return {
    fontWeight: 700,
    fontSize: "0.95rem",
    color: getBalanceColor(netBalance),
  };
}

const GroupBalancesTab = React.memo(function GroupBalancesTab({
  balances,
  debts,
  myMemberId,
  onLinkUser,
}) {
  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-muted-foreground text-xs font-semibold">
            MEMBER BALANCES
          </p>
        </div>
        {balances.map((balance, index) => (
          <div
            key={balance.memberId}
            className={`flex items-center gap-3 p-4 ${
              index < balances.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
              style={{
                background: getAvatarColor(balance.memberName),
                fontSize: "0.8rem",
                fontWeight: 700,
              }}
            >
              {getInitials(
                balance.memberId === myMemberId
                  ? "You"
                  : balance.memberName,
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-foreground" style={STYLE_MEMBER_NAME}>
                  {balance.memberId === myMemberId
                    ? "You"
                    : balance.memberName}
                </p>
                {balance.linkedUserId ? (
                  <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[0.75rem] font-medium">
                    Linked
                  </span>
                ) : (
                  <button onClick={() => onLinkUser(balance.memberId)}>
                    <span className="px-2 py-0.5 flex rounded-full bg-gray-100 text-gray-600 text-[0.65rem] font-medium">
                      Link User
                      <Link className="w-3 h-3 ml-0.5 mt-0.5" />
                    </span>
                  </button>
                )}
              </div>
              <p className="text-muted-foreground" style={STYLE_BALANCE_SUB}>
                {Math.abs(balance.netBalance) < 0.5
                  ? "All settled up"
                  : balance.netBalance > 0
                    ? "is owed money"
                    : "owes money"}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {Math.abs(balance.netBalance) >= 0.5 &&
                (balance.netBalance > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                ))}
              <span style={getBalanceStyle(balance.netBalance)}>
                {Math.abs(balance.netBalance) < 0.5
                  ? "₹0"
                  : balance.netBalance > 0
                    ? `+${formatAmount(balance.netBalance)}`
                    : `-${formatAmount(Math.abs(balance.netBalance))}`}
              </span>
            </div>
          </div>
        ))}
      </Card>

      {debts.length > 0 ? (
        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-muted-foreground text-xs font-semibold">
              SIMPLIFIED DEBTS
            </p>
          </div>
          {debts.map((debt, index) => (
            <div
              key={`${debt.fromId}-${debt.toId}`}
              className={`flex items-center gap-3 p-4 ${
                index < debts.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0"
                style={{
                  background: getAvatarColor(debt.fromName),
                  fontSize: "0.75rem",
                  fontWeight: 700,
                }}
              >
                {getInitials(
                  debt.fromId === myMemberId ? "You" : debt.fromName,
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground" style={STYLE_DEBT_NAME}>
                  <span
                    style={{
                      color:
                        debt.fromId === myMemberId ? "#f43f5e" : "inherit",
                    }}
                  >
                    {debt.fromId === myMemberId ? "You" : debt.fromName}
                  </span>
                  <span className="text-muted-foreground mx-1.5">owes</span>
                  <span
                    style={{
                      color:
                        debt.toId === myMemberId ? "#10b981" : "inherit",
                    }}
                  >
                    {debt.toId === myMemberId ? "you" : debt.toName}
                  </span>
                </p>
              </div>
              <span style={STYLE_DEBT_AMOUNT}>
                {formatAmount(debt.amount)}
              </span>
            </div>
          ))}
        </Card>
      ) : (
        <div className="bg-green-50 rounded-2xl border border-green-200 p-6 text-center">
          <p style={STYLE_CELEBRATION}>🎉</p>
          <p className="text-green-700" style={STYLE_SETTLED_TITLE}>
            All settled up!
          </p>
          <p className="text-green-600 mt-1" style={STYLE_SETTLED_SUB}>
            No outstanding debts in this group
          </p>
        </div>
      )}
    </div>
  );
});

export default GroupBalancesTab;
