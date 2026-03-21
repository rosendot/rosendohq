"use client";

import { useEffect } from "react";
import { X, Loader2 } from "lucide-react";

const MAX_WIDTH_CLASSES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  "2xl": "max-w-2xl",
};

const SUBMIT_COLORS = {
  blue: "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50",
  violet: "bg-violet-600 hover:bg-violet-700 disabled:bg-violet-600/50",
  emerald: "bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50",
  amber: "bg-amber-600 hover:bg-amber-700 disabled:bg-amber-600/50",
};

interface BaseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  subtitle?: string;
  submitLabel?: string;
  loadingLabel?: string;
  loading?: boolean;
  error?: string | null;
  submitDisabled?: boolean;
  submitColor?: "blue" | "violet" | "emerald" | "amber";
  submitIcon?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "2xl";
  closeOnOverlayClick?: boolean;
}

export default function BaseFormModal({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  subtitle,
  submitLabel = "Save",
  loadingLabel = "Saving...",
  loading = false,
  error = null,
  submitDisabled = false,
  submitColor = "blue",
  submitIcon,
  maxWidth = "lg",
  closeOnOverlayClick = true,
}: BaseFormModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = () => {
    if (closeOnOverlayClick && !loading) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
      onClick={handleOverlayClick}
    >
      <div
        className={`${MAX_WIDTH_CLASSES[maxWidth]} my-8 max-h-[90vh] w-full overflow-y-auto rounded-lg border border-gray-800 bg-gray-900`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-800 p-4">
          <div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-gray-400">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-white"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 p-4">
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-xs text-red-400">
              {error}
            </div>
          )}

          {children}

          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-lg bg-gray-800 px-4 py-2 font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || submitDisabled}
              className={`flex-1 rounded-lg px-4 py-2 font-medium text-white transition-colors disabled:cursor-not-allowed ${SUBMIT_COLORS[submitColor]}`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {loadingLabel}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {submitIcon}
                  {submitLabel}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
