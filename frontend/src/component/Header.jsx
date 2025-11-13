import React, { useEffect, useRef, useState } from 'react';
import { FiChevronDown, FiLogOut, FiMenu, FiUser } from 'react-icons/fi';

const Header = ({ onMenuClick }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

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
              className="flex items-center gap-3 rounded-full border border-transparent px-2 py-2 text-left transition hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              aria-haspopup="menu"
              aria-expanded={isProfileOpen}
            >
              <div className="text-right">
                <p className="text-sm font-semibold text-senary leading-tight">
                  Ella Jones
                </p>
                <p className="text-xs text-quaternary leading-tight">Admin</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white shadow-sm">
                <img
                  src="https://i.pravatar.cc/54?img=47"
                  alt="Ella Jones"
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
              <FiChevronDown className="text-lg text-quaternary transition-transform" />
            </button>

            {isProfileOpen ? (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-48 rounded-lg border border-secondary/20 bg-white py-2 shadow-lg"
              >
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-senary transition hover:bg-primary/20"
                >
                  <FiUser className="text-base" />
                  <span>Profile</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 transition hover:bg-red-50"
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