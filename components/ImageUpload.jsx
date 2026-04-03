'use client';

import { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

export default function ImageUpload({ label, hint, aspect = 'banner', value, onChange }) {
  const ref      = useRef();
  const [drag,   setDrag]   = useState(false);
  const [loading,setLoading]= useState(false);
  const [err,    setErr]    = useState('');

  const isBanner = aspect === 'banner';

  const upload = async (file) => {
    if (!file) return;
    setLoading(true);
    setErr('');
    try {
      const form = new FormData();
      form.append('file', file);
      const res  = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) { setErr(data.error || 'Upload failed'); return; }
      onChange(data.url);
    } catch {
      setErr('Upload failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    upload(e.dataTransfer.files[0]);
  };

  return (
    <div>
      <label className="label">{label}</label>

      {value ? (
        <div className={`relative rounded-xl overflow-hidden border border-trench-border group ${isBanner ? 'h-32' : 'h-24 w-24'}`}>
          <img src={value} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => ref.current?.click()}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Change image"
            >
              <Upload size={14} />
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-red-500/40 text-white transition-colors"
              title="Remove image"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`upload-zone flex flex-col items-center justify-center gap-2 text-center cursor-pointer
            ${isBanner ? 'h-32' : 'h-24 w-24'} ${drag ? 'drag' : ''} ${loading ? 'opacity-60 pointer-events-none' : ''}`}
          onClick={() => ref.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
        >
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-4 h-4 border-2 border-trench-accent border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-trench-muted">Uploading...</span>
            </div>
          ) : (
            <>
              <ImageIcon size={isBanner ? 20 : 16} className="text-trench-muted" />
              {isBanner && (
                <>
                  <p className="text-xs font-medium text-trench-dim">Drop image or click to upload</p>
                  {hint && <p className="text-[11px] text-trench-muted">{hint}</p>}
                </>
              )}
            </>
          )}
        </div>
      )}

      {err && <p className="text-xs text-red-400 mt-1">{err}</p>}

      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={e => upload(e.target.files[0])}
      />
    </div>
  );
}
