import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, User, Crown, Settings, LogOut } from 'lucide-react';

const BrandNavbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Determine active page based on current path
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <a href="/" className="inline-flex items-center">
            <img src="/logo-name-top.png" alt="Sera Ai" className="h-10 w-auto" />
          </a>
          <nav className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/brand')}
              className={`font-medium ${
                isActive('/brand') && location.pathname === '/brand'
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Home
            </button>
            <button 
              onClick={() => navigate('/brand/campaigns')}
              className={`font-medium ${
                isActive('/brand/campaigns')
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Campaigns
            </button>
            <button 
              onClick={() => navigate('/brand/reports')}
              className={`font-medium ${
                isActive('/brand/reports')
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Reports
            </button>
            <button 
              onClick={() => navigate('/brand/wallet')}
              className={`font-medium ${
                isActive('/brand/wallet')
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Wallet
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <User className="w-5 h-5 text-gray-600" />
            </button>
            
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    // Add upgrade logic here
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-3 text-gray-700"
                >
                  <Crown className="w-4 h-4 text-blue-600" />
                  <span>Upgrade</span>
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/brand/settings');
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-3 text-gray-700"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-3 text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandNavbar;
