'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Home, Compass, Plus, Menu, X } from 'lucide-react';

export default function Navbar() {
  const path = usePathname();
  const [user,    setUser]    = useState('');
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState('');
  const [menu,    setMenu]    = useState(false);
  const [err,     setErr]     = useState('');

  useEffect(() => {
    // migrate old key only if new key not already set
    const newKey = localStorage.getItem('trenchhub_user');
    if (!newKey) {
      const old = localStorage.getItem('trenchmunity_user');
      if (old) { localStorage.setItem('trenchhub_user', old); localStorage.removeItem('trenchmunity_user'); }
    }
    const s = localStorage.getItem('trenchhub_user');
    if (s) setUser(s);
    else   setEditing(true);
  }, []);

  const save = () => {
    const v = draft.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 25);
    if (v.length < 2) { setErr('At least 2 characters'); return; }
    localStorage.setItem('trenchhub_user', v);
    setUser(v);
    setEditing(false);
    setErr('');
  };

  const navLinks = [
    { href: '/',        label: 'Home',    Icon: Home    },
    { href: '/explore', label: 'Explore', Icon: Compass },
  ];

  return (
    <>
      {/* ── Username modal ── */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-trench-card border border-trench-border2 rounded-2xl p-8 w-full max-w-sm shadow-2xl scale-in">
            <div className="mb-5">
                <h2 className="text-lg font-bold text-white leading-tight">Welcome to <span className="text-trench-accent">Trenchhub</span></h2>
                <p className="text-[12px] text-trench-muted">Pick a username to get started</p>
            </div>
            <p className="text-trench-dim text-sm mb-5 leading-relaxed">
              This is how you'll appear across all communities you join or create.
            </p>
            <label className="label">Username</label>
            <input
              className="input mb-1"
              placeholder="e.g. crypto_degen"
              value={draft}
              onChange={e => { setDraft(e.target.value); setErr(''); }}
              onKeyDown={e => e.key === 'Enter' && save()}
              maxLength={25}
              autoFocus
            />
            {err
              ? <p className="text-xs text-red-400 mb-4">{err}</p>
              : <p className="text-xs text-trench-muted mb-4">Letters, numbers, _ and - · 2–25 chars</p>
            }
            <button className="btn-primary w-full" onClick={save} disabled={draft.trim().length < 2}>
              Enter the Trenches
            </button>
          </div>
        </div>
      )}

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-40 bg-trench-bg/90 backdrop-blur-md border-b border-trench-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

          {/* Wordmark */}
          <Link href="/" className="flex items-center shrink-0">
            <span className="font-bold text-[17px] tracking-tight">
              <span className="text-white">Trench</span><span className="text-trench-accent">hub</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden sm:flex items-center gap-0.5">
            {navLinks.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                  path === href
                    ? 'text-white bg-white/8'
                    : 'text-trench-dim hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={14} />
                {label}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/create"
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold border transition-all duration-150 ${
                path === '/create'
                  ? 'bg-trench-accent border-trench-accent text-white'
                  : 'border-trench-accent/50 text-trench-accent hover:bg-trench-accent hover:text-white'
              }`}
            >
              <Plus size={13} />
              Create
            </Link>

            {user ? (
              <button
                onClick={() => { setDraft(user); setEditing(true); }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-trench-border hover:border-trench-border2 transition-all"
              >
                <div className="w-5 h-5 rounded-full bg-trench-accent flex items-center justify-center text-[10px] font-bold text-white uppercase">
                  {user[0]}
                </div>
                <span className="text-trench-text hidden sm:inline text-[13px] font-medium">{user}</span>
              </button>
            ) : (
              <button onClick={() => setEditing(true)} className="btn-secondary text-xs py-1.5 px-3">
                Set Username
              </button>
            )}

            <button
              className="sm:hidden p-2 text-trench-muted hover:text-white transition-colors"
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menu && (
          <div className="sm:hidden border-t border-trench-border bg-trench-surface px-4 py-3 flex flex-col gap-1 fade-up">
            {navLinks.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenu(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  path === href ? 'text-white bg-white/6' : 'text-trench-dim hover:text-white'
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
            <Link
              href="/create"
              onClick={() => setMenu(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-trench-accent hover:bg-trench-accent/10 transition-colors"
            >
              <Plus size={15} />
              Create Community
            </Link>
          </div>
        )}
      </nav>
    </>
  );
}
