import React, { useEffect, useRef, useState } from 'react';
import { FiChevronDown, FiLogOut, FiMenu, FiUser } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getUserById } from '../Redux/Slice/staff.slice';
import userImg from "../Images/user.png";

const Header = ({ onMenuClick }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [imageUrl, setImageUrl] = useState(userImg);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const { currentUser, loading, success, message } = useSelector(
    (state) => state.staff
  );

  useEffect(() => {
    dispatch(getUserById());
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.image) {
      setImageUrl(currentUser.image);
    } else {
      setImageUrl(userImg);
    }
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleProfileMenu = () => {
    setIsProfileOpen((prev) => !prev);
  };

  const handleClickProfile = () => {
    const userRole = currentUser?.designation || 'user';
    // Navigate to the appropriate profile page
    if (userRole === 'Head of Department') {
      navigate('/hod/user-profile');
    } else if (userRole === 'admin') {
      navigate("/user-profile");
    } else if (userRole === 'Waiter') {
      navigate("/waiter/user-profile");
    } else if (userRole === 'Chef') {
      navigate("/chef/user-profile")
    }else if (userRole === 'Worker') {
      navigate("/worker/user-profile")
    } else if (userRole === 'Accountant') {
      navigate("/accountant/user-profile")
    } else {
      navigate('/');
    }

    setIsProfileOpen(false);
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/');
  }

  return (
    <>
      <header className="flex flex-col">
        <div className="flex items-center justify-between bg-white px-6 md:px-8 py-4 shadow-sm border-b border-secondary/20">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={onMenuClick}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-secondary/30 text-xl text-senary transition hover:bg-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              aria-label="Toggle sidebar"
            >
              <FiMenu />
            </button>
          </div>
          <div className="flex items-center gap-5">
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={toggleProfileMenu}
                className="flex items-center gap-3 rounded-full border border-transparent px-2 text-left transition"
                aria-haspopup="menu"
                aria-expanded={isProfileOpen}
              >
                <div className="text-right">
                  <p className="text-sm font-semibold text-senary leading-tight capitalize">
                    {currentUser?.name || "No Name"}
                  </p>
                  <p className="text-xs text-quaternary leading-tight capitalize">{currentUser?.designation || "No Role"}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white shadow-sm">
                  <img
                    src={imageUrl}
                    alt="Avatar"
                    className="h-full w-full rounded-full object-cover"
                    onError={(e) => (e.target.src = userImg)}
                  />
                </div>
                <FiChevronDown className="text-lg text-quaternary transition-transform" />
              </button>

              {isProfileOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 z-50 w-48 rounded-lg border border-secondary/20 bg-white py-2 shadow-lg"
                >
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-senary transition hover:bg-primary/20"
                    onClick={handleClickProfile}
                  >
                    <FiUser className="text-base" />
                    <span>Profile</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 transition hover:bg-red-50"
                    onClick={() => setLogoutModalOpen(true)}
                  >
                    <FiLogOut className="text-base" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* Logout Modal */}

      {logoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setLogoutModalOpen(false)}></div>
          <div className="relative w-full max-w-md rounded-md bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-black">Logout</h2>
              <button onClick={() => setLogoutModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-700 mb-8 text-center">Are you sure you want to logout?</p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setLogoutModalOpen(false)}
                className="mv_user_cancel hover:bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="mv_user_add bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] hover:from-white hover:to-white"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;