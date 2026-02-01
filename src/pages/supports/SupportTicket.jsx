import React, { useState } from 'react';

const SupportTicket = () => {
  // Sample orders for the dropdown
  const orders = [
    { id: 'ORD001', description: 'Smartphone' },
    { id: 'ORD002', description: 'Laptop' },
    { id: 'ORD003', description: 'Headphones' },
    { id: 'ORD004', description: 'Tablet' },
  ];

  // State to hold tickets
  const [tickets, setTickets] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [status, setStatus] = useState('Open');

  // Generate a unique support ticket ID
  const generateTicketId = () => `TICKET${Math.floor(Math.random() * 10000)}`;

  // Handle ticket submission
  const handleSubmitTicket = () => {
    if (selectedOrderId && ticketDescription) {
      const newTicket = {
        supportId: generateTicketId(),
        orderId: selectedOrderId,
        description: ticketDescription,
        status: status,
      };

      // Add new ticket to the list
      setTickets([...tickets, newTicket]);

      // Reset form
      setSelectedOrderId('');
      setTicketDescription('');
      setStatus('Open');
    } else {
      alert('Please select an order and provide a description.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto bg-white p-6 shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Support Ticket System</h2>

        {/* Ticket Submission Form */}
        <div className="mb-6 p-4 bg-gray-100 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800">Submit a Support Ticket</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {/* Select Order ID */}
            <div className="mb-4">
              <label htmlFor="orderId" className="block text-sm font-medium text-gray-600">
                Select Order ID
              </label>
              <select
                id="orderId"
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select an Order</option>
                {orders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.id} - {order.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Message Description */}
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-600">
                Message Description
              </label>
              <textarea
                id="description"
                value={ticketDescription}
                onChange={(e) => setTicketDescription(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                rows="4"
                placeholder="Describe the issue or request"
              ></textarea>
            </div>

            {/* Status */}
            <div className="mb-4">
              <label htmlFor="status" className="block text-sm font-medium text-gray-600">
                Ticket Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="mt-4">
              <button
                onClick={handleSubmitTicket}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
              >
                Submit Ticket
              </button>
            </div>
          </div>
        </div>

        {/* Ticket Table */}
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Submitted Support Tickets</h3>
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Support ID</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Order ID</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">View</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.supportId} className="border-t">
                  <td className="px-4 py-2 text-sm text-gray-700">{ticket.supportId}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{ticket.orderId}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        ticket.status === 'Open'
                          ? 'bg-yellow-100 text-yellow-800'
                          : ticket.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    <button
                      onClick={() => alert(`Viewing ticket: ${ticket.supportId}`)}
                      className="px-4 py-1 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SupportTicket;
