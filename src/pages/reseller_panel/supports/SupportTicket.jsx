import React, { useState } from 'react';
import { getFromLocalstorage } from '../../../utils/localstorage.utils';
import {
  useAddSupportTicketMutation,
  useGetSupportTicketsByUserQuery,
  useEditSupportTicketMutation,
} from '../../../redux/features/support';
import { useListOrdersByUserQuery } from '../../../redux/features/order';

const supportTypes = [
  { value: 'order',   label: 'Order Issue' },
  { value: 'payment', label: 'Payment Issue' },
  { value: 'product', label: 'Product Issue' },
  { value: 'other',   label: 'Other' },
];

const styles = `
  .st-wrap { padding: 1.5rem 0; font-size: 14px; color: var(--color-text-primary, #1a1a1a); font-family: sans-serif; }
  .st-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 1.25rem; }
  .st-stat { background: #f5f5f3; border-radius: 10px; padding: 0.75rem 1rem; }
  .st-stat-label { font-size: 11px; font-weight: 500; color: #888; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px; }
  .st-stat-val { font-size: 24px; font-weight: 500; }

  .st-section { background: #fff; border: 0.5px solid #e0ddd8; border-radius: 14px; padding: 1.25rem; margin-bottom: 1.25rem; }
  .st-section-title { font-size: 15px; font-weight: 500; margin-bottom: 1rem; color: #1a1a1a; }
  .st-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .st-full { grid-column: 1 / -1; }
  .st-field { display: flex; flex-direction: column; gap: 5px; }
  .st-field label { font-size: 11px; font-weight: 500; color: #888; letter-spacing: 0.04em; text-transform: uppercase; }
  .st-field input, .st-field select, .st-field textarea {
    width: 100%; padding: 8px 10px; font-size: 13px;
    border: 0.5px solid #d0cdc8; border-radius: 8px;
    background: #faf9f7; outline: none; font-family: inherit;
    transition: border-color 0.15s;
  }
  .st-field input:focus, .st-field select:focus, .st-field textarea:focus { border-color: #888; background: #fff; }
  .st-field textarea { resize: vertical; min-height: 80px; line-height: 1.5; }

  .st-btn {
    width: 100%; padding: 10px; font-size: 14px; font-weight: 500;
    border-radius: 8px; background: #1a1a1a; color: #fff;
    border: none; cursor: pointer; transition: opacity 0.15s, transform 0.1s;
  }
  .st-btn:hover { opacity: 0.85; }
  .st-btn:active { transform: scale(0.98); }
  .st-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .st-filter-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
  .st-filter-row .st-section-title { margin: 0; }
  .st-filter-select {
    width: auto; font-size: 12px; padding: 5px 10px;
    border: 0.5px solid #d0cdc8; border-radius: 8px;
    background: #faf9f7; outline: none; cursor: pointer;
  }

  .st-empty { text-align: center; padding: 2.5rem; color: #aaa; font-size: 13px; }
  .st-empty-icon { font-size: 28px; margin-bottom: 8px; }

  .st-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .st-table thead tr { border-bottom: 0.5px solid #e0ddd8; }
  .st-table th { text-align: left; padding: 8px 10px; font-size: 11px; font-weight: 500; color: #888; letter-spacing: 0.05em; text-transform: uppercase; }
  .st-table td { padding: 10px; border-bottom: 0.5px solid #f0ede8; vertical-align: middle; }
  .st-table tbody tr:last-child td { border-bottom: none; }
  .st-table tbody tr:hover { background: #faf9f7; }

  .st-id { font-family: monospace; font-size: 12px; color: #888; }
  .st-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 99px; font-size: 11px; font-weight: 500; }
  .st-badge-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
  .st-badge-open     { background: #FAEEDA; color: #854F0B; }
  .st-badge-progress { background: #E6F1FB; color: #185FA5; }
  .st-badge-resolved { background: #EAF3DE; color: #3B6D11; }
  .st-badge-closed   { background: #F0F0F0; color: #666; }

  .st-view-btn {
    font-size: 12px; padding: 4px 12px; border-radius: 7px;
    background: transparent; border: 0.5px solid #d0cdc8;
    cursor: pointer; color: #444; font-family: inherit;
    transition: background 0.15s;
  }
  .st-view-btn:hover { background: #f5f5f3; }

  .st-modal-bg {
    position: fixed; inset: 0; background: rgba(0,0,0,0.35);
    display: flex; align-items: center; justify-content: center; z-index: 100;
  }
  .st-modal {
    background: #fff; border-radius: 14px; border: 0.5px solid #e0ddd8;
    padding: 1.5rem; width: 420px; max-width: 94vw;
    animation: modalIn 0.2s ease;
  }
  @keyframes modalIn { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: none; } }
  .st-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
  .st-modal-title { font-size: 15px; font-weight: 500; font-family: monospace; color: #888; }
  .st-close { background: none; border: none; font-size: 20px; cursor: pointer; color: #aaa; line-height: 1; padding: 0 2px; }
  .st-close:hover { color: #333; }
  .st-modal-row { display: flex; justify-content: space-between; align-items: center; padding: 9px 0; border-bottom: 0.5px solid #f0ede8; font-size: 13px; }
  .st-modal-row:last-of-type { border-bottom: none; }
  .st-modal-key { color: #888; }
  .st-modal-desc { margin-top: 12px; padding: 12px; background: #faf9f7; border-radius: 8px; font-size: 13px; line-height: 1.6; color: #555; }
  .st-modal-edit-area { width: 100%; margin-top: 10px; padding: 8px 10px; font-size: 13px; border: 0.5px solid #d0cdc8; border-radius: 8px; background: #faf9f7; outline: none; font-family: inherit; resize: vertical; min-height: 70px; line-height: 1.5; box-sizing: border-box; }
  .st-modal-edit-area:focus { border-color: #888; background: #fff; }
  .st-modal-save-btn { margin-top: 10px; width: 100%; padding: 8px; font-size: 13px; font-weight: 500; border-radius: 8px; background: #1a1a1a; color: #fff; border: none; cursor: pointer; transition: opacity 0.15s; }
  .st-modal-save-btn:hover { opacity: 0.82; }
  .st-modal-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .st-admin-note { margin-top: 10px; padding: 10px 12px; background: #EAF3DE; border-radius: 8px; font-size: 12px; color: #3B6D11; line-height: 1.5; }
  .st-admin-note strong { display: block; margin-bottom: 3px; }

  .st-toast {
    position: fixed; bottom: 24px; left: 50%;
    transform: translateX(-50%) translateY(60px);
    background: #1a1a1a; color: #fff;
    padding: 9px 20px; border-radius: 99px; font-size: 13px;
    transition: transform 0.3s ease; z-index: 200; white-space: nowrap;
    pointer-events: none;
  }
  .st-toast.show { transform: translateX(-50%) translateY(0); }
  .st-toast.error { background: #b91c1c; }

  @media (max-width: 560px) {
    .st-grid { grid-template-columns: 1fr; }
    .st-summary { grid-template-columns: repeat(3, 1fr); }
  }
`;

