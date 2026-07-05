import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { GROUP_EMOJIS } from "../../utils/constants";
import Modal from "../Modal";
import Button from "../Button";

function AddGroupModal({ onAdd, onClose }) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🏠");
  const [description, setDescription] = useState("");
  const [memberNames, setMemberNames] = useState([""]);
  const [error, setError] = useState("");

  const addMemberField = () => setMemberNames((prev) => [...prev, ""]);

  const removeMemberField = (i) =>
    setMemberNames((prev) => prev.filter((_, idx) => idx !== i));

  const updateMemberName = (i, value) => {
    setMemberNames((prev) =>
      prev.map((memberName, idx) => (idx === i ? value : memberName)),
    );
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Group name is required");
      return;
    }

    const validNames = memberNames
      .map((memberName) => memberName.trim())
      .filter((memberName) => memberName);

    try {
      await onAdd({
        name: name.trim(),
        emoji,
        description: description.trim(),
        names: validNames,
      });
      onClose();
    } catch {
      setError("Unable to create group");
    }
  };

  return (
    <Modal title="Create Group" onClose={onClose}>
      <form onSubmit={handleSubmit} className="overflow-y-auto">
        <div className="px-6 py-5 space-y-5">
          {/* Emoji picker */}
          <div>
            <label className="block text-foreground mb-2 text-sm font-medium">
              Icon
            </label>
            <div className="flex gap-2 flex-wrap" id="emoji-picker">
              {GROUP_EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-11 h-11 rounded-xl border text-xl transition-all ${
                    emoji === e
                      ? "border-primary bg-secondary shadow-sm"
                      : "border-border bg-input-bg hover:border-primary/40"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Group name */}
          <div>
            <label className="block text-foreground mb-1.5 text-sm font-medium">
              Group Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder="e.g. My Flat, College Hostel, Trip to Goa"
              className="w-full px-4 py-3 rounded-xl border border-border bg-input-bg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
              autoFocus
              id="group-name-input"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-foreground mb-1.5 text-sm font-medium">
              Description{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this group for?"
              className="w-full px-4 py-3 rounded-xl border border-border bg-input-bg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
              id="group-desc-input"
            />
          </div>

          {/* Members by email */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-foreground text-sm font-medium">
                Add Members by Name
              </label>
              <button
                type="button"
                onClick={addMemberField}
                className="flex items-center gap-1.5 text-primary hover:opacity-70 transition text-xs font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                Add another
              </button>
            </div>
            <p className="text-muted-foreground mb-3 text-xs">
              You are automatically included as a member. Add the names of other
              members.
            </p>
            <div className="space-y-3">
              {memberNames.map((memberName, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={memberName}
                    onChange={(e) => updateMemberName(i, e.target.value)}
                    placeholder="Member name"
                    className="flex-1 px-3 py-2.5 rounded-xl border border-border bg-input-bg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition text-sm"
                  />
                  {memberNames.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMemberField(i)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 transition shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
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
          <Button type="submit" className="flex-1 py-3">
            Create Group
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default AddGroupModal;
