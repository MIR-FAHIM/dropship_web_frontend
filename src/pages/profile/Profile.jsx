import React from 'react';
import { useGetUserDetailsQuery } from '../../redux/features/user';
import { getFromLocalstorage } from "../../utils/localstorage.utils";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&family=Playfair+Display:wght@600;700&display=swap');

  :root {
    --bg: #f4f1ee;
    --surface: #ffffff;
    --ink: #181614;
    --muted: #8a8078;
    --border: #e6e1db;
    --accent: #2d6a4f;
    --accent-light: #d8ede3;
    --accent-pale: #f0f8f4;
    --danger: #c0392b;
    --danger-bg: #fdf0ee;
    --radius: 20px;
    --radius-sm: 10px;
  }

  .prof-root * { box-sizing: border-box; margin: 0; padding: 0; }

  .prof-root {
    font-family: 'Sora', sans-serif;
    background: var(--bg);
    min-height: 100vh;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 48px 20px 64px;
  }

  .prof-card {
    width: 100%;
    max-width: 560px;
    background: var(--surface);
    border-radius: 28px;
    border: 1px solid var(--border);
    overflow: hidden;
    animation: profIn 0.5s cubic-bezier(.22,.8,.44,1) both;
  }

  @keyframes profIn {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Cover banner ── */
  .prof-cover {
    height: 120px;
    background: linear-gradient(135deg, #1b4332 0%, #2d6a4f 50%, #40916c 100%);
    position: relative;
  }

  .prof-cover-pattern {
    position: absolute;
    inset: 0;
    opacity: 0.08;
    background-image: repeating-linear-gradient(
      45deg,
      #fff 0px, #fff 1px,
      transparent 1px, transparent 12px
    );
  }

  /* ── Avatar ── */
  .prof-avatar-wrap {
    position: absolute;
    bottom: -44px;
    left: 32px;
  }

  .prof-avatar {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    border: 4px solid var(--surface);
    object-fit: cover;
    display: block;
    box-shadow: 0 4px 20px rgba(0,0,0,0.12);
  }

  .prof-status-dot {
    position: absolute;
    bottom: 6px;
    right: 4px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2.5px solid var(--surface);
    background: #27ae60;
  }
  .prof-status-dot.banned { background: var(--danger); }

  /* ── Body ── */
  .prof-body {
    padding: 56px 32px 32px;
  }

  .prof-identity {
    margin-bottom: 20px;
  }

  .prof-name {
    font-family: 'Playfair Display', serif;
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--ink);
    line-height: 1.2;
    letter-spacing: -0.01em;
  }

  .prof-email {
    font-size: 13px;
    color: var(--muted);
    margin-top: 4px;
    letter-spacing: 0.01em;
  }

  .prof-role-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 10px;
    padding: 4px 12px;
    background: var(--accent-light);
    color: var(--accent);
    border-radius: 99px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.07em;
    text-transform: uppercase;
  }

  /* ── Actions ── */
  .prof-actions {
    display: flex;
    gap: 10px;
    margin-bottom: 28px;
  }

  .prof-btn-primary {
    flex: 1;
    padding: 11px 20px;
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: var(--radius-sm);
    font-family: 'Sora', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    letter-spacing: 0.02em;
    transition: background 0.2s, transform 0.15s;
  }
  .prof-btn-primary:hover { background: #1b4332; transform: translateY(-1px); }
  .prof-btn-primary:active { transform: scale(0.98); }

  .prof-btn-ghost {
    padding: 11px 20px;
    background: transparent;
    color: var(--muted);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-family: 'Sora', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }
  .prof-btn-ghost:hover { background: var(--bg); color: var(--ink); }

  /* ── Divider ── */
  .prof-divider {
    height: 1px;
    background: var(--border);
    margin-bottom: 24px;
  }

  /* ── Info grid ── */
  .prof-info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-bottom: 20px;
  }

  .prof-info-card {
    background: var(--bg);
    border-radius: var(--radius-sm);
    padding: 14px 16px;
    border: 1px solid var(--border);
    transition: box-shadow 0.2s;
  }
  .prof-info-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); }

  .prof-info-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .prof-info-value {
    font-size: 14px;
    font-weight: 500;
    color: var(--ink);
    word-break: break-word;
  }

  .prof-info-value.active { color: var(--accent); font-weight: 600; }
  .prof-info-value.banned { color: var(--danger); font-weight: 600; }

  /* ── Address section ── */
  .prof-address-block {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 14px 16px;
  }

  .prof-address-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .prof-address-text {
    font-size: 14px;
    color: var(--ink);
    line-height: 1.6;
  }

  /* ── Loading / Error ── */
  .prof-state {
    font-family: 'Sora', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    font-size: 14px;
    color: var(--muted);
  }

  @media (max-width: 480px) {
    .prof-body { padding: 52px 20px 24px; }
    .prof-info-grid { grid-template-columns: 1fr; }
    .prof-name { font-size: 1.4rem; }
  }
