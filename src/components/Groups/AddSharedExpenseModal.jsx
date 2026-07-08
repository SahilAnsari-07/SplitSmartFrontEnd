import { useState } from "react";
import { CATEGORIES } from "../../utils/constants";
import Modal from "../Modal";
import Button from "../Button";

function AddSharedExpenseModal({ group, currentUserId, onAdd, onClose }) {
  const today = new Date().toISOString().split("T")[0];
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [date, setDate] = useState(today);
  const [paidById, setPaidById] = useState(currentUserId);
  const [splitBetweenIds, setSplitBetweenIds] = useState(
    group?.members?.map((m) => m.id) || [],
  );
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleMember = (id) => {
    setSplitBetweenIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    if (!title.trim()) {
      setError("Please enter a title");
      return;
    }
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    if (splitBetweenIds.length === 0) {
      setError("Select at least one member to split with");
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd({
        title: title.trim(),
        amount: amt,
        category,
        date,
        paidById,
        splitBetweenIds,
      });
      onClose();
    } catch {
      setError("Unable to save expense");
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title={`Add to ${group?.name || "Group"}`} onClose={onClose}>
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
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-foreground mb-2 text-sm font-medium">
              Category
            </label>
            <div className="grid grid-cols-4 gap-2">
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
            />
          </div>

          {/* Paid by */}
          <div>
            <label className="block text-foreground mb-1.5 text-sm font-medium">
              Paid by
            </label>
            <select
              value={paidById}
              onChange={(e) =>
                setPaidById(Number(e.target.value) || e.target.value)
              }
              className="w-full px-4 py-3 rounded-xl border border-border bg-input-bg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
            >
              {group?.members?.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.id === currentUserId ? `You (${m.name})` : m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Split between */}
          <div>
            <label className="block text-foreground mb-2 text-sm font-medium">
              Split between ({splitBetweenIds.length} selected)
            </label>
            <div className="space-y-2">
              {group?.members?.map((m) => {
                const selected = splitBetweenIds.includes(m.id);
                const shareAmt =
                  splitBetweenIds.length > 0 && parseFloat(amount) > 0
                    ? (parseFloat(amount) / splitBetweenIds.length).toFixed(2)
                    : "0";
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleMember(m.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                      selected
                        ? "border-primary bg-secondary"
                        : "border-border bg-input-bg hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                        style={{ background: "#6366f1" }}
                      >
                        {m.name[0].toUpperCase()}
                      </div>
                      <span className="text-foreground text-sm">
                        {m.id === currentUserId ? "You" : m.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selected && parseFloat(amount) > 0 && (
                        <span className="text-muted-foreground text-xs">
                          ₹{shareAmt}
                        </span>
                      )}
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          selected
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        }`}
                      >
                        {selected && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {parseFloat(amount) > 0 && splitBetweenIds.length > 0 && (
              <p className="text-muted-foreground mt-2 text-xs">
                ₹{(parseFloat(amount) / splitBetweenIds.length).toFixed(2)} per
                person (equal split)
              </p>
            )}
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
            className="flex-1 py-3"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1 py-3" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Add Expense"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default AddSharedExpenseModal;
