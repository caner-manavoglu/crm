import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { connectSocket, disconnectSocket } from '@/api/socket';
import { useAuthStore } from '@/stores/auth.store';
import { useNotificationsStore } from '@/stores/notifications.store';

export function useSocket() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const addNotification = useNotificationsStore((s) => s.addNotification);
  const qc = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    const socket = connectSocket(accessToken);

    socket.on('complaint:assigned', (payload) => {
      addNotification({ type: 'assignment', message: `Yeni şikayet atandı: ${payload.title}`, payload });
      qc.invalidateQueries({ queryKey: ['assignments', 'mine'] });
      qc.invalidateQueries({ queryKey: ['complaints'] });
    });

    socket.on('complaint:transferred', (payload) => {
      addNotification({ type: 'transfer', message: `Şikayet transfer edildi`, payload });
      qc.invalidateQueries({ queryKey: ['assignments', 'mine'] });
    });

    socket.on('notification:new', (payload) => {
      addNotification({ type: payload.type || 'info', message: payload.message, payload });
    });

    socket.on('availability:updated', () => {
      qc.invalidateQueries({ queryKey: ['staff-availability'] });
    });

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, accessToken, addNotification, qc]);
}
