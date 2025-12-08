import React, { useEffect, useRef, useState } from 'react';
import { FiChevronDown, FiLogOut, FiMenu, FiUser } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getUserById } from '../Redux/Slice/staff.slice';
import userImg from "../Images/user.png";
import notification from "../Images/notification.png"
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../Utils/baseUrl';
import { fetchNotifications, receiveNotification, markNotificationSeen, clearAllNotifications, resetNotifications } from '../Redux/Slice/notifications.slice';
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
    } else if (userRole === 'admin' || userRole === 'receptionist') {
      navigate("/user-profile");
    } else if (userRole === 'Waiter') {
      navigate("/waiter/user-profile");
    } else if (userRole === 'Chef') {
      navigate("/chef/user-profile")
    } else if (userRole === 'Worker') {
      navigate("/worker/user-profile")
    } else if (userRole === 'Accountant') {
      navigate("/accountant/user-profile")
    } else if (userRole === 'Driver') {
      navigate("/driver/user-profile")
    } else {
      navigate('/');
    }

    setIsProfileOpen(false);
  }

  const handleLogout = () => {
    dispatch(resetNotifications());
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((k) => {
        if (k && k.startsWith('staff_notifications')) {
          localStorage.removeItem(k);
        }
      });
    } catch {}
    navigate('/');
  }

  const [notifi, setNotifi] = useState(false);
  const socketRef = useRef(null);
  const notifiRef = useRef(null);
  const bellRef = useRef(null);
  const { items: notifications = [], unread = 0 } = useSelector((state) => state.notifications || {});

 
  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (token && userId && !socketRef.current) {
      socketRef.current = io(SOCKET_URL, { auth: { token, userId }, transports: ['websocket','polling'], withCredentials: true });
      socketRef.current.emit('joinRoom', { userId });
      socketRef.current.on('connect', () => {});
      socketRef.current.on('connect_error', () => {});
      socketRef.current.on('error', () => {});
      socketRef.current.on('notify', (data) => {
        const role = (currentUser?.designation || '').toLowerCase();
        const myDeptId = currentUser?.department?._id || currentUser?.departmentId || null;
        const allowAll = role === 'admin';
        if (allowAll || !myDeptId || !data?.departmentId || String(myDeptId) === String(data.departmentId)) {
          dispatch(receiveNotification(data));
        }
      });
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [currentUser?.department?._id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      const insideDropdown = notifiRef.current && notifiRef.current.contains(target);
      const onBell = bellRef.current && bellRef.current.contains(target);
      if (!insideDropdown && !onBell) {
        setNotifi(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markSeen = async (id) => {
    dispatch(markNotificationSeen(id));
  };

  const toggleNotifi = () => {
    setNotifi((prev) => !prev);
  };
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
          <div className="flex items-center md:gap-5 ">
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
            <div className="relative" ref={bellRef}>
              <img src={notification} className='md:h-8 h-6  aspect-square cursor-pointer' onClick={toggleNotifi} />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded">
                  {unread}
                </span>
              )}
            </div>
            <div ref={notifiRef} className={`h-auto max-h-[400px] bg-white w-[300px] absolute top-full md:right-4 right-2 p-4 border rounded -z-[1] transform-all duration-500 ${notifi ? 'translate-y-0 shadow-xl' : '-translate-y-full'}`}>
              <div className='flex items-center justify-between border-b-2 pb-2'>
                <h1 className='text-xl text-senary font-semibold'>Notification</h1>
                <button
                  className='text-xs text-red-600 hover:underline'
                  onClick={async () => {
                    dispatch(clearAllNotifications());
                  }}
                >
                  Clear all
                </button>
              </div>
              <div className="mt-3 space-y-2 overflow-auto h-[320px]">
                {notifications.length === 0 ? (
                  <div className="text-center text-sm text-quaternary">No notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n._id} className={`p-2 rounded border ${n.seen ? 'border-secondary/20' : 'border-primary/40 bg-primary/10'}`}>
                      <div className="text-sm font-medium text-senary">{n.message}</div>
                      <div className="text-xs text-quaternary">{new Date(n.createdAt).toLocaleString()}</div>
                      {!n.seen && (
                        <button className="mt-1 text-xs text-blue-600" onClick={() => markSeen(n._id)}>Mark as read</button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Logout Modal */}
      {logoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setLogoutModalOpen(false)}></div>
          <div className="relative w-full max-w-md rounded-md bg-white p-6 shadow-xl mx-5">
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
