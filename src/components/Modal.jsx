import { X } from 'lucide-react';

function Modal({ title, onClose, children, maxWidth = 'sm:max-w-lg' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" id="modal-overlay">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${maxWidth} bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
          <h2 className="text-foreground text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            id="modal-close-btn"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default Modal;
