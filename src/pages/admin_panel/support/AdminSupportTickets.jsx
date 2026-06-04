import React, { useState } from 'react';
import {
  useGetAllSupportTicketsQuery,
  useChangeTicketStatusMutation,
} from '../../../redux/features/support';

const styles = `
  .ast-wrap { font-size: 14px; color: #1a1a1a; }
  .ast-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
  .ast-title { font-size: 18px; font-weight: 600; }
  .ast-count { font-size: 13px; color: #888; margin-top: 2px; }

  .ast-filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 1rem; }
  .ast-filter-btn {
    padding: 5px 14px; border-radius: 99px; font-size: 12px; font-weight: 500;
    border: 1px solid #d0cdc8; background: #fff; cursor: pointer; transition: all 0.15s;
  }
  .ast-filter-btn.active { background: #dc2626; color: #fff; border-color: #dc2626; }
  .ast-filter-btn:not(.active):hover { background: #f5f5f3; }

  .ast-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
  .ast-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .ast-table thead tr { background: #f9fafb; border-bottom: 1px solid #e5e7eb; }
  .ast-table th { text-align: left; padding: 10px 14px; font-size: 11px; font-weight: 600; color: #6b7280; letter-spacing: 0.05em; text-transform: uppercase; white-space: nowrap; }
  .ast-table td { padding: 12px 14px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
  .ast-table tbody tr:last-child td { border-bottom: none; }
  .ast-table tbody tr:hover { background: #fafafa; }

  .ast-id { font-family: monospace; font-size: 12px; color: #9ca3af; }
  .ast-user { font-weight: 500; }
  .ast-user-email { font-size: 11px; color: #9ca3af; margin-top: 1px; }
  .ast-title-cell { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .ast-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 99px; font-size: 11px; font-weight: 500; white-space: nowrap; }
  .ast-badge-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
  .ast-badge-open     { background: #fef3c7; color: #92400e; }
  .ast-badge-progress { background: #dbeafe; color: #1e40af; }
  .ast-badge-resolved { background: #dcfce7; color: #166534; }
  .ast-badge-closed   { background: #f3f4f6; color: #6b7280; }

  .ast-action-btn {
    font-size: 12px; padding: 4px 12px; border-radius: 7px;
    background: transparent; border: 1px solid #d1d5db;
    cursor: pointer; color: #374151; font-family: inherit;
    transition: background 0.15s;
  }
  .ast-action-btn:hover { background: #f3f4f6; }

  .ast-empty { text-align: center; padding: 3rem; color: #9ca3af; }
  .ast-empty-icon { font-size: 32px; margin-bottom: 10px; }

  .ast-modal-bg {
    position: fixed; inset: 0; background: rgba(0,0,0,0.4);
    display: flex; align-items: center; justify-content: center; z-index: 200;
  }
  .ast-modal {
    background: #fff; border-radius: 16px; padding: 1.5rem;
    width: 480px; max-width: 95vw; max-height: 90vh; overflow-y: auto;
    animation: astIn 0.2s ease;
  }
  @keyframes astIn { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: none; } }
  .ast-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
  .ast-modal-title { font-size: 15px; font-weight: 600; }
  .ast-close { background: none; border: none; font-size: 22px; cursor: pointer; color: #9ca3af; line-height: 1; }
  .ast-close:hover { color: #1f2937; }

  .ast-detail-row { display: flex; gap: 8px; padding: 9px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
  .ast-detail-row:last-of-type { border-bottom: none; }
  .ast-detail-key { width: 110px; flex-shrink: 0; color: #9ca3af; font-weight: 500; }
  .ast-detail-val { color: #1f2937; flex: 1; word-break: break-word; }

  .ast-desc-box { margin-top: 12px; padding: 12px; background: #f9fafb; border-radius: 8px; font-size: 13px; line-height: 1.6; color: #374151; }

  .ast-divider { border: none; border-top: 1px solid #e5e7eb; margin: 1rem 0; }

  .ast-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 12px; }
  .ast-field label { font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.04em; }
  .ast-field select, .ast-field textarea {
    width: 100%; padding: 8px 10px; font-size: 13px;
    border: 1px solid #d1d5db; border-radius: 8px;
    background: #f9fafb; outline: none; font-family: inherit;
    transition: border-color 0.15s; box-sizing: border-box;
  }
  .ast-field select:focus, .ast-field textarea:focus { border-color: #6b7280; background: #fff; }
  .ast-field textarea { resize: vertical; min-height: 70px; line-height: 1.5; }

  .ast-save-btn {
    width: 100%; padding: 9px; font-size: 13px; font-weight: 600;
    border-radius: 8px; background: #dc2626; color: #fff;
    border: none; cursor: pointer; transition: opacity 0.15s;
  }
  .ast-save-btn:hover { opacity: 0.88; }
  .ast-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .ast-toast {
    position: fixed; bottom: 24px; left: 50%;
    transform: translateX(-50%) translateY(60px);
    background: #1f2937; color: #fff;
    padding: 9px 20px; border-radius: 99px; font-size: 13px;
    transition: transform 0.3s ease; z-index: 300; pointer-events: none;
  }
  .ast-toast.show { transform: translateX(-50%) translateY(0); }
  .ast-toast.error { background: #dc2626; }

  .ast-summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 1.25rem; }
  .ast-stat { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 0.75rem 1rem; }
  .ast-stat-label { font-size: 11px; font-weight: 500; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px; }
  .ast-stat-val { font-size: 22px; font-weight: 600; }

  @media (max-width: 640px) {
    .ast-summary { grid-template-columns: repeat(2, 1fr); }
    .ast-table th:nth-child(4), .ast-table td:nth-child(4) { display: none; }
  }
`;

