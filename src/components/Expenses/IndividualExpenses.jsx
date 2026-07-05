import { useState, useMemo, useRef, useEffect } from "react";
import { Plus, Trash2, Search, Pencil } from "lucide-react";
import {
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
  useUpdateExpenseMutation,
  useGetExpensesQuery,
} from "../../store/apiSlice";
import {
  CATEGORIES,
  formatAmount,
  formatDate,
  getCategoryInfo,
} from "../../utils/constants";
import AddExpenseModal from "./AddExpenseModal";
import Button from "../Button";
import EmptyState from "../EmptyState";
import Loader from "../Loader";

function IndividualExpenses() {
  const [showAdd, setShowAdd] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const categoryRef = useRef(null);
  const { data: expenses = [], isLoading, isFetching } = useGetExpensesQuery();
  const [createExpense] = useCreateExpenseMutation();
  const [deleteExpense] = useDeleteExpenseMutation();
  const [updateExpense] = useUpdateExpenseMutation();

  // Enable touch-drag horizontal scrolling for category chips
  useEffect(() => {
    const el = categoryRef.current;
    if (!el) return;
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const onMouseDown = (e) => {
      isDown = true;
      el.style.cursor = "grabbing";
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    };
    const onMouseUp = () => {
      isDown = false;
      el.style.cursor = "grab";
    };
    const onMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      el.scrollLeft = scrollLeft - (x - startX);
    };

    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);
    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      if (activeCategory !== "all" && e.category !== activeCategory)
        return false;
      if (search && !e.title.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [expenses, activeCategory, search]);

  const totalFiltered = useMemo(
    () => filtered.reduce((sum, expense) => sum + expense.amount, 0),
    [filtered],
  );

  const thisMonthTotal = useMemo(() => {
    const now = new Date();
    return expenses
      .filter((e) => {
        const d = new Date(e.date);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((expense) => {
      const key = expense.date;
      if (!map[key]) map[key] = [];
      map[key].push(expense);
    });
    return Object.entries(map).sort(
      ([a], [b]) => new Date(b).getTime() - new Date(a).getTime(),
    );
  }, [filtered]);

  const handleAdd = (data) => {
    createExpense(data);
  };

  const handleEdit = (data) => {
    if (editingExpense) {
      updateExpense({ id: editingExpense.id, data });
    }
  };

  const handleDelete = (id) => {
    deleteExpense(id);
  };

  if ((isLoading || isFetching) && expenses.length === 0) {
    return <Loader text="Loading expenses..." />;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-foreground text-2xl font-bold"
            id="expenses-heading"
          >
            My Expenses
          </h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            This month:{" "}
            <span className="text-foreground font-semibold">
              {formatAmount(thisMonthTotal)}
            </span>
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)} id="add-expense-btn">
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search expenses..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition text-sm"
          id="expense-search-input"
        />
      </div>

      {/* Category filters — swipeable horizontal scroll (drag + touch) */}
      <div
        ref={categoryRef}
        className="flex gap-2 overflow-x-auto pb-2 mb-5 hide-scrollbar"
        style={{
          cursor: "grab",
          WebkitOverflowScrolling: "touch",
          overscrollBehaviorX: "contain",
          scrollSnapType: "x proximity",
        }}
        id="category-filters"
      >
        <button
          onClick={() => setActiveCategory("all")}
          className={`shrink-0 px-4 py-2 rounded-2xl border transition-all text-xs font-medium whitespace-nowrap ${
            activeCategory === "all"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground border-border hover:border-primary/40"
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-2xl border transition-all text-xs font-medium whitespace-nowrap ${
              activeCategory === cat.value
                ? "border-primary bg-secondary text-secondary-foreground"
                : "bg-card text-muted-foreground border-border hover:border-primary/40"
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      {grouped.length === 0 ? (
        <EmptyState
          emoji="💸"
          title="No expenses yet"
          description={
            search || activeCategory !== "all"
              ? "No matching expenses found"
              : "Add your first expense to get started"
          }
          action={
            !search &&
            activeCategory === "all" && (
              <Button onClick={() => setShowAdd(true)}>Add Expense</Button>
            )
          }
        />
      ) : (
        <div className="space-y-5">
          {grouped.map(([date, items]) => (
            <div key={date}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {formatDate(date)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatAmount(
                    items.reduce((sum, expense) => sum + expense.amount, 0),
                  )}
                </span>
              </div>
              <div className="overflow-hidden rounded-2xl border border-border bg-card">
                {items.map((expense, index) => {
                  const cat = getCategoryInfo(expense.category);
                  return (
                    <div
                      key={expense.id}
                      className={`group flex items-center gap-4 p-4 transition hover:bg-muted/40 ${
                        index < items.length - 1 ? "border-b border-border" : ""
                      }`}
                    >
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                        style={{ background: cat.bg }}
                      >
                        <span className="text-xl">{cat.emoji}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">
                          {expense.title}
                        </p>
                        {expense.note && (
                          <p className="text-muted-foreground truncate text-xs">
                            {expense.note}
                          </p>
                        )}
                        <span
                          className="mt-0.5 inline-block rounded-lg px-2 py-0.5 text-[0.7rem] font-medium"
                          style={{ background: cat.bg, color: cat.color }}
                        >
                          {cat.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">
                          {formatAmount(expense.amount)}
                        </span>
                        {/* Edit button */}
                        <button
                          onClick={() => setEditingExpense(expense)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground opacity-100 sm:opacity-0 transition-all hover:bg-blue-50 hover:text-blue-500 sm:group-hover:opacity-100"
                          id={`edit-expense-${expense.id}`}
                          title="Edit expense"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        {/* Delete button */}
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground opacity-100 sm:opacity-0 transition-all hover:bg-red-50 hover:text-red-500 sm:group-hover:opacity-100"
                          id={`delete-expense-${expense.id}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {filtered.length > 0 && (
            <div className="flex items-center justify-between px-1 pb-2">
              <span className="text-sm text-muted-foreground">
                {filtered.length} expenses
              </span>
              <span className="font-bold text-foreground">
                {formatAmount(totalFiltered)}
              </span>
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:opacity-90 active:scale-95 sm:hidden"
        id="fab-add-expense"
      >
        <Plus className="w-6 h-6" />
      </button>

      {showAdd && (
        <AddExpenseModal onAdd={handleAdd} onClose={() => setShowAdd(false)} />
      )}

      {editingExpense && (
        <AddExpenseModal
          expense={editingExpense}
          onAdd={handleEdit}
          onClose={() => setEditingExpense(null)}
        />
      )}
    </div>
  );
}

export default IndividualExpenses;
