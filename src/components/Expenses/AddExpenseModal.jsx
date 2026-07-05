import { useState } from "react";
import { CATEGORIES, getCategoryInfo } from "../../utils/constants";
import Modal from "../Modal";
import Button from "../Button";

function AddExpenseModal({ expense, onAdd, onClose }) {
  const isEdit = !!expense;
  const today = new Date().toISOString().split("T")[0];
  const [title, setTitle] = useState(isEdit ? expense.title : "");
  const [amount, setAmount] = useState(isEdit ? String(expense.amount) : "");
  const [category, setCategory] = useState(isEdit ? expense.category : "food");
  const [date, setDate] = useState(isEdit ? expense.date : today);
  const [note, setNote] = useState(isEdit ? expense.note || "" : "");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a title");
      return;
    }
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      await onAdd({ title: title.trim(), amount: amt, category, date, note: note.trim() || undefined });
      onClose();
    } catch {
      setError(isEdit ? "Unable to update expense" : "Unable to save expense");
    }
  };

  return (
    <Modal title={isEdit ? "Edit Expense" : "Add Expense"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="overflow-y-auto">
        <div className="px-6 py-5 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-foreground mb-1.5 text-sm font-medium">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError("");
              }}
              placeholder="e.g. Dinner at restaurant"
              className="w-full px-4 py-3 rounded-xl border border-border bg-input-bg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
              autoFocus
              id="expense-title-input"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-foreground mb-1.5 text-sm font-medium">
              Amount (₹)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError("");
              }}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full px-4 py-3 rounded-xl border border-border bg-input-bg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
              id="expense-amount-input"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-foreground mb-2 text-sm font-medium">
              Category
            </label>
            <div className="grid grid-cols-4 gap-2" id="category-grid">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all ${
                    category === cat.value
                      ? "border-primary bg-secondary"
                      : "border-border bg-input-bg hover:border-primary/40"
                  }`}
                >
                  <span className="text-xl">{cat.emoji}</span>
                  <span
                    className={`text-[0.65rem] font-medium leading-tight text-center ${
                      category === cat.value
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {cat.label.split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-foreground mb-1.5 text-sm font-medium">
              Note <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
              className="w-full px-4 py-3 rounded-xl border border-border bg-input-bg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
              id="expense-note-input"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-foreground mb-1.5 text-sm font-medium">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={today}
              className="w-full px-4 py-3 rounded-xl border border-border bg-input-bg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
              id="expense-date-input"
            />
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border flex gap-3 shrink-0">
          <Button
            type="button"
            variant="secondary"
            size="md"
            className="flex-1 py-3"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit" size="md" className="flex-1 py-3">
            {isEdit ? "Save Changes" : "Add Expense"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default AddExpenseModal;
