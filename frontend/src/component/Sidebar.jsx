import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FiCalendar,
  FiGrid,
  FiLayers,
  FiMail,
  FiBookOpen,
  FiChevronDown,
  FiChevronRight,
} from 'react-icons/fi';
import {
  HiOutlineLocationMarker,
} from 'react-icons/hi';
import {
  LuAppWindow,
  LuBed,
  LuBuilding2,
  LuContact,
  LuNotebookPen,
  LuUsers,
  LuInfo,
} from 'react-icons/lu';
import { RxDashboard } from "react-icons/rx";
import { IoHelpCircleOutline, IoPhonePortraitOutline, IoCarSportOutline } from "react-icons/io5";
import { MdCleaningServices  } from "react-icons/md";
import { VscChecklist, VscCodeReview } from "react-icons/vsc";
import { RiBloggerLine } from "react-icons/ri";
import { CiCoffeeCup } from "react-icons/ci";
import { GiMartini, GiAutoRepair  } from "react-icons/gi";
import { HiOutlineUserGroup } from "react-icons/hi";
import { IoIosRestaurant } from "react-icons/io";
import { PiBroomLight } from "react-icons/pi";
import { HiInboxArrowDown } from 'react-icons/hi2';

// Admin menu items
const adminSections = [
  {
    title: null,
    key: 'main',
    items: [
      { icon: RxDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: VscChecklist , label: 'Bookings', path: '/allbookings' },
      { icon: HiOutlineUserGroup, label: 'UserList', path: '/user' },
      {
        icon: LuBed,
        label: 'Rooms',
        path: '/rooms',
        subMenus: [
          { label: 'Create Room', path: '/rooms/create' },
          { label: 'New Room type', path: '/rooms/room-type' },
          { label: 'Available Rooms', path: '/rooms/available' },
          { label: 'Room Features', path: '/rooms/features' },
        ]
      },
      {
        icon: CiCoffeeCup,
        label: 'Cafe',
        path: '/cafe',
        subMenus: [
          { label: 'Cafe Category', path: '/cafe/cafecategory' },
          { label: 'Cafe Items', path: '/cafe/cafeitems' },
          { label: 'Cafe Order', path: '/cafe/cafeorder' },
        ]
      },
      {
        icon: GiMartini,
        label: 'Bar',
        path: '/bar',
        subMenus: [
          { label: 'Bar Category', path: '/bar/barcategory' },
          { label: 'Bar Items', path: '/bar/baritems' },
          { label: 'Bar Order', path: '/bar/barorder' },
        ]
      },
      {
        icon: IoIosRestaurant,
        label: 'Restaurant',
        path: '/restaurant',
        subMenus: [
          { label: 'Restaurant Category', path: '/restaurant/restaurantcategory' },
          { label: 'Restaurant Items', path: '/restaurant/restaurantitems' },
          { label: 'Restaurant Order', path: '/restaurant/restaurantorder' },
        ]
      },
      {
        icon: IoCarSportOutline,
        label: 'Cabs',
        path: '/cabs',
        subMenus: [
          { label: 'Cab details', path: '/cabs/cabdetails' },
          { label: 'Driver Details', path: '/cabs/drivwerdetails' },
          { label: 'Cab Bookings', path: '/cabs/cabbooking' },
        ]
      },
      {
        icon: LuUsers,
        label: 'Staff',
        path: '/staff',
        subMenus: [
          { label: 'Staff Details', path: '/staff/staffdetails' },
          { label: 'Add Staff', path: '/staff/addstaff' },
        ]
      },
      { icon: PiBroomLight , label: 'House Keepings', path: '/housekeeping' },
      { icon: HiInboxArrowDown , label: 'Order Request', path: '/orderrequest' },
      { icon: LuBuilding2, label: 'Departments', path: '/departments' },
      {
        icon: LuInfo,
        label: 'About',
        path: '/about',
        subMenus: [
          { label: 'About', path: '/about/about' },
          { label: 'Add About', path: '/about/addabout' },
        ]
      },
      {
        icon: RiBloggerLine,
        label: 'Blog',
        path: '/blog',
        subMenus: [
          { label: 'Blog', path: '/blog/blog' },
          { label: 'Add Blog', path: '/blog/addblog' },
        ]
      },
      { icon: VscCodeReview, label: 'Review', path: '/review' },
      { icon: IoPhonePortraitOutline, label: 'Contact', path: '/contact' },
      { icon: IoHelpCircleOutline, label: 'Help', path: '/help' },
      { icon: FiBookOpen, label: 'Terms & Conditions', path: '/terms' },
    ],
  },
];

