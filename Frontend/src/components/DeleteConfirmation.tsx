import React from "react";
import { FiAlertTriangle, FiX } from "react-icons/fi";

interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
  isDeleting?: boolean;
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  message = "Are you sure you want to delete",
  itemName,
  isDeleting = false,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* BACKDROP */}
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-2xl border border-[#1C2541]
                     bg-[#0B132B]/95 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#1C2541]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-amber-400/15
                              flex items-center justify-center">
                <FiAlertTriangle className="text-amber-400" size={22} />
              </div>
              <h3 className="text-lg font-semibold text-slate-100">
                {title}
              </h3>
            </div>

            <button
              onClick={onClose}
              disabled={isDeleting}
              className="text-slate-400 hover:text-slate-200 transition
                         disabled:opacity-50"
            >
              <FiX size={22} />
            </button>
          </div>

          {/* BODY */}
          <div className="px-6 py-6">
            <p className="text-slate-400 leading-relaxed">
              {message}{" "}
              {itemName && (
                <span className="text-slate-200 font-medium">
                  “{itemName}”
                </span>
              )}
              <span className="text-amber-400"></span>.
            </p>
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-end gap-3 px-6 py-5
                          border-t border-[#1C2541] bg-[#0B132B]/80">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 rounded-lg border border-[#3A506B]
                         text-slate-300 hover:bg-[#1C2541]
                         transition disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-5 py-2 rounded-lg bg-red-600
                         text-white font-medium
                         hover:bg-red-700 transition
                         disabled:opacity-50
                         flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white
                                   border-t-transparent animate-spin" />
                  Deleting…
                </>
              ) : (
                "Yes, Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeleteConfirmation;
