import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import type { WebSocketNotification } from '@/api/types';

interface UseNotificationsOptions {
  autoConnect?: boolean;
  onNotification?: (notification: WebSocketNotification) => void;
}

interface UseNotificationsReturn {
  notifications: WebSocketNotification[];
  unreadCount: number;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const WS_BASE_URL = import.meta.env.VITE_WS_URL ||
  (window.location.protocol === 'https:' ? 'wss://' : 'ws://') +
  (import.meta.env.VITE_API_URL?.replace(/^https?:\/\//, '').replace(/\/api\/v1$/, '') || window.location.host);

export const useNotifications = (options: UseNotificationsOptions = {}): UseNotificationsReturn => {
  const { autoConnect = true, onNotification } = options;
  const { accessToken, isAuthenticated } = useAuthStore();

  const [notifications, setNotifications] = useState<WebSocketNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const connect = useCallback(() => {
    if (!accessToken || !isAuthenticated || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const wsUrl = `${WS_BASE_URL}/api/v1/ws/notifications?token=${accessToken}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[WS] Notifications connected');
        setIsConnected(true);

        // Demander le nombre de non-lus au démarrage
        ws.send(JSON.stringify({ type: 'get_unread_count' }));

        // Ping toutes les 30 secondes pour garder la connexion active
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'notification':
              const notification = data.payload as WebSocketNotification;
              setNotifications((prev) => [notification, ...prev].slice(0, 50)); // Garder max 50 notifications
              setUnreadCount((prev) => prev + 1);
              onNotification?.(notification);
              break;

            case 'unread_count':
              setUnreadCount(data.payload.count || 0);
              break;

            case 'pong':
              // Keep-alive response
              break;

            default:
              console.log('[WS] Unknown message type:', data.type);
          }
        } catch (err) {
          console.error('[WS] Failed to parse message:', err);
        }
      };

      ws.onclose = (event) => {
        console.log('[WS] Notifications disconnected:', event.code, event.reason);
        setIsConnected(false);

        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }

        // Reconnexion automatique si ce n'était pas une fermeture volontaire
        if (event.code !== 1000 && isAuthenticated) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('[WS] Attempting to reconnect...');
            connect();
          }, 5000);
        }
      };

      ws.onerror = (error) => {
        console.error('[WS] Error:', error);
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('[WS] Failed to connect:', err);
    }
  }, [accessToken, isAuthenticated, onNotification]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnect');
      wsRef.current = null;
    }

    setIsConnected(false);
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'mark_read',
        payload: { notification_id: notificationId }
      }));
    }

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'mark_all_read' }));
    }

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && isAuthenticated && accessToken) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, isAuthenticated, accessToken, connect, disconnect]);

  // Disconnect when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      disconnect();
      clearNotifications();
    }
  }, [isAuthenticated, disconnect, clearNotifications]);

  return {
    notifications,
    unreadCount,
    isConnected,
    connect,
    disconnect,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
};
