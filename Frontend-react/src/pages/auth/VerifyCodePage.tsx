// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui';
import { ArrowLeft, CheckCircle, AlertCircle, MessageSquare, Loader2 } from 'lucide-react';

export default function VerifyCodePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { autoLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isAutoConnecting, setIsAutoConnecting] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    // Récupérer les infos stockées lors de l'inscription
    const savedEmail = location.state?.email || sessionStorage.getItem('verification_email') || '';
    const savedPhone = location.state?.telephone || sessionStorage.getItem('verification_phone') || '';
    setEmail(savedEmail);
    setPhone(savedPhone);

    if (!savedEmail) {
      setError('Aucun e-mail trouvé. Veuillez retourner à l\'inscription.');
    }
  }, [location.state]);

  const handleChange = (index: number, val: string) => {
    if (isNaN(Number(val))) return; // N'accepter que les chiffres
    const newCode = [...code];
    newCode[index] = val.slice(-1); // Ne garder que le dernier caractère saisi
    setCode(newCode);

    // Auto-focus vers le champ suivant
    if (val && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Si retour arrière et champ vide, focus sur le champ précédent
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pasteData)) return; // Vérifier que c'est bien 6 chiffres

    const digits = pasteData.split('');
    setCode(digits);
    inputRefs[5].current?.focus(); // Focus sur le dernier champ
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Veuillez saisir les 6 chiffres du code.');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/accounts/verify-code/', {
        email: email,
        code: fullCode,
      });

      sessionStorage.removeItem('verification_email');
      sessionStorage.removeItem('verification_phone');
      setSuccess(true);

      // If tokens are present, perform auto-login for a seamless experience
      if (response && response.access && response.refresh) {
        setIsAutoConnecting(true);
        await autoLogin({
          access: response.access,
          refresh: response.refresh,
          user: response.user
        });
        setTimeout(() => {
          navigate('/');
        }, 1800);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Le code saisi est incorrect ou a expiré.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setError('');
    setResendSuccess(false);
    try {
      setResendLoading(true);
      // Endpoint simulé ou réel pour ré-envoyer le code
      await api.post('/accounts/resend-code/', { email });
      setResendSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Impossible de renvoyer le code. Veuillez réessayer.');
    } finally {
      setResendLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-5 py-6">
        <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-100/50">
          <CheckCircle className="w-8 h-8 text-emerald-600 animate-bounce" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Compte validé avec succès !</h2>
          {isAutoConnecting ? (
            <div className="flex flex-col items-center justify-center mt-4 space-y-2">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <p className="text-sm font-semibold text-primary">Connexion automatique en cours...</p>
            </div>
          ) : (
            <p className="text-sm text-slate-500 mt-2">
              Félicitations, votre compte Hopitel est désormais actif. Vous pouvez maintenant vous connecter.
            </p>
          )}
        </div>
        {!isAutoConnecting && (
          <div className="pt-4">
            <Link
              to="/login"
              className="inline-flex w-full justify-center items-center h-12 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
            >
              Se connecter
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-start">
        <Link to="/register" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-widest">
          <ArrowLeft className="w-3.5 h-3.5" />
          Retour
        </Link>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Validation du compte</h2>
        <p className="text-sm text-slate-500 font-medium mt-2">
          Un code de vérification à 6 chiffres a été envoyé par <strong>Email</strong> ou <strong>WhatsApp</strong>.
        </p>
        {email && (
          <p className="text-xs text-slate-400 font-semibold bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full inline-block mt-3">
            {email} {phone && `• ${phone}`}
          </p>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 animate-shake">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {resendSuccess && (
        <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-700">
          <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="font-medium">Un nouveau code vous a été renvoyé !</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between gap-2 max-w-sm mx-auto" onPaste={handlePaste}>
          {code.map((digit, idx) => (
            <input
              key={idx}
              ref={inputRefs[idx]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all bg-white text-slate-900"
            />
          ))}
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
          isLoading={loading}
          disabled={code.join('').length !== 6}
        >
          Valider mon compte
        </Button>
      </form>

      <div className="text-center pt-2">
        <p className="text-xs text-slate-500 font-semibold">
          Vous n'avez pas reçu le code ?{' '}
          <button
            onClick={handleResend}
            disabled={resendLoading || !email}
            className="text-primary hover:underline font-bold focus:outline-none disabled:opacity-50"
          >
            {resendLoading ? 'Envoi...' : 'Renvoyer le code'}
          </button>
        </p>
      </div>
    </div>
  );
}
