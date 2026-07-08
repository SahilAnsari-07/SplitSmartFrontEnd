import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  HandCoins,
  Plus,
  TrendingDown,
  TrendingUp,
  Trash2,
  Link,
  User,
  UserPlus,
} from "lucide-react";
import {
  useAddGroupMemberMutation,
  useCreateSettlementMutation,
  useCreateSharedExpenseMutation,
  useDeleteSharedExpenseMutation,
  useGetGroupDetailQuery,
  useLinkUserMutation,
} from "../../store/apiSlice";
import {
  formatAmount,
  formatDate,
  getAvatarColor,
  getCategoryInfo,
  getInitials,
} from "../../utils/constants";
import AddSharedExpenseModal from "./AddSharedExpenseModal";
import SettleUpModal from "./SettleUpModal";
import LinkUserModal from "./LinkUserModal";
import Button from "../Button";
import Card from "../Card";
import EmptyState from "../EmptyState";
import Loader from "../Loader";
import { Skeleton, ExpenseSkeleton } from "../Skeleton";

function GroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.userData);
  const {
    data: group,
    isLoading,
    isFetching,
  } = useGetGroupDetailQuery(groupId, {
    skip: !groupId,
  });
  const [createSharedExpense] = useCreateSharedExpenseMutation();
  const [deleteSharedExpense] = useDeleteSharedExpenseMutation();
  const [addGroupMember] = useAddGroupMemberMutation();
  const [createSettlement] = useCreateSettlementMutation();
  const [linkUserMutation] = useLinkUserMutation();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showSettle, setShowSettle] = useState(false);
  const [showLinkUser, setShowLinkUser] = useState(false);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [selectedMemberToLink, setSelectedMemberToLink] = useState(null);
  const [activeTab, setActiveTab] = useState("expenses");
  const [newMemberName, setNewMemberName] = useState("");
  const [memberError, setMemberError] = useState("");

  const members = group?.members || [];
  const sharedExpenses = useMemo(
    () =>
      [...(group?.sharedExpenses || [])].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [group?.sharedExpenses],
  );

  // Find which member ID corresponds to the current user
  const myMemberId = useMemo(() => {
    const myMember = members.find(
      (m) => m.linkedUserId === currentUser?.id,
    );
    return myMember?.id;
  }, [members, currentUser?.id]);

  const balances = useMemo(() => {
    if (!group) return [];

    const balanceMap = {};
    members.forEach((member) => {
      balanceMap[member.id] = 0;
    });

    sharedExpenses.forEach((expense) => {
      const splitCount = expense.splitBetween?.length || 1;
      const share = expense.amount / splitCount;

      if (balanceMap[expense.paidById] !== undefined) {
        balanceMap[expense.paidById] += expense.amount;
      }

      (expense.splitBetween || []).forEach((memberId) => {
        if (balanceMap[memberId] !== undefined) {
          balanceMap[memberId] -= share;
        }
      });
    });

    (group.settlements || []).forEach((settlement) => {
      if (balanceMap[settlement.fromUserId] !== undefined) {
        balanceMap[settlement.fromUserId] += settlement.amount;
      }
      if (balanceMap[settlement.toUserId] !== undefined) {
        balanceMap[settlement.toUserId] -= settlement.amount;
      }
    });

    return members.map((member) => ({
      memberId: member.id,
      memberName: member.name,
      linkedUserId: member.linkedUserId,
      linkedEmail: member.email,
      netBalance: Math.round(balanceMap[member.id] * 100) / 100,
    }));
  }, [group, members, sharedExpenses]);

  const debts = useMemo(() => {
    const creditors = balances
      .filter((balance) => balance.netBalance > 0.01)
      .map((balance) => ({ ...balance }));
    const debtors = balances
      .filter((balance) => balance.netBalance < -0.01)
      .map((balance) => ({ ...balance, netBalance: -balance.netBalance }));

    const simplified = [];
    let creditorIndex = 0;
    let debtorIndex = 0;

    while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
      const creditor = creditors[creditorIndex];
      const debtor = debtors[debtorIndex];
      const amount = Math.min(creditor.netBalance, debtor.netBalance);

      if (amount > 0.01) {
        simplified.push({
          fromId: debtor.memberId,
          fromName: debtor.memberName,
          toId: creditor.memberId,
          toName: creditor.memberName,
          amount: Math.round(amount * 100) / 100,
        });
      }

      creditor.netBalance -= amount;
      debtor.netBalance -= amount;

      if (creditor.netBalance < 0.01) creditorIndex += 1;
      if (debtor.netBalance < 0.01) debtorIndex += 1;
    }

    return simplified;
  }, [balances]);

  const myBalance = balances.find(
    (balance) => balance.memberId === myMemberId,
  );
  const totalSpend = useMemo(
    () => sharedExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    [sharedExpenses],
  );

  const groupedExpenses = useMemo(() => {
    const map = {};
    sharedExpenses.forEach((expense) => {
      const key = expense.date;
      if (!map[key]) map[key] = [];
      map[key].push(expense);
    });
    return Object.entries(map).sort(
      ([a], [b]) => new Date(b).getTime() - new Date(a).getTime(),
    );
  }, [sharedExpenses]);

  const handleAddExpense = async (data) => {
    await createSharedExpense({ groupId, body: data }).unwrap();
  };

  const [deletingId, setDeletingId] = useState(null);

  const handleDeleteExpense = async (expenseId) => {
    setDeletingId(expenseId);
    try {
      await deleteSharedExpense({ groupId, expenseId }).unwrap();
    } finally {
      setDeletingId(null);
    }
  };

  const handleLinkUser = (memberId) => {
    setSelectedMemberToLink(memberId);
    setShowLinkUser(true);
  };

  const handleLinkUserSubmit = async (memberId, email) => {
    await linkUserMutation({ memberId, email }).unwrap();
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    const name = newMemberName.trim();

    if (!name) {
      setMemberError("Enter a name to add a member");
      return;
    }

    try {
      await addGroupMember({ groupId, body: { name, email: "" } }).unwrap();
      setNewMemberName("");
      setMemberError("");
      setShowAddMemberForm(false);
    } catch (error) {
      setMemberError(
        error?.data?.message || error?.data || "Unable to add member",
      );
    }
  };

  const handleSettle = async (settlement) => {
    await createSettlement({
      groupId,
      body: {
        fromUserId: settlement.fromId,
        toUserId: settlement.toId,
        amount: settlement.amount,
      },
    }).unwrap();
  };

  if ((isLoading || isFetching) && !group) {
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

  if (!group) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Group not found</p>
        <button
          onClick={() => navigate("/groups")}
          className="mt-4 text-primary font-medium"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/groups")}
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-border bg-card hover:bg-muted transition text-muted-foreground"
          id="group-back-btn"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-3xl">{group.emoji || "🏠"}</span>
          <div className="min-w-0">
            <h1 className="text-foreground truncate font-bold text-lg">
              {group.name}
            </h1>
            {group.description && (
              <p className="text-muted-foreground text-xs">
                {group.description}
              </p>
            )}
          </div>
        </div>
        <Button
          onClick={() => setShowAddExpense(true)}
          className="shrink-0 text-sm"
          id="add-shared-btn"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Expense</span>
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <Card className="p-3.5 text-center">
          <p className="text-muted-foreground text-[0.7rem]">Total Spent</p>
          <p className="text-foreground mt-0.5 font-bold">
            {formatAmount(totalSpend)}
          </p>
        </Card>
        <Card className="p-3.5 text-center">
          <p className="text-muted-foreground text-[0.7rem]">Your Balance</p>
          <p
            className="mt-0.5 font-bold"
            style={{
              fontSize: "1rem",
              color:
                !myBalance || Math.abs(myBalance.netBalance) < 0.5
                  ? "#0f172a"
                  : myBalance.netBalance > 0
                    ? "#10b981"
                    : "#f43f5e",
            }}
          >
            {!myBalance || Math.abs(myBalance.netBalance) < 0.5
              ? "Settled"
              : myBalance.netBalance > 0
                ? `+${formatAmount(myBalance.netBalance)}`
                : `-${formatAmount(Math.abs(myBalance.netBalance))}`}
          </p>
        </Card>
        <Card className="p-3.5 text-center">
          <p className="text-muted-foreground text-[0.7rem]">Members</p>
          <p className="text-foreground mt-0.5 font-bold">{members.length}</p>
        </Card>
      </div>

      {debts.length > 0 && (
        <button
          onClick={() => setShowSettle(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition mb-5 shadow-sm"
          style={{ fontWeight: 600 }}
        >
          <HandCoins className="w-5 h-5" />
          Settle Up
        </button>
      )}

      <div className="flex bg-muted rounded-xl p-1 mb-5" id="group-tabs">
        {["expenses", "balances"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-lg capitalize transition-all text-sm ${
              activeTab === tab
                ? "bg-white shadow-sm text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "expenses" && (
        <>
          {groupedExpenses.length === 0 ? (
            <EmptyState
              emoji="🧾"
              title="No expenses yet"
              description="Add the first shared expense for this group"
              action={
                <Button onClick={() => setShowAddExpense(true)}>
                  Add Expense
                </Button>
              }
            />
          ) : (
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
                                {/* Color-coded balance indicator */}
                                {iParticipate && (
                                  <div className="text-right">
                                    {iPaid ? (
                                      <>
                                        <p
                                          style={{
                                            fontSize: "0.75rem",
                                            color: "#10b981",
                                            fontWeight: 600,
                                          }}
                                        >
                                          you lent
                                        </p>
                                        <p
                                          style={{
                                            fontWeight: 700,
                                            color: "#10b981",
                                          }}
                                        >
                                          +{formatAmount(expense.amount - myShare)}
                                        </p>
                                      </>
                                    ) : (
                                      <>
                                        <p
                                          style={{
                                            fontSize: "0.75rem",
                                            color: "#f43f5e",
                                            fontWeight: 600,
                                          }}
                                        >
                                          your share
                                        </p>
                                        <p
                                          style={{
                                            fontWeight: 700,
                                            color: "#f43f5e",
                                          }}
                                        >
                                          -{formatAmount(myShare)}
                                        </p>
                                      </>
                                    )}
                                  </div>
                                )}
                                <button
                                  onClick={() => handleDeleteExpense(expense.id)}
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
          )}
        </>
      )}

      {activeTab === "balances" && (
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
                    <p
                      className="text-foreground"
                      style={{ fontWeight: 500, fontSize: "0.9rem" }}
                    >
                      {balance.memberId === myMemberId
                        ? "You"
                        : balance.memberName}
                    </p>
                    {balance.linkedUserId ? (
                      <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[0.75rem] font-medium">
                        Linked
                      </span>
                    ) : (

                    <button onClick={() => handleLinkUser(balance.memberId)}>
                      <span  className="px-2 py-0.5 flex rounded-full bg-gray-100 text-gray-600 text-[0.65rem] font-medium">
                        Link User
                        <Link className="w-3 h-3 ml-0.5 mt-0.5" />
                      </span>
                      </button>)}
                  </div>
                  <p
                    className="text-muted-foreground"
                    style={{ fontSize: "0.75rem" }}
                  >
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
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      color:
                        Math.abs(balance.netBalance) < 0.5
                          ? "#64748b"
                          : balance.netBalance > 0
                            ? "#10b981"
                            : "#f43f5e",
                    }}
                  >
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
                    <p
                      className="text-foreground"
                      style={{ fontSize: "0.875rem", fontWeight: 500 }}
                    >
                      <span
                        style={{
                          color:
                            debt.fromId === myMemberId
                              ? "#f43f5e"
                              : "inherit",
                        }}
                      >
                        {debt.fromId === myMemberId
                          ? "You"
                          : debt.fromName}
                      </span>
                      <span className="text-muted-foreground mx-1.5">owes</span>
                      <span
                        style={{
                          color:
                            debt.toId === myMemberId
                              ? "#10b981"
                              : "inherit",
                        }}
                      >
                        {debt.toId === myMemberId ? "you" : debt.toName}
                      </span>
                    </p>
                  </div>
                  <span style={{ fontWeight: 700, color: "#0f172a" }}>
                    {formatAmount(debt.amount)}
                  </span>
                </div>
              ))}
            </Card>
          ) : (
            <div className="bg-green-50 rounded-2xl border border-green-200 p-6 text-center">
              <p style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🎉</p>
              <p className="text-green-700" style={{ fontWeight: 600 }}>
                All settled up!
              </p>
              <p
                className="text-green-600 mt-1"
                style={{ fontSize: "0.875rem" }}
              >
                No outstanding debts in this group
              </p>
            </div>
          )}
        </div>
      )}

      {showAddMemberForm ? (
        <Card className="mt-6 p-4">
          <p className="text-muted-foreground text-xs font-semibold mb-3">
            ADD MEMBER
          </p>
          <form
            onSubmit={handleAddMember}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="text"
              value={newMemberName}
              onChange={(e) => {
                setNewMemberName(e.target.value);
                setMemberError("");
              }}
              placeholder="Member name"
              className="flex-1 px-4 py-3 rounded-xl border border-border bg-input-bg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition text-sm"
              autoFocus
            />
            <Button type="submit" className="shrink-0 py-3">
              Add
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => {
                setShowAddMemberForm(false);
                setMemberError("");
                setNewMemberName("");
              }}
              className="shrink-0 py-3"
            >
              Cancel
            </Button>
          </form>
          {memberError && (
            <p className="text-sm text-red-600 mt-2">{memberError}</p>
          )}
        </Card>
      ) : (
        <Button 
          variant="secondary" 
          onClick={() => setShowAddMemberForm(true)}
          className="mt-6 w-full py-4 rounded-xl border-dashed border-2 text-muted-foreground hover:text-foreground"
        >
          <UserPlus className="w-5 h-5 mr-2" /> Add New Member
        </Button>
      )}

      <button
        onClick={() => setShowAddExpense(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center sm:hidden hover:opacity-90 active:scale-95 transition-all"
        style={{ zIndex: 40 }}
      >
        <Plus className="w-6 h-6" />
      </button>

      {showAddExpense && (
        <AddSharedExpenseModal
          group={group}
          currentUserId={myMemberId}
          onAdd={handleAddExpense}
          onClose={() => setShowAddExpense(false)}
        />
      )}

      {showSettle && (
        <SettleUpModal
          group={group}
          debts={debts}
          currentUserId={myMemberId}
          onSettle={handleSettle}
          onClose={() => setShowSettle(false)}
        />
      )}

      {showLinkUser && (
        <LinkUserModal
          memberId={selectedMemberToLink}
          onLink={handleLinkUserSubmit}
          onClose={() => {
            setShowLinkUser(false);
            setSelectedMemberToLink(null);
          }}
        />
      )}
    </div>
  );
}

export default GroupDetail;
