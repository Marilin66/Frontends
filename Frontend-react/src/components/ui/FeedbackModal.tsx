// Composant réutilisable pour remplacer alert() / confirm() natifs
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Trash2, XCircle } from 'lucide-react';

interface ErrorModalProps {
  message: string;
  onClose: () => void;
}

export function ErrorModal({ message, onClose }: ErrorModalProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-red-50 border border-red-100 rounded-xl mx-auto">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-semibold text-slate-900">Erreur</h3>
              <p className="text-sm text-slate-500 whitespace-pre-line">{message}</p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
            >
              Fermer
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface SuccessModalProps {
  message: string;
  onClose: () => void;
}

export function SuccessModal({ message, onClose }: SuccessModalProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-xl mx-auto">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-semibold text-slate-900">Succès</h3>
              <p className="text-sm text-slate-500">{message}</p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition"
            >
              OK
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmClass?: string;
  icon?: 'delete' | 'warning' | 'check';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirmer',
  confirmClass = 'bg-red-500 hover:bg-red-600',
  icon = 'delete',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const icons = {
    delete:  { el: Trash2,      bg: 'bg-red-50 border-red-100',     color: 'text-red-500' },
    warning: { el: AlertCircle, bg: 'bg-amber-50 border-amber-100',  color: 'text-amber-500' },
    check:   { el: CheckCircle, bg: 'bg-green-50 border-green-100',  color: 'text-green-500' },
  };
  const { el: Icon, bg, color } = icons[icon];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5"
          >
            <div className={`flex items-center justify-center w-12 h-12 ${bg} border rounded-xl mx-auto`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-semibold text-slate-900">{title}</h3>
              <p className="text-sm text-slate-500">{message}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
              >
                Annuler
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition ${confirmClass}`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
