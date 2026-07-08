import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  HandCoins,
  Plus,
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
} from "../../utils/constants";
import AddSharedExpenseModal from "./AddSharedExpenseModal";
import SettleUpModal from "./SettleUpModal";
import LinkUserModal from "./LinkUserModal";
import GroupExpensesTab from "./GroupExpensesTab";
import GroupBalancesTab from "./GroupBalancesTab";
import Button from "../Button";
import Card from "../Card";
import EmptyState from "../EmptyState";
import { ExpenseSkeleton } from "../Skeleton";

// Fix #15: Static style constants for balance card color
const BALANCE_SETTLED_COLOR = "#0f172a";
const BALANCE_POSITIVE_COLOR = "#10b981";
const BALANCE_NEGATIVE_COLOR = "#f43f5e";

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

  // Fix #5: memoize myBalance instead of recalculating on every render
  const myBalance = useMemo(
    () => balances.find((balance) => balance.memberId === myMemberId),
    [balances, myMemberId],
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

  // Fix #8: Pass groupId so linkUser mutation invalidates only this group's cache
  const handleLinkUserSubmit = async (memberId, email) => {
    await linkUserMutation({ memberId, email, groupId }).unwrap();
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

  // Fix #15: Compute balance card color once
  const balanceColor = !myBalance || Math.abs(myBalance.netBalance) < 0.5
    ? BALANCE_SETTLED_COLOR
    : myBalance.netBalance > 0
      ? BALANCE_POSITIVE_COLOR
      : BALANCE_NEGATIVE_COLOR;

  const balanceText = !myBalance || Math.abs(myBalance.netBalance) < 0.5
    ? "Settled"
    : myBalance.netBalance > 0
      ? `+${formatAmount(myBalance.netBalance)}`
      : `-${formatAmount(Math.abs(myBalance.netBalance))}`;

  if ((isLoading || isFetching) && !group) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="animate-pulse bg-muted h-8 w-32 rounded-lg"></div>
          <div className="animate-pulse bg-muted h-10 w-32 rounded-xl"></div>
        </div>
        <div className="space-y-4">
          <ExpenseSkeleton />
          <ExpenseSkeleton />
          <ExpenseSkeleton />
          <ExpenseSkeleton />
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
            className="mt-0.5 font-bold text-base"
            style={{ color: balanceColor }}
          >
            {balanceText}
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
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition mb-5 shadow-sm font-semibold"
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
            <GroupExpensesTab
              groupedExpenses={groupedExpenses}
              myMemberId={myMemberId}
              deletingId={deletingId}
              onDeleteExpense={handleDeleteExpense}
            />
          )}
        </>
      )}

      {activeTab === "balances" && (
        <GroupBalancesTab
          balances={balances}
          debts={debts}
          myMemberId={myMemberId}
          onLinkUser={handleLinkUser}
        />
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
