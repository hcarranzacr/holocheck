import React from 'react';
import { Menu, X, Bell, User } from 'lucide-react';

const Header = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      {/* Mobile menu button */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Logo/Title */}
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-gray-900 lg:hidden">
          HoloCheck
        </h1>
        <h1 className="hidden lg:block text-xl font-bold text-gray-900">
          Panel de Control - HoloCheck
        </h1>
      </div>

      {/* Right side actions */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
          <Bell className="w-5 h-5" />
        </button>

        {/* User profile */}
        <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
          <User className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;