const Badge = ({ status }) => {
  const s = (status || '').toLowerCase();
  const cls =
    s === 'open'        ? 'st-badge-open'     :
    s === 'in progress' ? 'st-badge-progress' :
    s === 'resolved'    ? 'st-badge-resolved' :
                          'st-badge-closed';
  return (
    <span className={`st-badge ${cls}`}>
      <span className="st-badge-dot" />
      {status}
    </span>
  );
};

const SupportTicket = () => {
  const userId = getFromLocalstorage('userId');

  // -- API hooks --
  const { data: ticketsData, isLoading: ticketsLoading } =
    useGetSupportTicketsByUserQuery(userId, { skip: !userId });

  const { data: ordersData } =
    useListOrdersByUserQuery({ userId }, { skip: !userId });

  const [addTicket,  { isLoading: adding  }] = useAddSupportTicketMutation();
  const [editTicket, { isLoading: editing }] = useEditSupportTicketMutation();

  // -- Form state --
  const [form, setForm] = useState({
    orderId: '',
    supportType: 'order',
    title: '',
    description: '',
  });

  // -- List / modal state --
  const [filterStatus, setFilterStatus] = useState('');
  const [viewTicket, setViewTicket]     = useState(null);
  const [editDesc,   setEditDesc]       = useState('');
  const [toast, setToast]               = useState({ msg: '', show: false, error: false });

  const showToast = (msg, error = false) => {
    setToast({ msg, show: true, error });
    setTimeout(() => setToast({ msg: '', show: false, error: false }), 2800);
  };

  // -- Derived data --
  const tickets       = ticketsData?.data || [];
  const orders        = ordersData?.data?.data || [];
  const visible       = filterStatus ? tickets.filter(t => t.status === filterStatus) : tickets;
  const openCount     = tickets.filter(t => t.status === 'open').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved').length;

  // -- Handlers --
  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      showToast('Title and description are required.', true);
      return;
    }
    try {
      await addTicket({
        user_id:      userId,
        order_id:     form.orderId || undefined,
        support_type: form.supportType,
        title:        form.title.trim(),
        description:  form.description.trim(),
      }).unwrap();
      setForm({ orderId: '', supportType: 'order', title: '', description: '' });
      showToast('Ticket submitted successfully.');
    } catch {
      showToast('Failed to submit ticket.', true);
    }
  };

  const openEditModal = (ticket) => {
    setViewTicket(ticket);
    setEditDesc(ticket.description || '');
  };

  const handleEdit = async () => {
    if (!editDesc.trim()) return;
    try {
      await editTicket({ id: viewTicket.id, description: editDesc.trim() }).unwrap();
      showToast('Ticket updated successfully.');
      setViewTicket(null);
    } catch {
      showToast('Failed to update ticket.', true);
    }
  };

  // -- Render --
  return (
    <>
      <style>{styles}</style>
      <div className="st-wrap">

        {/* Summary */}
        <div className="st-summary">
          <div className="st-stat">
            <div className="st-stat-label">Total</div>
            <div className="st-stat-val">{tickets.length}</div>
          </div>
          <div className="st-stat">
            <div className="st-stat-label">Open</div>
            <div className="st-stat-val" style={{ color: '#854F0B' }}>{openCount}</div>
          </div>
          <div className="st-stat">
            <div className="st-stat-label">Resolved</div>
            <div className="st-stat-val" style={{ color: '#3B6D11' }}>{resolvedCount}</div>
          </div>
        </div>

        {/* Create Form */}
        <div className="st-section">
          <div className="st-section-title">Submit New Ticket</div>
          <div className="st-grid">

            <div className="st-field">
              <label htmlFor="orderId">Order (Optional)</label>
              <select id="orderId" name="orderId" value={form.orderId} onChange={handleChange}>
                <option value="">Select an order</option>
                {orders.map(o => (
                  <option key={o.id} value={o.id}>#{o.id} &mdash; {o.delivery_status || 'Pending'}</option>
                ))}
              </select>
            </div>

            <div className="st-field">
              <label htmlFor="supportType">Support Type</label>
              <select id="supportType" name="supportType" value={form.supportType} onChange={handleChange}>
                {supportTypes.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="st-field st-full">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder="Brief description of your issue"
              />
            </div>

            <div className="st-field st-full">
              <label htmlFor="desc">Detailed Description</label>
              <textarea
                id="desc"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your issue or request in detail..."
              />
            </div>

            <div className="st-full">
              <button className="st-btn" onClick={handleSubmit} disabled={adding}>
                {adding ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </div>

          </div>
        </div>

        {/* Ticket Table */}
        <div className="st-section">
          <div className="st-filter-row">
            <div className="st-section-title">Submitted Tickets</div>
            <select
              className="st-filter-select"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="in progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {ticketsLoading ? (
            <div className="st-empty">
              <div className="st-empty-icon">&#9203;</div>
              Loading...
            </div>
          ) : visible.length === 0 ? (
            <div className="st-empty">
              <div className="st-empty-icon">&#128203;</div>
              {tickets.length ? 'No tickets found for this filter.' : 'No tickets submitted yet.'}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="st-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Order</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map(ticket => (
                    <tr key={ticket.id}>
                      <td className="st-id">#{ticket.id}</td>
                      <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ticket.title}
                      </td>
                      <td>{ticket.support_type}</td>
                      <td className="st-id">{ticket.order_id ? `#${ticket.order_id}` : '—'}</td>
                      <td><Badge status={ticket.status} /></td>
                      <td>
                        <button className="st-view-btn" onClick={() => openEditModal(ticket)}>
                          View
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

      {/* Detail / Edit Modal */}
      {viewTicket && (
        <div className="st-modal-bg" onClick={e => e.target === e.currentTarget && setViewTicket(null)}>
          <div className="st-modal">
            <div className="st-modal-header">
              <div className="st-modal-title">Ticket #{viewTicket.id}</div>
              <button className="st-close" onClick={() => setViewTicket(null)}>&times;</button>
            </div>

            <div className="st-modal-row">
              <span className="st-modal-key">Title</span>
              <span>{viewTicket.title}</span>
            </div>
            <div className="st-modal-row">
              <span className="st-modal-key">Type</span>
              <span>{viewTicket.support_type}</span>
            </div>
            <div className="st-modal-row">
              <span className="st-modal-key">Order</span>
              <span>{viewTicket.order_id ? `#${viewTicket.order_id}` : '—'}</span>
            </div>
            <div className="st-modal-row">
              <span className="st-modal-key">Status</span>
              <Badge status={viewTicket.status} />
            </div>

            {(viewTicket.status === 'open' || viewTicket.status === 'in progress') ? (
              <>
                <div style={{ marginTop: 12, fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Edit Description
                </div>
                <textarea
                  className="st-modal-edit-area"
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                />
                <button className="st-modal-save-btn" onClick={handleEdit} disabled={editing}>
                  {editing ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <div className="st-modal-desc">{viewTicket.description}</div>
            )}

            {viewTicket.admin_note && (
              <div className="st-admin-note">
                <strong>Admin Note:</strong>
                {viewTicket.admin_note}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      <div className={`st-toast${toast.show ? ' show' : ''}${toast.error ? ' error' : ''}`}>
        {toast.msg}
      </div>
    </>
  );
};

export default SupportTicket;
