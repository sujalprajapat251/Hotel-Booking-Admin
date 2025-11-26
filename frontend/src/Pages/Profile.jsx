import React, { useEffect, useState } from 'react';
import { X, Eye, EyeOff, Edit2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserById, updatestaff } from '../Redux/Slice/staff.slice';
import { changePassword } from '../Redux/Slice/auth.slice';
import { setAlert } from '../Redux/Slice/alert.slice';
import userImg from "../Images/user.png";
import { IMAGE_URL } from "../Utils/baseUrl";
import { FaCamera } from "react-icons/fa";

const Profile = () => {
  const dispatch = useDispatch();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [imageUrl, setImageUrl] = useState(userImg);
  const [avatarFile, setAvatarFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const { currentUser, loading, success, message } = useSelector(
    (state) => state.staff
  );

  useEffect(() => {
    dispatch(getUserById());
  }, []);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    gender: "",
    mobileno: "",
    address: "",
    joiningdate: ""
  });

  useEffect(() => {
    if (currentUser) {
      setForm({
        name: currentUser.name || "",
        email: currentUser.email || "",
        gender: currentUser.gender || "",
        mobileno: currentUser.mobileno || "",
        address: currentUser.address || "",
        joiningdate: currentUser.joiningdate || ""
      });
    }
  }, [currentUser]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitPassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      dispatch(setAlert({ text: 'New password and confirm password do not match!', color: 'error' }));
      return;
    }
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      dispatch(setAlert({ text: 'Please fill in all fields!', color: 'error' }));
      return;
    }
    setShowPasswordModal(false);
    dispatch(changePassword({
      oldPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
      confirmPassword: passwordData.confirmPassword
    }));
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  useEffect(() => {
    if (currentUser && currentUser.image) {
      setImageUrl(IMAGE_URL + currentUser.image);
    } else {
      setImageUrl(userImg);
    }
  }, [currentUser]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        dispatch(setAlert({ text: 'Please select a valid image file', color: 'error' }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        dispatch(setAlert({ text: 'File size should be less than 5MB', color: 'error' }));
        return;
      }
      setAvatarFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditToggle = () => {
    if (isEditMode) {
      // Save changes
      handleSubmit();
    } else {
      // Enter edit mode
      setIsEditMode(true);
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    // Reset form to current user data
    if (currentUser) {
      setForm({
        name: currentUser.name || "",
        email: currentUser.email || ""
      });
    }
    // Reset avatar
    if (currentUser && currentUser.image) {
      setImageUrl(IMAGE_URL + currentUser.image);
    } else {
      setImageUrl(userImg);
    }
    setAvatarFile(null);
  };


  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!currentUser?._id) {
      dispatch(setAlert({ text: "User ID not found. Please refresh and try again.", color: 'error' }));
      return;
    }

    setIsSubmitting(true);
    const id = currentUser._id;
    const values = {
      name: form.name,
      email: form.email,
      gender: form.gender,
      mobileno: form.mobileno,
      address: form.address,
      joiningdate: form.joiningdate
    };

    try {
      // updatestaff action
      const result = await dispatch(
        updatestaff({ id, values, file: avatarFile })
      );
      if (updatestaff.fulfilled.match(result)) {
        setAvatarFile(null);
        if (result.payload?.photo) {
          setImageUrl(IMAGE_URL + result.payload.photo);
        }
        setIsEditMode(false);
      } else {
        console.error("Failed to update profile:", result.payload);
      }

      // For now, just simulate success
      setIsEditMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      dispatch(setAlert({ text: 'Failed to update profile', color: 'error' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  return (
    <div className="h-full bg-[#F0F3FB] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5 md:gap-9">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                <div className="relative flex items-center justify-center">
                  {/* Gradient Circle Background */}
                  <div className="absolute w-[70px] h-[70px] md:w-[100px] md:h-[100px] 
                  bg-gradient-to-br from-[#6A5AE0] to-[#9C6ADE] 
                  rounded-full flex items-center justify-center">
                  </div>

                  {/* Avatar Image */}
                  <div className="relative w-[70px] h-[70px] md:w-[100px] md:h-[100px]">
                    <img
                      src={imageUrl}
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover border-4 border-white shadow-md"
                      onError={(e) => (e.target.src = userImg)}
                    />

                    {/* Camera Button */}
                    {isEditMode && (
                      <label htmlFor="avatar-upload" className="absolute -bottom-2 -right-1/4 -translate-x-1/2 bg-white w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full cursor-pointer shadow-lg hover:scale-105 transition-transform">
                        <FaCamera className="text-black text-lg md:text-md" />
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                          disabled={isSubmitting}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-semibold text-gray-900 capitalize">{currentUser?.name || 'No Name'}</h2>
                <p className="text-gray-600 text-sm md:text-base capitalize">{currentUser?.designation || 'No role'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {isEditMode && (
                <button
                  onClick={handleCancel}
                  className="flex items-center justify-center gap-2 mv_user_cancel hover:bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A]"
                  disabled={isSubmitting}
                >
                  <span className="text-sm font-medium">Cancel</span>
                </button>
              )}
              <button
                onClick={handleEditToggle}
                className="mv_user_add flex items-center justify-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] rounded-lg"
                disabled={isSubmitting}
              >
                <Edit2 className="w-6 sm:w-4 h-6 sm:h-4" />
                <span className="text-sm font-medium">
                  {isSubmitting ? 'Updating...' : isEditMode ? 'Update Profile' : 'Edit Profile'}
                </span>
              </button>
            </div>
          </div>
          {/* </div> */}

          {/* Personal Information */}
          {/* <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-6"> */}
          <div className="flex items-center justify-between pt-6 md:pt-8 mt-6 mb-3">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900">Personal Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-500 mb-2">User Name</label>
              {isEditMode ? (
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                  placeholder="Enter your name"
                />
              ) : (
                <p className="text-base text-gray-900 capitalize">{currentUser?.name || 'No Name'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-2">Email address</label>
              {isEditMode ? (
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  className={`w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F] ${currentUser?.designation !== "admin" ? "text-gray-400 cursor-not-allowed" : "text-black"}`}
                  placeholder="Enter your email"
                  disabled={currentUser?.designation !== "admin" && true}
                />
              ) : (
                <p className="text-base text-gray-900">{currentUser?.email || 'No Email'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-2">Role</label>
              <p className="text-base text-gray-900 capitalize">{currentUser?.designation || 'No role'}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-2">Gender</label>

              {isEditMode ? (
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleInputChange}
                  className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              ) : (
                <p className="text-base text-gray-900 capitalize">
                  {currentUser?.gender || 'No Gender'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-2">Mobile No.</label>
              {isEditMode ? (
                <input
                  type="number"
                  name="mobileno"
                  value={form.mobileno}
                  onChange={handleInputChange}
                  className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                  placeholder="Enter your Mobile No."
                />
              ) : (
                <p className="text-base text-gray-900 capitalize">{currentUser?.mobileno || 'No Mobile'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-2">Joining Date</label>
              <p className="text-base text-gray-900 capitalize">{formatDate(currentUser?.joiningdate) || 'No Joining Date'}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-2">Address</label>
              {isEditMode ? (
                <textarea
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleInputChange}
                  className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F] resize-none"
                  placeholder="Enter your Address"
                />
              ) : (
                <p className="text-base text-gray-900 capitalize">{currentUser?.address || 'No Address'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Change Password Section */}
        {currentUser?.designation === "admin" && (
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">Security</h3>
                <p className="text-sm text-gray-600">Manage your password and security settings</p>
              </div>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="mv_user_add flex items-center justify-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] rounded-lg"
              >
                Reset Password
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Reset Password</h2>
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
                      className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
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
                      className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
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
                      className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
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

              <div className="flex gap-3 mt-6 justify-center">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex items-center justify-center gap-2 mv_user_cancel hover:bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] mr-0"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitPassword}
                  className="flex items-center justify-center text-sm gap-2 px-4 py-2 bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] rounded-[4px] border border-black h-[45px] w-[160px] text-black transition-all duration-300 ease-in-out"
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