import React from 'react';
import BrandNavbar from '../components/BrandNavbar';
import { Wallet as WalletIcon } from 'lucide-react';

const Wallet = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <BrandNavbar user={user} onLogout={onLogout} />

      {/* Page Content */}
      <div className="p-8">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Wallet
            </h1>
            <p className="text-gray-600">
              Manage your payments and transactions
            </p>
          </div>

          {/* Empty State */}
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-200 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <WalletIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Wallet Coming Soon
            </h3>
            <p className="text-gray-600">
              Payment and transaction management features will be available here soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
