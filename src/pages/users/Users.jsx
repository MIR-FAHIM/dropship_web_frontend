import React, { useState, useEffect } from "react";
import { useGetAllClientQuery } from "../../redux/features/client";

const Users = () => {
  const { data, isLoading, error } = useGetAllClientQuery(); // Fetch users using the API
  const [users, setUsers] = useState([]);
  const [isEditing, setIsEditing] = useState(null); // Track which user is being edited
  const [editedUser, setEditedUser] = useState({}); // Store edited user data

  // List of industries for the select dropdown
  const industries = ["Technology", "Healthcare", "Finance", "Retail", "Manufacturing"];

  // Update the local users state when API data changes
  useEffect(() => {
    if (data && data.data) {
      setUsers(data.data.data); // API's `data.data` contains the list of users
    }
  }, [data]);

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

  // Save changes to the user data (for now, only update local state)
  const saveChanges = () => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === editedUser.id ? { ...user, ...editedUser } : user
      )
    );
    setIsEditing(null); // Exit editing mode
  };

  // Cancel editing
  const cancelEditing = () => {
    setIsEditing(null); // Exit editing mode
  };

  if (isLoading) {
    return <p>Loading users...</p>;
  }

  if (error) {
    return <p>Error fetching users: {error.message}</p>;
  }

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
                  user.company_name || "N/A"
                )}
              </td>
              <td className="border p-2">
                {isEditing === user.id ? (
                  <select
                    name="industry_type"
                    value={editedUser.industry_type || ""}
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
                  user.industry_type || "N/A"
                )}
              </td>
              <td className="border p-2">{user.phone || "N/A"}</td>
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
