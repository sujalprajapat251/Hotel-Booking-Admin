import React, { useEffect, useRef, useState } from 'react';
import { FiChevronDown, FiLogOut, FiMenu, FiUser } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { getUserById } from '../Redux/Slice/user.slice';
import userImg from "../Images/user.png";
import { IMAGE_URL } from '../Utils/baseUrl';

const Header = ({ onMenuClick }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [imageUrl, setImageUrl] = useState(userImg);

  const { currentUser, loading, success, message } = useSelector(
    (state) => state.user
  );

  useEffect(() => {
    dispatch(getUserById());
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.photo) {
      setImageUrl(IMAGE_URL + currentUser.photo);
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
    // Check if we're in the HOD panel or normal panel
    const isHODPanel = location.pathname.startsWith('/hod/');
   
    // Navigate to the appropriate profile page
    if (isHODPanel) {
      navigate('/hod/user-profile');
    } else {
      navigate('/user-profile');
    }
   
    setIsProfileOpen(false);
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/');
  }

  return (
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
                <p className="text-xs text-quaternary leading-tight capitalize">{currentUser?.role || "No Role"}</p>
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
                  onClick={handleLogout}
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
  );
};

export default Header;