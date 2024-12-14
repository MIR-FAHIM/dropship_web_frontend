import React, { useState } from 'react';

const Users = () => {
  // Sample users data
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', company_name: '', industry: '', phone: '123456789' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', company_name: '', industry: '', phone: '987654321' },
  ]);

  const [isEditing, setIsEditing] = useState(null); // Track which user is being edited
  const [editedUser, setEditedUser] = useState({}); // Store edited user data

  // List of industries for the select dropdown
  const industries = ['Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing'];

  // Handle field change for the edit form
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  // Start editing a user
  const startEditing = (user) => {
    setIsEditing(user.id);
    setEditedUser({ ...user });
  };

  // Save changes to the user data
  const saveChanges = () => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === editedUser.id ? { ...user, ...editedUser } : user
      )
    );
    setIsEditing(null); // Exit editing mode
  };

  // Cancel the editing
  const cancelEditing = () => {
    setIsEditing(null); // Exit editing mode
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Users</h2>
      
      <table className="min-w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Company Name</th>
            <th className="border p-2">Industry</th>
            <th className="border p-2">Phone</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="border p-2">
                {isEditing === user.id ? (
                  <input
                    type="text"
                    name="name"
                    value={editedUser.name}
                    onChange={handleEditChange}
                    className="border px-2 py-1 w-full"
                  />
                ) : (
                  user.name
                )}
              </td>
              <td className="border p-2">
                {isEditing === user.id ? (
                  <input
                    type="email"
                    name="email"
                    value={editedUser.email}
                    onChange={handleEditChange}
                    className="border px-2 py-1 w-full"
                  />
                ) : (
                  user.email
                )}
              </td>
              <td className="border p-2">
                {isEditing === user.id ? (
                  <input
                    type="text"
                    name="company_name"
                    value={editedUser.company_name}
                    onChange={handleEditChange}
                    className="border px-2 py-1 w-full"
                  />
                ) : (
                  user.company_name || 'N/A'
                )}
              </td>
              <td className="border p-2">
                {isEditing === user.id ? (
                  <select
                    name="industry"
                    value={editedUser.industry}
                    onChange={handleEditChange}
                    className="border px-2 py-1 w-full"
                  >
                    <option value="">Select Industry</option>
                    {industries.map((industry, index) => (
                      <option key={index} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </select>
                ) : (
                  user.industry || 'N/A'
                )}
              </td>
              <td className="border p-2">{user.phone}</td>
              <td className="border p-2">
                {isEditing === user.id ? (
                  <>
                    <button
                      onClick={saveChanges}
                      className="bg-green-500 text-white px-4 py-2 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="bg-red-500 text-white px-4 py-2 rounded ml-2"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => startEditing(user)}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Edit
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