`;

/* Tiny inline SVG icons */
const Icon = ({ d, size = 11 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONS = {
  phone:   "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.08 11.65 19.79 19.79 0 0 1 1.08 3 2 2 0 0 1 3.06 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 5.46 5.46l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z",
  calendar:"M3 4h18M16 2v4M8 2v4M3 10h18M5 4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H5z",
  status:  "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
  location:"M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
  shield:  "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
};

const ProfilePage = () => {
  const userId = getFromLocalstorage("userId") || 0;
  const { data, error, isLoading } = useGetUserDetailsQuery(userId);

  if (isLoading) return <div className="prof-state">Loading profile…</div>;
  if (error)     return <div className="prof-state" style={{ color: '#c0392b' }}>Error loading profile.</div>;

  const user   = data?.data || {};
  const avatar = user.avatar_original || user.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=2d6a4f&color=fff&bold=true`;
  const joinedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';
  const roleLabel = user.user_type
    ? user.user_type.replace(/_/g, ' ')
    : null;

  return (
    <>
      <style>{styles}</style>
      <div className="prof-root">
        <div className="prof-card">

          {/* Cover */}
          <div className="prof-cover">
            <div className="prof-cover-pattern" />
            <div className="prof-avatar-wrap">
              <img src={avatar} alt={user.name || 'User'} className="prof-avatar" />
              <div className={`prof-status-dot ${user.banned ? 'banned' : ''}`} title={user.banned ? 'Banned' : 'Active'} />
            </div>
          </div>

          {/* Body */}
          <div className="prof-body">

            {/* Identity */}
            <div className="prof-identity">
              <h2 className="prof-name">{user.name || '—'}</h2>
              <p className="prof-email">{user.email || 'No email provided'}</p>
              {roleLabel && (
                <span className="prof-role-chip">
                  <Icon d={ICONS.shield} size={9} />
                  {roleLabel}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="prof-actions">
              <button className="prof-btn-primary">Edit Profile</button>
              <button className="prof-btn-ghost">Settings</button>
            </div>

            <div className="prof-divider" />

            {/* Info grid */}
            <div className="prof-info-grid">
              <div className="prof-info-card">
                <div className="prof-info-label">
                  <Icon d={ICONS.phone} /> Phone
                </div>
                <div className="prof-info-value">{user.phone || '—'}</div>
              </div>

              <div className="prof-info-card">
                <div className="prof-info-label">
                  <Icon d={ICONS.calendar} /> Joined
                </div>
                <div className="prof-info-value">{joinedDate}</div>
              </div>

              <div className="prof-info-card" style={{ gridColumn: '1 / -1' }}>
                <div className="prof-info-label">
                  <Icon d={ICONS.status} /> Account status
                </div>
                <div className={`prof-info-value ${user.banned ? 'banned' : 'active'}`}>
                  {user.banned ? 'Banned' : 'Active'}
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="prof-address-block">
              <div className="prof-address-label">
                <Icon d={ICONS.location} /> Address
              </div>
              <div className="prof-address-text">{user.address || 'No address provided'}</div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;