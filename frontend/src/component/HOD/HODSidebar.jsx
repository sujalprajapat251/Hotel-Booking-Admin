import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FiGrid, FiLayers, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { HiOutlineLocationMarker } from 'react-icons/hi';
import { LuContact, LuUsers } from 'react-icons/lu';
import { RxDashboard } from "react-icons/rx";

// HOD menu items
const hodSections = [
  {
    title: null,
    key: 'main',
    items: [
      { icon: RxDashboard, label: 'Dashboard', path: '/hod/dashboard' },
      { icon: LuUsers, label: 'Staff', path: '/hod/staff' },
      { icon: FiGrid, label: 'Table', path: '/hod/table' },
      { icon: FiLayers, label: 'History', path: '/hod/history' },
      ],
  },
];

const SidebarHeading = ({ title }) => (
  <div className="px-6 pt-8 pb-3 text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
    -- {title}
  </div>
);

const badgeStyles = {
  info: 'bg-blue-100 text-blue-600',
  warning: 'bg-amber-100 text-amber-600',
  success: 'bg-emerald-100 text-emerald-600',
};

const MenuItem = ({ icon: Icon, label, badge, open, path, subMenus, onItemClick }) => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(
    subMenus && subMenus.some(subMenu => location.pathname === subMenu.path)
  );
  const isActive = location.pathname === path || (subMenus && subMenus.some(subMenu => location.pathname === subMenu.path));

  useEffect(() => {
    if (subMenus) {
      const shouldExpand = subMenus.some(subMenu => location.pathname === subMenu.path);
      setIsExpanded(shouldExpand);
    }
  }, [location.pathname, subMenus]);

  const handleClick = (e) => {
    if (subMenus && open) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    } else {
      onItemClick?.();
    }
  };

  return (
    <div className="px-3 mb-1">
      <NavLink
        to={path}
        className={({ isActive: navActive }) =>
          [
            'group relative flex w-full items-center text-left text-sm font-medium transition-all duration-300 rounded-xl overflow-hidden',
            open ? 'px-4 py-3' : 'px-3 py-3 justify-center',
            (navActive || isActive) ? 'text-senary font-semibold bg-primary/100 shadow-lg shadow-primary/30' : 'text-senary hover:bg-primary/30',
          ].join(' ')
        }
        aria-label={!open ? label : undefined}
        onClick={handleClick}
      >

        {/* Animated shine effect on hover */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

        <div
          className={`relative flex min-w-0 flex-1 items-center ${open ? 'gap-3' : 'justify-center'}`}
        >
          <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg transition-all duration-300 ${(isActive)
              ? 'bg-primary text-senary scale-110'
              : 'bg-primary/25 text-senary group-hover:bg-primary group-hover:scale-105'
            }`}>
            <Icon />
          </span>
          {open ? (
            <>
              <span className="truncate flex-1">{label}</span>
              {subMenus ? (
                <span className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
                  <FiChevronDown className="w-4 h-4" />
                </span>
              ) : null}
              {badge ? (
                <span
                  className={`ml-auto rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeStyles[badge.tone]}`}
                >
                  {badge.text}
                </span>
              ) : null}
            </>
          ) : null}
          {!open ? <span className="sr-only">{label}</span> : null}
        </div>
      </NavLink>
      {subMenus && open && isExpanded && (
        <div className="ml-6 space-y-1 border-l-2 border-primary/20">
          {subMenus.map((subMenu) => (
            <NavLink
              key={subMenu.path}
              to={subMenu.path}
              className={({ isActive }) =>
                [
                  'group flex w-full items-center text-left text-sm font-medium transition px-4 py-2 rounded-lg',
                  isActive ? 'text-senary bg-primary/50' : 'text-quinary hover:bg-primary/30',
                ].join(' ')
              }
              onClick={onItemClick}
            >
              <span className="truncate">{subMenu.label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

const HODSidebar = ({ open = true, isMobile = false, isCompact = false, onClose }) => {  
  const sections = hodSections;
  const containerClasses = [
    'flex h-screen flex-col overflow-y-auto border-r border-secondary/20 bg-white shadow-sm transition-all duration-200 ease-in-out',
  ];

  if (isMobile) {
    containerClasses.push(
      'fixed inset-y-0 left-0 z-40 w-72 transform',
      open ? 'translate-x-0' : '-translate-x-full'
    );
  } else {
    containerClasses.push('fixed inset-y-0 left-0 z-40', open ? 'w-72' : 'w-20');
  }

  const handleItemClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <aside
      className={containerClasses.join(' ')}
      aria-hidden={isMobile && !open}
      data-compact={isCompact ? 'true' : 'false'}
    >
      <div
        className={`flex items-center gap-3 ${
          open ? 'px-6 pt-4 pb-[14px]' : 'px-0 pt-4 pb-[14px] justify-center'
        }`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-senary">
          <HiOutlineLocationMarker className="text-2xl" />
        </div>
        {open ? (
          <div>
            <p className="text-xl font-semibold text-senary">Taj Hotel</p>
            <p className="text-xs text-gray-500">HOD Panel</p>
          </div>
        ) : null}
      </div>

      <nav className="pb-10">
        {sections.map(({ title, key, items }) => (
          <React.Fragment key={key}>
            {open && title ? <SidebarHeading title={title} /> : null}
            <div className="space-y-1">
              {items.map((item) => (
                <MenuItem
                  key={item.label}
                  {...item}
                  open={open}
                  onItemClick={isMobile ? handleItemClick : undefined}
                />
              ))}
            </div>
          </React.Fragment>
        ))}
      </nav>
    </aside>
  );
};

export default HODSidebar;