// Receptionist/User menu items
const receptionistSections = [
  {
    title: null,
    key: 'main',
    items: [
      { icon: RxDashboard, label: 'Booking Dashboard', path: '/booking-dashboard' },
      { icon: VscChecklist , label: 'Bookings', path: '/allbookings' },
      { icon: MdCleaningServices, label: 'Cleanings', path: '/cleanings' },
      { icon: GiAutoRepair, label: 'Maintenence', path: '/maintenence' },
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
            (navActive || isActive)
              ? 'text-senary font-semibold bg-primary/100 shadow-lg shadow-primary/30'
              : 'text-senary hover:bg-primary/30',
          ].join(' ')
        }
        aria-label={!open ? label : undefined}
        onClick={handleClick}
      >
        {/* Animated shine effect on hover */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

        <div className={`relative flex min-w-0 flex-1 items-center ${open ? 'gap-3' : 'justify-center'}`}>
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
                <span className={`ml-auto rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeStyles[badge.tone]}`}>
                  {badge.text}
                </span>
              ) : null}
            </>
          ) : null}
          {!open ? <span className="sr-only">{label}</span> : null}
        </div>
      </NavLink>

      {/* Animated submenu */}
      {subMenus && open && (
        <div className={`mt-1 space-y-1 overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}>
          <div className="ml-8 pl-4 border-l-2 border-senary/25 space-y-0.5 py-1">
            {subMenus.map((subMenu, index) => (
              <NavLink
                key={subMenu.path}
                to={subMenu.path}
                className={({ isActive }) =>
                  [
                    'group flex w-full items-center text-left text-sm font-medium transition-all duration-200 px-3 py-2.5 rounded-lg relative',
                    isActive
                      ? 'text-senary bg-primary/50 font-semibold'
                      : 'text-quinary hover:bg-primary/30',
                  ].join(' ')
                }
                onClick={onItemClick}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: isExpanded ? 'slideIn 0.3s ease-out forwards' : 'none'
                }}
              >
                {({ isActive }) => (
                  <>
                    <span className={`w-1.5 h-1.5 rounded-full mr-3 transition-all duration-200 ${isActive ? 'bg-senary scale-125' : 'bg-quinary/30 group-hover:bg-senary'
                      }`} />
                    <span className="truncate">{subMenu.label}</span>
                    {isActive && (
                      <span className="ml-auto">
                        <svg className="w-4 h-4 text-senary" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Sidebar = ({ open = true, isMobile = false, isCompact = false, onClose }) => {
  const authState = useSelector((state) => state.auth);
  const user = authState?.user || null;
  const userRole = user?.designation || 'user';

  const sections = userRole === 'admin' ? adminSections : receptionistSections;
  const containerClasses = [
    'flex h-screen flex-col bg-gradient-to-b from-slate-50 to-white border-r border-slate-200 shadow-xl transition-all duration-300 ease-in-out',
  ];

  if (isMobile) {
    containerClasses.push(
      'fixed inset-y-0 left-0 z-40 w-72 transform',
      open ? 'translate-x-0' : '-translate-x-full'
    );
  } else {
    containerClasses.push('fixed inset-y-0 left-0 z-[15]', open ? 'w-72' : 'w-20');
  }

  const handleItemClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <>
      <aside
        className={containerClasses.join(' ')}
        aria-hidden={isMobile && !open}
        data-compact={isCompact ? 'true' : 'false'}
      >
        {/* Premium Header */}
        <div
          className={`flex items-center gap-3 ${open ? 'px-6 pt-4 pb-[14px]' : 'px-0 pt-4 pb-[14px] justify-center'
            }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-senary">
            <HiOutlineLocationMarker className="text-2xl" />
          </div>
          {open ? (
            <div>
              <p className="text-xl font-semibold text-senary">Taj Hotel</p>  
            </div>
          ) : null}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          {sections.map(({ title, key, items }) => (
            <React.Fragment key={key}>
              {open && title && <SidebarHeading title={title} />}
              <div>
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
    </>
  );
};

export default Sidebar;