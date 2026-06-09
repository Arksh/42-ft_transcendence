import { useState, useEffect } from 'react';
import { api } from '../api.js';

const cardClass =
  'rounded border-2 border-[#555] bg-[#222] p-3 sm:p-4';
const sectionTitle =
  'mb-2 text-xs font-bold uppercase tracking-[2px] text-[#FFD700]';
const inputClass =
  'box-border w-full rounded border-2 border-[#555] bg-[#333] p-2 font-mono text-[13px] text-white';
const baseBtn =
  'cursor-pointer rounded border-0 px-3 py-2 text-center font-mono text-[12px] font-bold text-white';

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch {
    return '—';
  }
}

function Avatar({ url, username }) {
  const [broken, setBroken] = useState(false);
  if (url && !broken) {
    return (
      <img
        src={url}
        alt={username}
        onError={() => setBroken(true)}
        className="h-20 w-20 rounded-full border-2 border-[#FFD700] bg-[#333] object-cover sm:h-24 sm:w-24"
      />
    );
  }
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#FFD700] bg-[#333] text-2xl font-bold text-[#FFD700] sm:h-24 sm:w-24">
      {(username?.[0] ?? '?').toUpperCase()}
    </div>
  );
}

export default function Profile({ username, onBack }) {
  const [user, setUser] = useState(null);
  const [allAchievements, setAllAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editing, setEditing] = useState(false);
  const [editAvatar, setEditAvatar] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [u, achievements] = await Promise.all([
        api.getPlayer(username),
        api.getAchievements(),
      ]);
      if (u?.error) {
        setError(u.error);
      } else {
        setUser(u);
        setEditAvatar(u.avatarUrl ?? '');
        setEditEmail(u.email ?? '');
      }
      setAllAchievements(Array.isArray(achievements) ? achievements : []);
    } catch {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [username]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const body = {};
    if (editEmail && editEmail !== user.email) body.email = editEmail;
    if (editAvatar !== (user.avatarUrl ?? '')) body.avatarUrl = editAvatar;
    if (Object.keys(body).length === 0) {
      setEditing(false);
      setSaving(false);
      return;
    }
    try {
      const res = await api.updateUser(username, body);
      if (res?.error) {
        setError(res.error);
      } else {
        setUser({ ...user, ...res });
        setEditing(false);
      }
    } catch {
      setError('Connection error');
    } finally {
      setSaving(false);
    }
  }

  function handleCancelEdit() {
    setEditAvatar(user.avatarUrl ?? '');
    setEditEmail(user.email ?? '');
    setEditing(false);
    setError(null);
  }

  if (loading) {
    return (
      <div className="mx-auto my-4 max-w-[700px] rounded-xl border-2 border-[#FF6B6B] bg-[#1a1a2e] p-6 text-center font-mono text-[#aaa]">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto my-4 max-w-[700px] rounded-xl border-2 border-[#FF6B6B] bg-[#1a1a2e] p-6 font-mono text-white">
        <div className="mb-4 text-center text-[#FF6B6B]">{error ?? 'Profile not available'}</div>
        <button onClick={onBack} className={`${baseBtn} bg-[#333] w-full`}>Back</button>
      </div>
    );
  }

  const stats = user.stats ?? { gamesPlayed: 0, wins: 0, losses: 0, elo: 1000 };
  const winRate = stats.gamesPlayed > 0
    ? Math.round((stats.wins / stats.gamesPlayed) * 100)
    : 0;

  const unlockedNameIds = new Set(
    (user.userAchievements ?? []).map(ua => ua.achievement?.nameId ?? ua.achievementNameId)
  );
  const unlocked = user.userAchievements ?? [];
  const locked = allAchievements.filter(a => !unlockedNameIds.has(a.nameId));

  const matches = [...(user.matchPlayers ?? [])].sort((a, b) => {
    const ta = new Date(a.joinedAt ?? 0).getTime();
    const tb = new Date(b.joinedAt ?? 0).getTime();
    return tb - ta;
  });

  return (
    <div className="relative mx-auto my-4 max-h-[92vh] max-w-[700px] overflow-y-auto rounded-xl border-2 border-[#FF6B6B] bg-[#1a1a2e] p-5 font-mono text-white shadow-[0_0_30px_rgba(255,107,107,0.3)] sm:my-[40px] sm:p-8">
      <button
        onClick={onBack}
        className="absolute top-3 right-3 cursor-pointer rounded border border-[#FF6B6B] bg-transparent px-2 py-1 text-[11px] font-bold text-[#FF6B6B] sm:top-4 sm:right-4"
      >
        Back
      </button>

      <h1 className="mb-1 text-center text-2xl tracking-[2px] text-[#FF6B6B] sm:text-3xl">PROFILE</h1>
      <p className="mb-5 text-center text-xs text-[#aaa] sm:text-sm">Soldier Dossier</p>

      {error && (
        <div className="mb-4 rounded border border-[#FF6B6B] bg-[rgba(255,107,107,0.2)] p-2.5 text-xs text-[#FF6B6B]">
          {error}
        </div>
      )}

      {/* Identity */}
      <div className={`${cardClass} mb-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start`}>
        <Avatar url={editing ? editAvatar : user.avatarUrl} username={user.username} />
        <div className="flex-1 text-center sm:text-left">
          <div className="text-xl font-bold text-[#FFD700]">{user.username}</div>
          {!editing ? (
            <>
              <div className="mt-1 text-xs text-[#E0E0E0]">{user.email}</div>
              <div className="mt-1 text-[11px] text-[#888]">
                Enlisted: {formatDate(user.createdAt)}
              </div>
              <button
                onClick={() => setEditing(true)}
                className={`${baseBtn} mt-3 bg-[#6496FF]`}
              >
                Edit
              </button>
            </>
          ) : (
            <div className="mt-2 space-y-2 text-left">
              <div>
                <label className="mb-1 block text-[11px] text-[#FFD700]">Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-[#FFD700]">Avatar URL</label>
                <input
                  type="url"
                  value={editAvatar}
                  onChange={e => setEditAvatar(e.target.value)}
                  placeholder="https://..."
                  className={inputClass}
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`${baseBtn} bg-[#FF6B6B] flex-1 disabled:opacity-50`}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className={`${baseBtn} bg-[#333] flex-1`}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className={`${cardClass} mb-4`}>
        <div className={sectionTitle}>Battle Stats</div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          <Stat label="Games" value={stats.gamesPlayed} />
          <Stat label="Wins" value={stats.wins} color="#4CAF50" />
          <Stat label="Losses" value={stats.losses} color="#FF6B6B" />
          <Stat label="Win Rate" value={`${winRate}%`} />
          <Stat label="ELO" value={stats.elo} color="#FFD700" />
        </div>
      </div>

      {/* Achievements */}
      <div className={`${cardClass} mb-4`}>
        <div className={sectionTitle}>
          Achievements ({unlocked.length}/{allAchievements.length || unlocked.length})
        </div>
        {unlocked.length === 0 && locked.length === 0 ? (
          <div className="text-xs text-[#888]">No achievements available yet.</div>
        ) : (
          <ul className="space-y-1.5">
            {unlocked.map(ua => {
              const a = ua.achievement ?? {};
              return (
                <li
                  key={a.nameId ?? ua.achievementNameId}
                  className="flex items-start justify-between gap-2 rounded border border-[#4CAF50]/40 bg-[#4CAF50]/10 px-2 py-1.5 text-xs"
                >
                  <div>
                    <div className="font-bold text-[#4CAF50]">✓ {a.name ?? ua.achievementNameId}</div>
                    {a.description && (
                      <div className="text-[11px] text-[#aaa]">{a.description}</div>
                    )}
                  </div>
                  <div className="shrink-0 text-[10px] text-[#888]">
                    {formatDate(ua.unlockedAt)}
                  </div>
                </li>
              );
            })}
            {locked.map(a => (
              <li
                key={a.nameId}
                className="flex items-start justify-between gap-2 rounded border border-[#555] bg-[#1a1a1a] px-2 py-1.5 text-xs opacity-60"
              >
                <div>
                  <div className="font-bold text-[#aaa]">🔒 {a.name}</div>
                  {a.description && (
                    <div className="text-[11px] text-[#777]">{a.description}</div>
                  )}
                </div>
                <div className="shrink-0 text-[10px] text-[#666]">Locked</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Match history */}
      <div className={cardClass}>
        <div className={sectionTitle}>Match History ({matches.length})</div>
        {matches.length === 0 ? (
          <div className="text-xs text-[#888]">No matches played yet.</div>
        ) : (
          <ul className="space-y-1.5">
            {matches.slice(0, 15).map(mp => {
              const m = mp.match ?? {};
              return (
                <li
                  key={mp.id}
                  className="grid grid-cols-[1fr_auto] gap-2 rounded border border-[#555] bg-[#1a1a1a] px-2 py-1.5 text-xs"
                >
                  <div>
                    <div className="font-bold text-[#E0E0E0]">
                      {m.gameMode ?? 'Unknown mode'}
                    </div>
                    <div className="text-[10px] text-[#888]">
                      {formatDate(mp.joinedAt)}
                      {m.status && <span> · {m.status}</span>}
                    </div>
                  </div>
                  <div className="text-right text-[11px]">
                    <div className="text-[#FFD700]">Score {mp.score ?? 0}</div>
                    <div className="text-[#aaa]">
                      {mp.position != null ? `Pos #${mp.position}` : '—'}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, color = '#E0E0E0' }) {
  return (
    <div className="rounded border border-[#555] bg-[#1a1a1a] p-2 text-center">
      <div className="text-[10px] uppercase tracking-wider text-[#888]">{label}</div>
      <div className="mt-0.5 text-lg font-bold" style={{ color }}>{value}</div>
    </div>
  );
}