const STATUS_OPTIONS = ['open', 'in progress', 'resolved', 'closed'];

const Badge = ({ status }) => {
  const s = (status || '').toLowerCase();
  const cls =
    s === 'open'        ? 'ast-badge-open'     :
    s === 'in progress' ? 'ast-badge-progress' :
    s === 'resolved'    ? 'ast-badge-resolved' :
                          'ast-badge-closed';
  return (
    <span className={`ast-badge ${cls}`}>
      <span className="ast-badge-dot" />
      {status}
    </span>
  );
};

const AdminSupportTickets = () => {
  const { data, isLoading } = useGetAllSupportTicketsQuery();
  const [changeStatus, { isLoading: saving }] = useChangeTicketStatusMutation();

  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected]         = useState(null);
  const [editStatus, setEditStatus]     = useState('');
  const [adminNote, setAdminNote]       = useState('');
  const [toast, setToast]               = useState({ msg: '', show: false, error: false });

  const showToast = (msg, error = false) => {
    setToast({ msg, show: true, error });
    setTimeout(() => setToast({ msg: '', show: false, error: false }), 2800);
  };

  const tickets = data?.data || [];
  const visible = filterStatus ? tickets.filter(t => t.status === filterStatus) : tickets;

  const openCount     = tickets.filter(t => t.status === 'open').length;
  const progressCount = tickets.filter(t => t.status === 'in progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved').length;
  const closedCount   = tickets.filter(t => t.status === 'closed').length;

  const openModal = (ticket) => {
    setSelected(ticket);
    setEditStatus(ticket.status || 'open');
    setAdminNote(ticket.admin_note || '');
  };

  const handleSave = async () => {
    try {
      await changeStatus({
        id:         selected.id,
        status:     editStatus,
        admin_note: adminNote || undefined,
      }).unwrap();
      showToast('Ticket updated successfully.');
      setSelected(null);
    } catch {
      showToast('Failed to update ticket.', true);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <>
      <style>{styles}</style>
      <div className="ast-wrap">

        <div className="ast-header">
          <div>
            <div className="ast-title">Support Tickets</div>
            <div className="ast-count">{tickets.length} total tickets</div>
          </div>
        </div>

        {/* Summary stats */}
        <div className="ast-summary">
          <div className="ast-stat">
            <div className="ast-stat-label">Total</div>
            <div className="ast-stat-val">{tickets.length}</div>
          </div>
          <div className="ast-stat">
            <div className="ast-stat-label">Open</div>
            <div className="ast-stat-val" style={{ color: '#92400e' }}>{openCount}</div>
          </div>
          <div className="ast-stat">
            <div className="ast-stat-label">In Progress</div>
            <div className="ast-stat-val" style={{ color: '#1e40af' }}>{progressCount}</div>
          </div>
          <div className="ast-stat">
            <div className="ast-stat-label">Resolved</div>
            <div className="ast-stat-val" style={{ color: '#166534' }}>{resolvedCount}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="ast-filters">
          <button
            className={`ast-filter-btn${filterStatus === '' ? ' active' : ''}`}
            onClick={() => setFilterStatus('')}
          >
            All
          </button>
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              className={`ast-filter-btn${filterStatus === s ? ' active' : ''}`}
              onClick={() => setFilterStatus(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="ast-card">
          {isLoading ? (
            <div className="ast-empty">
              <div className="ast-empty-icon">&#9203;</div>
              Loading tickets...
            </div>
          ) : visible.length === 0 ? (
            <div className="ast-empty">
              <div className="ast-empty-icon">&#128203;</div>
              No tickets found.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="ast-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Order</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map(ticket => (
                    <tr key={ticket.id}>
                      <td className="ast-id">#{ticket.id}</td>
                      <td>
                        <div className="ast-user">{ticket.user?.name || '—'}</div>
                        <div className="ast-user-email">{ticket.user?.email || ''}</div>
                      </td>
                      <td className="ast-title-cell">{ticket.title}</td>
                      <td style={{ textTransform: 'capitalize' }}>{ticket.support_type}</td>
                      <td className="ast-id">{ticket.order_id ? `#${ticket.order_id}` : '—'}</td>
                      <td><Badge status={ticket.status} /></td>
                      <td style={{ color: '#9ca3af', fontSize: 12 }}>{formatDate(ticket.created_at)}</td>
                      <td>
                        <button className="ast-action-btn" onClick={() => openModal(ticket)}>
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Manage Modal */}
      {selected && (
        <div className="ast-modal-bg" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="ast-modal">
            <div className="ast-modal-header">
              <div className="ast-modal-title">Ticket #{selected.id}</div>
              <button className="ast-close" onClick={() => setSelected(null)}>&times;</button>
            </div>

            {/* Ticket details */}
            <div className="ast-detail-row">
              <span className="ast-detail-key">User</span>
              <span className="ast-detail-val">{selected.user?.name} &mdash; {selected.user?.phone || selected.user?.email}</span>
            </div>
            <div className="ast-detail-row">
              <span className="ast-detail-key">Title</span>
              <span className="ast-detail-val">{selected.title}</span>
            </div>
            <div className="ast-detail-row">
              <span className="ast-detail-key">Type</span>
              <span className="ast-detail-val" style={{ textTransform: 'capitalize' }}>{selected.support_type}</span>
            </div>
            <div className="ast-detail-row">
              <span className="ast-detail-key">Order</span>
              <span className="ast-detail-val">{selected.order_id ? `#${selected.order_id}` : '—'}</span>
            </div>
            <div className="ast-detail-row">
              <span className="ast-detail-key">Created</span>
              <span className="ast-detail-val">{formatDate(selected.created_at)}</span>
            </div>
            <div className="ast-detail-row">
              <span className="ast-detail-key">Current Status</span>
              <span className="ast-detail-val"><Badge status={selected.status} /></span>
            </div>

            <div className="ast-desc-box">{selected.description}</div>

            <hr className="ast-divider" />

            {/* Admin actions */}
            <div className="ast-field">
              <label>Update Status</label>
              <select value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className="ast-field">
              <label>Admin Note (optional)</label>
              <textarea
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                placeholder="Leave a note for the user..."
              />
            </div>

            <button className="ast-save-btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      <div className={`ast-toast${toast.show ? ' show' : ''}${toast.error ? ' error' : ''}`}>
        {toast.msg}
      </div>
    </>
  );
};

export default AdminSupportTickets;
