/**
 * Hook pour la connexion WebSocket à la messagerie.
 * - Consultation : ws/chat/{consultationId}/?token=JWT
 * - Direct       : ws/direct/?token=JWT
 *
 * Reconnexion automatique avec backoff exponentiel (max 30s).
 */
import { useEffect, useRef, useCallback } from 'react';

export interface WSMessage {
  id: number;
  consultation: number | null;
  expediteur: number;
  expediteur_nom: string;
  destinataire: number;
  destinataire_nom: string;
  contenu: string;
  date_envoi: string;
  lu: boolean;
  type_message?: string;
}

interface UseMessagerieWebSocketOptions {
  consultationId?: number;
  isDirect?: boolean;         // true → connexion ws/direct/
  enabled?: boolean;
  onMessage: (msg: WSMessage) => void;
}

const WS_BASE_URL = (() => {
  const api = import.meta.env.VITE_API_URL as string | undefined;
  if (api) {
    return api
      .replace(/^https:\/\//, 'wss://')
      .replace(/^http:\/\//, 'ws://')
      .replace(/\/api\/?$/, '');
  }
  const isLocal =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';
  return isLocal ? 'ws://localhost:8000' : 'wss://backend-x5yj.onrender.com';
})();

function getToken(): string | null {
  return (
    localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
  );
}

function buildWsUrl(
  consultationId?: number,
  isDirect?: boolean,
): string | null {
  const token = getToken();
  if (!token) return null;

  if (isDirect) {
    return `${WS_BASE_URL}/ws/direct/?token=${token}`;
  }
  if (consultationId != null) {
    return `${WS_BASE_URL}/ws/chat/${consultationId}/?token=${token}`;
  }
  return null;
}

export function useMessagerieWebSocket({
  consultationId,
  isDirect,
  enabled = true,
  onMessage,
}: UseMessagerieWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const retryDelayRef = useRef(1000); // ms, backoff
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const onMessageRef = useRef(onMessage);

  // Garder la référence du callback à jour sans déclencher de reconnexion
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const connect = useCallback(() => {
    if (!isMountedRef.current || !enabled) return;

    const url = buildWsUrl(consultationId, isDirect);
    if (!url) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      retryDelayRef.current = 1000; // reset backoff
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WSMessage;
        onMessageRef.current(data);
      } catch {
        // message malformé — ignorer
      }
    };

    ws.onclose = () => {
      if (!isMountedRef.current) return;
      // Reconnexion avec backoff exponentiel (max 30s)
      retryTimerRef.current = setTimeout(() => {
        retryDelayRef.current = Math.min(retryDelayRef.current * 2, 30_000);
        connect();
      }, retryDelayRef.current);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [consultationId, isDirect, enabled]);

  useEffect(() => {
    isMountedRef.current = true;

    if (enabled) {
      connect();
    }

    return () => {
      isMountedRef.current = false;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [connect, enabled]);

  /** Envoyer un message via le WebSocket ouvert (utilisé uniquement pour les consultations). */
  const sendWsMessage = useCallback(
    (payload: { contenu: string; destinataire?: number }) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(payload));
        return true;
      }
      return false;
    },
    [],
  );

  return { sendWsMessage };
}
