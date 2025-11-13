import React, { useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../component/Sidebar';
import Header from '../component/Header';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const wasMobileRef = useRef(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 425;
      setIsMobile(mobile);

      if (mobile) {
        setIsSidebarOpen(false);
      } else if (wasMobileRef.current) {
        setIsSidebarOpen(true);
      }

      wasMobileRef.current = mobile;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar open={isSidebarOpen} isMobile={isMobile} onClose={closeSidebar} />
      {isMobile && isSidebarOpen ? (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm"
          aria-hidden="true"
          onClick={closeSidebar}
        />
      ) : null}
      <main className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={toggleSidebar} />
        <div className="flex-1 overflow-y-auto bg-slate-50">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;