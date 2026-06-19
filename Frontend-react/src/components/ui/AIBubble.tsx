
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bot } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Bulle IA flottante et draggable — identique au GlobalAIBubble Flutter.
 * Visible uniquement pour les patients authentifiés.
 * IMPORTANT : tous les hooks sont appelés AVANT tout return conditionnel.
 */
export function AIBubble() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ── Tous les hooks en premier, sans condition ──────────────────────────
  const [pos, setPos] = useState({ right: 24, bottom: 96 });
  const [isDragged, setIsDragged] = useState(false);
  const [showLabel, setShowLabel] = useState(true);
  const dragging = useRef(false);
  const startMouse = useRef({ x: 0, y: 0 });
  const startPos = useRef({ right: 24, bottom: 96 });
  const bubbleRef = useRef<HTMLDivElement>(null);

  // Masquer le label après 4s au montage
  useEffect(() => {
    const t = setTimeout(() => setShowLabel(false), 4000);
    return () => clearTimeout(t);
  }, []);

  // Réafficher le label à chaque changement de page
  useEffect(() => {
    setShowLabel(true);
    const t = setTimeout(() => setShowLabel(false), 3000);
    return () => clearTimeout(t);
  }, [location.pathname]);

  // Gestion drag souris
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - startMouse.current.x;
      const dy = e.clientY - startMouse.current.y;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) setIsDragged(true);
      setPos({
        right:  Math.max(8, Math.min(window.innerWidth  - 68, startPos.current.right  - dx)),
        bottom: Math.max(8, Math.min(window.innerHeight - 68, startPos.current.bottom - dy)),
      });
    };
    const onMouseUp = () => { dragging.current = false; };
    const onTouchMove = (e: TouchEvent) => {
      if (!dragging.current) return;
      const t = e.touches[0];
      const dx = t.clientX - startMouse.current.x;
      const dy = t.clientY - startMouse.current.y;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) setIsDragged(true);
      setPos({
        right:  Math.max(8, Math.min(window.innerWidth  - 68, startPos.current.right  - dx)),
        bottom: Math.max(8, Math.min(window.innerHeight - 68, startPos.current.bottom - dy)),
      });
      e.preventDefault();
    };
    const onTouchEnd = () => { dragging.current = false; };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []); // pas de dépendances — on lit les refs

  // ── Returns conditionnels APRÈS tous les hooks ─────────────────────────
  if (!user || user.role !== 'patient') return null;
  if (location.pathname.includes('/ai-agent')) return null;

  // ── Handlers ───────────────────────────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    setIsDragged(false);
    startMouse.current = { x: e.clientX, y: e.clientY };
    startPos.current = { ...pos };
    e.preventDefault();
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    dragging.current = true;
    setIsDragged(false);
    startMouse.current = { x: t.clientX, y: t.clientY };
    startPos.current = { ...pos };
  };

  const handleClick = () => {
    if (!isDragged) navigate('/patient/ai-agent');
  };

  // ── Rendu ──────────────────────────────────────────────────────────────
  return (
    <div
      ref={bubbleRef}
      className="fixed z-[9999] flex flex-col items-center gap-2 select-none"
      style={{ right: pos.right, bottom: pos.bottom }}
    >
      {/* Label "Besoin d'aide ?" */}
      <div
        className={`transition-all duration-300 ${
          showLabel ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'
        }`}
      >
        <div className="bg-white rounded-xl px-3 py-1.5 shadow-dropdown border border-slate-100">
          <p className="text-xs font-semibold text-primary whitespace-nowrap">Besoin d'aide ?</p>
        </div>
        <div className="flex justify-center">
          <div className="w-2 h-2 bg-white border-r border-b border-slate-100 rotate-45 -mt-1" />
        </div>
      </div>

      {/* Bouton FAB */}
      <button
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onClick={handleClick}
        className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/40 border-2 border-white hover:bg-primary-dark active:scale-95 transition-all duration-150 cursor-grab active:cursor-grabbing"
        title="Assistant IA"
      >
        <Bot className="w-7 h-7" />
      </button>
    </div>
  );
}
