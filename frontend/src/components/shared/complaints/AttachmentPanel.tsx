import { useRef, useState } from 'react';
import {
  Download,
  FileIcon,
  ImageIcon,
  Loader2,
  Paperclip,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useAttachments,
  useDeleteAttachment,
  useTrackAttachments,
  useTrackUploadAttachment,
  useUploadAttachment,
} from '@/hooks/queries/useAttachments';
import { attachmentsApi, type Attachment } from '@/api/endpoints/attachments.api';
import { getApiErrorMessage } from '@/lib/api-error';

type Props =
  | {
      mode: 'auth';
      complaintId: string;
      canDelete?: boolean;
      canUpload?: boolean;
    }
  | {
      mode: 'track';
      trackingCode: string;
      canUpload?: boolean;
    };

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImage(mime: string) {
  return mime.startsWith('image/');
}

export function AttachmentPanel(props: Props) {
  const authMode = props.mode === 'auth';
  const canUpload = props.canUpload !== false;

  const authQuery = useAttachments(authMode ? props.complaintId : '');
  const trackQuery = useTrackAttachments(!authMode ? props.trackingCode : '');
  const uploadAuth = useUploadAttachment(authMode ? props.complaintId : '');
  const uploadTrack = useTrackUploadAttachment(!authMode ? props.trackingCode : '');
  const deleteAuth = useDeleteAttachment(authMode ? props.complaintId : '');

  const list = (authMode ? authQuery.data : trackQuery.data) ?? [];
  const isLoading = authMode ? authQuery.isLoading : trackQuery.isLoading;

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = async (files: FileList | File[] | null) => {
    if (!files) return;
    const arr = Array.from(files);
    for (const file of arr) {
      if (file.size > MAX_BYTES) {
        toast.error(`${file.name}: 10MB üzerinde olamaz.`);
        continue;
      }
      if (!ALLOWED_MIME.has(file.type)) {
        toast.error(`${file.name}: desteklenmeyen dosya türü.`);
        continue;
      }
      try {
        if (authMode) {
          await uploadAuth.mutateAsync(file);
        } else {
          await uploadTrack.mutateAsync(file);
        }
        toast.success(`${file.name} yüklendi.`);
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Dosya yüklenemedi.'));
      }
    }
  };

  const handleDelete = async (att: Attachment) => {
    if (!authMode) return;
    if (!window.confirm(`"${att.originalName}" silinecek. Emin misiniz?`)) return;
    try {
      await deleteAuth.mutateAsync(att.id);
      toast.success('Dosya silindi.');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Silme başarısız.'));
    }
  };

  const downloadHref = (att: Attachment) =>
    authMode
      ? attachmentsApi.downloadUrl(att.id)
      : attachmentsApi.trackDownloadUrl(props.trackingCode, att.id);

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container">
      <div className="flex items-center gap-xs border-b border-outline-variant/60 px-md py-sm">
        <Paperclip size={16} className="text-primary" />
        <h3 className="font-headline-md text-headline-md text-on-surface">Ekler</h3>
        <span className="ml-auto font-label-md text-label-md text-on-surface-variant">
          {list.length} dosya
        </span>
      </div>

      {canUpload && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            void handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`m-md flex cursor-pointer flex-col items-center justify-center gap-xs rounded-xl border-2 border-dashed px-md py-md text-on-surface-variant transition-colors ${
            isDragging
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-outline-variant hover:border-primary hover:text-primary'
          }`}
        >
          <UploadCloud size={28} />
          <p className="font-body-sm text-body-sm">
            Dosya sürükleyin veya tıklayarak seçin
          </p>
          <p className="font-label-md text-label-md">JPG, PNG, WEBP, PDF — maks. 10MB</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
            onChange={(e) => {
              void handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </div>
      )}

      <div className="px-md pb-md">
        {isLoading ? (
          <div className="flex h-20 items-center justify-center gap-xs text-on-surface-variant">
            <Loader2 size={16} className="animate-spin" />
            <span className="font-body-sm text-body-sm">Yükleniyor...</span>
          </div>
        ) : list.length === 0 ? (
          <p className="py-md text-center font-body-sm text-body-sm text-on-surface-variant">
            Henüz dosya yok.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-xs sm:grid-cols-2">
            {list.map((att) => (
              <li
                key={att.id}
                className="flex items-center gap-sm rounded-lg border border-outline-variant/60 bg-surface-container-low p-sm"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-high text-on-surface-variant">
                  {isImage(att.mimeType) ? <ImageIcon size={18} /> : <FileIcon size={18} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-body-sm text-body-sm text-on-surface" title={att.originalName}>
                    {att.originalName}
                  </p>
                  <p className="font-label-md text-label-md text-on-surface-variant">
                    {formatSize(Number(att.sizeBytes))} • {new Date(att.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <a
                  href={downloadHref(att)}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg p-xs text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
                  title="İndir / Önizle"
                >
                  <Download size={16} />
                </a>
                {authMode && (props.canDelete ?? true) && (
                  <button
                    type="button"
                    onClick={() => handleDelete(att)}
                    className="rounded-lg p-xs text-on-surface-variant hover:bg-error-container/40 hover:text-error"
                    title="Sil"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
