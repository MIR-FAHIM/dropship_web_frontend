import React, { useState } from 'react';

const orders = [
  { id: 'ORD001', description: 'Smartphone' },
  { id: 'ORD002', description: 'Laptop' },
  { id: 'ORD003', description: 'Headphones' },
  { id: 'ORD004', description: 'Tablet' },
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
  .st-field select, .st-field textarea {
    width: 100%; padding: 8px 10px; font-size: 13px;
    border: 0.5px solid #d0cdc8; border-radius: 8px;
    background: #faf9f7; outline: none; font-family: inherit;
    transition: border-color 0.15s;
  }
  .st-field select:focus, .st-field textarea:focus { border-color: #888; background: #fff; }
  .st-field textarea { resize: vertical; min-height: 80px; line-height: 1.5; }

  .st-btn {
    width: 100%; padding: 10px; font-size: 14px; font-weight: 500;
    border-radius: 8px; background: #1a1a1a; color: #fff;
    border: none; cursor: pointer; transition: opacity 0.15s, transform 0.1s;
  }
  .st-btn:hover { opacity: 0.85; }
  .st-btn:active { transform: scale(0.98); }

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
  .st-badge-open { background: #FAEEDA; color: #854F0B; }
  .st-badge-progress { background: #E6F1FB; color: #185FA5; }
  .st-badge-resolved { background: #EAF3DE; color: #3B6D11; }

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
    padding: 1.5rem; width: 380px; max-width: 94vw;
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

  .st-toast {
    position: fixed; bottom: 24px; left: 50%;
    transform: translateX(-50%) translateY(60px);
    background: #1a1a1a; color: #fff;
    padding: 9px 20px; border-radius: 99px; font-size: 13px;
    transition: transform 0.3s ease; z-index: 200; white-space: nowrap;
    pointer-events: none;
  }
  .st-toast.show { transform: translateX(-50%) translateY(0); }

  @media (max-width: 560px) {
    .st-grid { grid-template-columns: 1fr; }
    .st-summary { grid-template-columns: repeat(3, 1fr); }
  }
`;

const Badge = ({ status }) => {
  const cls = status === 'Open' ? 'st-badge-open' : status === 'In Progress' ? 'st-badge-progress' : 'st-badge-resolved';
  return (
    <span className={`st-badge ${cls}`}>
      <span className="st-badge-dot" />
      {status}
    </span>
  );
};

const SupportTicket = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [status, setStatus] = useState('Open');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewTicket, setViewTicket] = useState(null);
  const [toast, setToast] = useState({ msg: '', show: false });

  const showToast = (msg) => {
    setToast({ msg, show: true });
    setTimeout(() => setToast({ msg: '', show: false }), 2500);
  };

  const generateTicketId = () => `TKT-${Math.floor(Math.random() * 9000) + 1000}`;

  const handleSubmit = () => {
    if (!selectedOrderId || !ticketDescription.trim()) {
      showToast('Please select an order and add a description.');
      return;
    }
    const newTicket = {
      id: generateTicketId(),
      orderId: selectedOrderId,
      description: ticketDescription.trim(),
      status,
    };
    setTickets([newTicket, ...tickets]);
    setSelectedOrderId('');
    setTicketDescription('');
    setStatus('Open');
    showToast('Ticket submitted successfully.');
  };

  const visible = filterStatus ? tickets.filter(t => t.status === filterStatus) : tickets;
  const openCount = tickets.filter(t => t.status === 'Open').length;
  const resolvedCount = tickets.filter(t => t.status === 'Resolved').length;

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

        {/* Form */}
        <div className="st-section">
          <div className="st-section-title">Submit a ticket</div>
          <div className="st-grid">
            <div className="st-field">
              <label htmlFor="order">Order</label>
              <select id="order" value={selectedOrderId} onChange={e => setSelectedOrderId(e.target.value)}>
                <option value="">Select an order</option>
                {orders.map(o => (
                  <option key={o.id} value={o.id}>{o.id} — {o.description}</option>
                ))}
              </select>
            </div>
            <div className="st-field">
              <label htmlFor="init-status">Initial status</label>
              <select id="init-status" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
            <div className="st-field st-full">
              <label htmlFor="desc">Description</label>
              <textarea
                id="desc"
                value={ticketDescription}
                onChange={e => setTicketDescription(e.target.value)}
                placeholder="Describe your issue or request..."
              />
            </div>
            <div className="st-full">
              <button className="st-btn" onClick={handleSubmit}>Submit ticket</button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="st-section">
          <div className="st-filter-row">
            <div className="st-section-title">Submitted tickets</div>
            <select
              className="st-filter-select"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="">All statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {visible.length === 0 ? (
            <div className="st-empty">
              <div className="st-empty-icon">📋</div>
              {tickets.length ? 'No tickets match this filter.' : 'No tickets yet. Submit one above.'}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="st-table">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Order</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map(ticket => (
                    <tr key={ticket.id}>
                      <td className="st-id">{ticket.id}</td>
                      <td>{ticket.orderId}</td>
                      <td><Badge status={ticket.status} /></td>
                      <td>
                        <button className="st-view-btn" onClick={() => setViewTicket(ticket)}>
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

      {/* Modal */}
      {viewTicket && (
        <div className="st-modal-bg" onClick={e => e.target === e.currentTarget && setViewTicket(null)}>
          <div className="st-modal">
            <div className="st-modal-header">
              <div className="st-modal-title">{viewTicket.id}</div>
              <button className="st-close" onClick={() => setViewTicket(null)}>×</button>
            </div>
            <div className="st-modal-row">
              <span className="st-modal-key">Order</span>
              <span>{viewTicket.orderId}</span>
            </div>
            <div className="st-modal-row">
              <span className="st-modal-key">Status</span>
              <Badge status={viewTicket.status} />
            </div>
            <div className="st-modal-desc">{viewTicket.description}</div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div className={`st-toast ${toast.show ? 'show' : ''}`}>{toast.msg}</div>
    </>
  );
};

export default SupportTicket;