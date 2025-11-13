import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiCalendar,
  FiGrid,
  FiLayers,
  FiMail,
  FiPlus,
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
  LuInfo ,
} from 'react-icons/lu';
import { RxDashboard } from "react-icons/rx";
import { IoHelpCircleOutline , IoPhonePortraitOutline  } from "react-icons/io5";
import { VscCodeReview } from "react-icons/vsc";
import { RiBloggerLine } from "react-icons/ri";


const sections = [
  {
    title: null,
    key: 'main',
    items: [
      { icon: RxDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: LuBed, label: 'Rooms', path: '/rooms' },
      { icon: LuUsers, label: 'Staff', path: '/staff' },
      { icon: LuBuilding2, label: 'Departments', path: '/departments' },
      { icon: LuInfo, label: 'About', path: '/about' },
      { icon: RiBloggerLine, label: 'Blog', path: '/blog' },
      { icon: VscCodeReview, label: 'Review', path: '/review' },
      { icon: IoPhonePortraitOutline, label: 'Contact', path: '/contact' },
      { icon: IoHelpCircleOutline, label: 'Help', path: '/help' },
    ],
  },
//   {
//     title: 'Apps',
//     key: 'apps',
//     items: [
//       {
//         icon: FiCalendar,
//         label: 'Calendar',
//         badge: { text: 'New', tone: 'info' },
//       },
//       { icon: LuNotebookPen, label: 'Task' },
//       { icon: LuContact, label: 'Contacts' },
//       {
//         icon: FiMail,
//         label: 'Email',
//         badge: { text: '3', tone: 'warning' },
//       },
//       { icon: LuAppWindow, label: 'More Apps' },
//       { icon: FiGrid, label: 'Widgets' },
//     ],
//   },
//   {
//     title: 'Components',
//     key: 'components',
//     items: [
//       { icon: TbLayoutDashboard, label: 'User Interface (UI)' },
//       { icon: FiLayers, label: 'Forms' },
//       { icon: FiLayers, label: 'Tables' },
//       {
//         icon: FiLayers,
//         label: 'Charts',
//         badge: { text: '5', tone: 'success' },
//       },
//     ],
//   },
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

const MenuItem = ({ icon: Icon, label, badge, open, path, onItemClick }) => (
  <NavLink
    to={path}
    className={({ isActive }) =>
      [
        'group flex w-full items-center text-left text-sm font-medium transition',
        open ? 'px-6 py-3' : 'px-3 py-3 justify-center',
        isActive ? 'text-senary bg-primary/50' : 'text-quinary hover:bg-primary/30',
      ].join(' ')
    }
    aria-label={!open ? label : undefined}
    onClick={onItemClick}
  >
    <div
      className={`flex min-w-0 flex-1 items-center ${open ? 'gap-3' : 'justify-center'}`}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/40 text-lg text-senary transition group-hover:bg-primary group-hover:text-senary">
        <Icon />
      </span>
      {open ? (
        <>
          <span className="truncate">{label}</span>
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
);

const Sidebar = ({ open = true, isMobile = false, isCompact = false, onClose }) => {
  const containerClasses = [
    'flex h-screen flex-col overflow-y-auto border-r border-secondary/20 bg-white shadow-sm transition-all duration-200 ease-in-out',
  ];

  if (isMobile) {
    containerClasses.push(
      'fixed inset-y-0 left-0 z-40 w-72 transform',
      open ? 'translate-x-0' : '-translate-x-full'
    );
  } else {
    containerClasses.push('relative', open ? 'w-72' : 'w-20');
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
            <p className="text-xl font-semibold text-senary">Spice</p>
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

export default Sidebar;
