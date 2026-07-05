import { useState } from "react";
import { X } from "lucide-react";

function LinkUserModal({ memberId, onLink, onClose }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = email.trim();
    const emailPattern = /^\S+@\S+\.\S+$/;

    if (!value || !emailPattern.test(value)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      await onLink(memberId, value);
      onClose();
    } catch (err) {
       
        if(err.status === 404){
            setError("User not found.");
        }else{
            setError("Failed to link user.");
        }
        
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-md bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden p-6">
        <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
          <h2 className="text-foreground" style={{ fontSize: "1.1rem", fontWeight: 600 }}>
            Link User
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-1">
              User Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="Enter email to link"
              className="w-full px-4 py-3 rounded-xl border border-border bg-input-bg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition text-sm"
              disabled={isSubmitting}
            />
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            <p className="text-xs text-muted-foreground mt-2">
              The user with this email will be linked to this member profile.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition disabled:opacity-60"
          >
            {isSubmitting ? "Linking..." : "Link User"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LinkUserModal;
