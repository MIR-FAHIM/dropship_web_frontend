import React, { useState } from 'react';

const ProfilePage = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-r from-white-50 to-white-100 p-6 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-3xl p-8 text-center">
        <div className="relative w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-blue-500 shadow-md">
          <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" alt="User Profile" className="w-full h-full object-cover" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">John Doe</h2>
        <p className="text-gray-600 text-sm">@johndoe</p>
        <p className="mt-3 text-gray-500">Software Engineer | Tech Enthusiast | Content Creator</p>
        <div className="flex justify-center gap-4 mt-5">
          <button className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition">Edit Profile</button>
          <button className="px-5 py-2 border border-gray-300 rounded-lg shadow-md text-gray-700 hover:bg-gray-100 transition">Settings</button>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-6">
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold text-gray-900">1.2K</span>
            <span className="text-sm text-gray-500">Followers</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold text-gray-900">580</span>
            <span className="text-sm text-gray-500">Following</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold text-gray-900">30</span>
            <span className="text-sm text-gray-500">Posts</span>
          </div>
        </div>
        <div className="mt-6 text-left">
          <h3 className="text-lg font-semibold text-gray-900">About Me</h3>
          <p className="text-sm text-gray-600 mt-2">Passionate about technology and innovation. I love coding, writing, and sharing knowledge with the world.</p>
        </div>
                <div className="mt-6 p-4 rounded-lg shadow-md bg-gradient-to-r from-green-400 to-gray-300">
          <h3 className="text-xl font-semibold mb-2 text-white">⭐ Reseller Tier Journey</h3>
          <ul className="flex space-x-4 text-sm">
            <li className="text-green-800 bg-green-100 px-3 py-1 rounded-full">✔ Bronze - Completed</li>
            <li className="text-green-800 bg-green-100 px-3 py-1 rounded-full">✔ Silver - Completed</li>
            <li className="text-yellow-800 bg-yellow-100 px-3 py-1 rounded-full">🔜 Gold - In Progress</li>
            <li className="text-gray-800 bg-gray-100 px-3 py-1 rounded-full">🔒 Platinum - Locked</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
