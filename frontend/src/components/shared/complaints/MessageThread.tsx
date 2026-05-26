import { useEffect, useRef, useState } from 'react';
import { Loader2, Send, Lock, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useMessages, usePostMessage } from '@/hooks/queries/useMessages';
import { useAuthStore } from '@/stores/auth.store';
import { getSocket, connectSocket } from '@/api/socket';
import { getApiErrorMessage } from '@/lib/api-error';
import { messageKeys } from '@/hooks/queries/useMessages';
import { useQueryClient } from '@tanstack/react-query';

type Props = {
  complaintId: string;
};

function formatTime(value: string) {
  try {
    return new Date(value).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
}

export function MessageThread({ complaintId }: Props) {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const isStaffOrAdmin = user?.role === 'admin' || user?.role === 'staff';

  const { data: messages = [], isLoading } = useMessages(complaintId);
  const postMessage = usePostMessage(complaintId);
  const qc = useQueryClient();

  const [body, setBody] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const listEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length]);

  // Socket aboneliği: thread odasına gir, message:new gelince refetch.
  useEffect(() => {
    if (!complaintId || !accessToken) return;
    const socket = getSocket();
    if (!socket.connected) connectSocket(accessToken);

    const subscribe = () => {
      socket.emit('complaint:subscribe', { complaintId });
    };
    if (socket.connected) subscribe();
    else socket.once('connect', subscribe);

    const handle = () => {
      qc.invalidateQueries({ queryKey: messageKeys.thread(complaintId) });
    };
    socket.on('message:new', handle);

    return () => {
      socket.emit('complaint:unsubscribe', { complaintId });
      socket.off('message:new', handle);
    };
  }, [complaintId, accessToken, qc]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    try {
      await postMessage.mutateAsync({
        body: trimmed,
        ...(isStaffOrAdmin && isInternal ? { isInternal: true } : {}),
      });
      setBody('');
      setIsInternal(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Mesaj gönderilemedi.'));
    }
  };

  return (
    <div className="flex h-full min-h-[20rem] flex-col rounded-xl border border-outline-variant bg-surface-container">
      <div className="flex items-center gap-xs border-b border-outline-variant/60 px-md py-sm">
        <MessageCircle size={16} className="text-primary" />
        <h3 className="font-headline-md text-headline-md text-on-surface">Mesajlaşma</h3>
        <span className="ml-auto font-label-md text-label-md text-on-surface-variant">
          {messages.length} mesaj
        </span>
      </div>

      <div className="flex-1 space-y-sm overflow-y-auto px-md py-sm max-h-[28rem]">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center gap-xs text-on-surface-variant">
            <Loader2 size={16} className="animate-spin" />
            <span className="font-body-sm text-body-sm">Yükleniyor...</span>
          </div>
        ) : messages.length === 0 ? (
          <p className="py-md text-center font-body-sm text-body-sm text-on-surface-variant">
            Henüz mesaj yok. İlk mesajı gönderin.
          </p>
        ) : (
          messages.map((m) => {
            const isMine = m.sender?.id === user?.id;
            const senderLabel = m.sender
              ? `${m.sender.name} ${m.sender.surname}`
              : 'Sistem';
            const roleLabel =
              m.sender?.role === 'admin'
                ? 'Yönetici'
                : m.sender?.role === 'staff'
                  ? 'Personel'
                  : m.sender?.role === 'customer'
                    ? 'Müşteri'
                    : '';
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-md py-sm shadow-sm ${
                    isMine
                      ? 'bg-primary text-on-primary'
                      : m.isInternal
                        ? 'border border-tertiary/40 bg-tertiary/10 text-on-surface'
                        : 'bg-surface-container-high text-on-surface'
                  }`}
                >
                  <div className="mb-xs flex items-center gap-xs">
                    <span className="font-label-md text-label-md uppercase opacity-80">
                      {senderLabel}{roleLabel ? ` • ${roleLabel}` : ''}
                    </span>
                    {m.isInternal && (
                      <span className="inline-flex items-center gap-xs font-label-md text-label-md text-tertiary">
                        <Lock size={10} /> İç Not
                      </span>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap font-body-sm text-body-sm">{m.body}</p>
                  <p className="mt-xs text-right font-label-md text-label-md opacity-70">
                    {formatTime(m.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={listEndRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="flex flex-col gap-xs border-t border-outline-variant/60 px-md py-sm"
      >
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Mesajınızı yazın..."
          rows={2}
          className="w-full resize-none rounded-lg border border-outline-variant bg-surface-dim px-sm py-xs font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
        <div className="flex items-center justify-between gap-xs">
          {isStaffOrAdmin ? (
            <label className="inline-flex cursor-pointer items-center gap-xs font-label-md text-label-md text-on-surface-variant">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="h-4 w-4 accent-tertiary"
              />
              <Lock size={12} /> İç not (müşteri görmez)
            </label>
          ) : (
            <span />
          )}
          <button
            type="submit"
            disabled={!body.trim() || postMessage.isPending}
            className="inline-flex items-center gap-xs rounded-lg bg-primary px-md py-xs font-label-md text-label-md font-semibold uppercase text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {postMessage.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Gönder
          </button>
        </div>
      </form>
    </div>
  );
}
