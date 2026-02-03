import React, { useState, useEffect } from 'react';
import {  useAddPaymentAccountMutation,
    useGetPaymentMethodListQuery,
    useGetPaymentAccountByUserQuery, } from "../../../redux/features/withdraw";
import { useDispatch } from 'react-redux';

const AddPaymentAccount = () => {
  const [accountData, setAccountData] = useState({
   
    account_name: '',
    payment_method_id: 0,
    account_number: '',
    isDefault: false,
    isActive: 1,
  });

  const [isMFS, setIsMFS] = useState(true); // Default to MFS

  // Get payment method list
  const { data: paymentMethods, isLoading: paymentMethodsLoading } = useGetPaymentMethodListQuery();

  // Get seller's existing payment accounts
  const { data: sellerAccounts, isLoading: sellerAccountsLoading , refetch} = useGetPaymentAccountByUserQuery(1); // Assuming seller_id = 1

  // Create payment account mutation
  const [createPaymentAccount, { isLoading: createLoading, error: createError }] = useAddPaymentAccountMutation();

  const handleCheckboxChange = (e) => {
    setIsMFS(e.target.checked);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAccountData({
      ...accountData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const accountDataSubmit = {
      seller_id: 1, // Assuming seller_id is static for now, or get it dynamically
      account_name: accountData.account_name,
      payment_method_id: accountData.payment_method_id,
      account_number: accountData.account_number,
      isDefault: accountData.isDefault ? 1 : 0,
      type: "mfs", // Or whatever type you are using (mfs, bank, etc.)
      isActive:1, // Or whatever type you are using (mfs, bank, etc.)
    };
  
    try {
      await createPaymentAccount(accountDataSubmit).unwrap();
      alert('Payment account added successfully');
      refetch();
    } catch (err) {
      console.error('Error: ', err);
      alert('Error adding payment account');
    }
  };

  // Loading states for the API data
  if (paymentMethodsLoading || sellerAccountsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Payment Account</h2>

        {/* Payment Type Checkbox */}
        <div className="flex items-center mb-6">
          <input
            type="checkbox"
            checked={isMFS}
            onChange={handleCheckboxChange}
            className="mr-2"
          />
          <span className="font-semibold text-gray-700">MFS</span>
          <input
            type="checkbox"
            disabled
            checked={!isMFS}
            className="ml-6 mr-2"
          />
          <span className="font-semibold text-gray-700">Bank (Disabled)</span>
        </div>

        {/* MFS Form (only visible if MFS is selected) */}
        {isMFS && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex space-x-4">
              {/* Account Name */}
              <div className="w-full">
                <label className="block text-gray-600">Account Name</label>
                <input
                  type="text"
                  name="account_name"
                  value={accountData.account_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              {/* Payment Method Dropdown */}
              <div className="w-full">
                <label className="block text-gray-600">Payment Method</label>
                <select
                  name="payment_method_id"
                  value={accountData.payment_method_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Payment Method</option>
                  {paymentMethods?.data.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.payment_method_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-gray-600">Account Number</label>
              <input
                type="text"
                name="account_number"
                value={accountData.account_number}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            {/* Is Default */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isDefault"
                checked={accountData.isDefault}
                onChange={(e) => setAccountData({ ...accountData, isDefault: e.target.checked })}
                className="mr-2"
              />
              <span className="text-gray-600">Set as Default Account</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md"
              disabled={createLoading}
            >
              {createLoading ? 'Adding...' : 'Add Payment Account'}
            </button>
          </form>
        )}

        {/* Table for showing existing payment accounts */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">My Accounts</h3>
          <table className="min-w-full table-auto bg-white shadow-lg rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Account Name</th>
                <th className="px-4 py-2 text-left">Payment Method</th>
                <th className="px-4 py-2 text-left">Account Number</th>
                <th className="px-4 py-2 text-left">Is Default</th>
              </tr>
            </thead>
            <tbody>
              {sellerAccounts?.data.map((account) => (
                <tr key={account.id} className="border-t">
                  <td className="px-4 py-2">{account.account_name}</td>
                  <td className="px-4 py-2">{account.payment_method.payment_method_name}</td>
                  <td className="px-4 py-2">{account.account_number}</td>
                  <td className="px-4 py-2">{account.isDefault ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AddPaymentAccount;
