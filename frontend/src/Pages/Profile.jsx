import React, { useState } from 'react';
import { Edit2, X, Eye, EyeOff } from 'lucide-react';

const Profile = () => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitPassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New password and confirm password do not match!');
      return;
    }
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      alert('Please fill in all fields!');
      return;
    }
    alert('Password changed successfully!');
    setShowPasswordModal(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="min-h-screen bg-[#F0F3FB] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
        
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                <div className="w-14 h-14 md:w-18 md:h-18 rounded-full bg-blue-200 flex items-center justify-center overflow-hidden">
                  <svg className="w-10 h-10 md:w-12 md:h-12 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-semibold text-gray-900">Helen T. Harper</h2>
                <p className="text-gray-600 text-sm md:text-base">Team Manager</p>
                <p className="text-gray-500 text-xs md:text-sm">Leeds, London.</p>
              </div>
            </div>
            {/* <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
              <Edit2 className="w-4 h-4" />
              <span className="text-sm font-medium">Edit</span>
            </button> */}
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900">Personal Information</h3>
            {/* <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
              <Edit2 className="w-4 h-4" />
              <span className="text-sm font-medium">Edit</span>
            </button> */}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-500 mb-2">First Name</label>
              <p className="text-base text-gray-900">Helen</p>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-2">Last Name</label>
              <p className="text-base text-gray-900">Harper</p>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-2">Email address</label>
              <p className="text-base text-gray-900">HelenTHarper@jourrapide.com</p>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-2">Phone</label>
              <p className="text-base text-gray-900">+09 345 346 46</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-500 mb-2">Bio</label>
              <p className="text-base text-gray-900">Team Manager</p>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900">Address</h3>
            {/* <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
              <Edit2 className="w-4 h-4" />
              <span className="text-sm font-medium">Edit</span>
            </button> */}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-500 mb-2">Country</label>
              <p className="text-base text-gray-900">London</p>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-2">City/State</label>
              <p className="text-base text-gray-900">Leeds, East London</p>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-2">Postal Code</label>
              <p className="text-base text-gray-900">ERT 2354</p>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-2">TAX ID</label>
              <p className="text-base text-gray-900">AS46545756</p>
            </div>
          </div>
        </div>

        {/* Change Password Section */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">Security</h3>
              <p className="text-sm text-gray-600">Manage your password and security settings</p>
            </div>
            <button 
              onClick={() => setShowPasswordModal(true)}
              className="px-6 py-2.5 bg-[#755647] text-white rounded-lg hover:bg-[#977b6e] transition-colors text-sm font-medium"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
                <button 
                  onClick={() => setShowPasswordModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitPassword}
                  className="flex-1 px-4 py-2.5 bg-[#755647] text-white rounded-lg hover:bg-[#977b6e] transition-colors font-medium"
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;