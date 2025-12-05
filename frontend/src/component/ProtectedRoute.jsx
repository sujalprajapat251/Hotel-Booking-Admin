import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const authState = useSelector((state) => state.auth);
  const user = authState?.user || null;
  const isAuthenticated = authState?.isAuthenticated || false;

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  const userRole = user.designation || "user";
  // If no role restrictions, redirect based on user role
  if (allowedRoles.length === 0) {
    if (userRole === "admin") {
      return <Navigate to="/dashboard" replace />;
    }
    else if (userRole === 'Waiter') {
      return <Navigate to="/waiter/dashboard" replace />
    }
    else if (userRole === 'Chef') {
      return <Navigate to="/chef/dashboard" replace />
    }
    else if (userRole === 'Worker') {
      return <Navigate to="/worker/task" replace />
    }
    else if (userRole === 'Head of Department') {
      return <Navigate to="/hod/dashboard" replace />
    }
    else if (userRole === 'Accountant') {
      return <Navigate to="/accountant/dashboard" replace />
    }
    else {
      return <Navigate to="/booking-dashboard" replace />;
    }

  }

  // Check if user's role is allowed
  if (!allowedRoles.includes(userRole)) {
    // If user is receptionist (user role), redirect to booking dashboard
    if (userRole === "receptionist") {
      return <Navigate to="/booking-dashboard" replace />;
    }
    if (userRole === 'Waiter') {
      return <Navigate to="/waiter/dashboard" replace />
    }
    if (userRole === 'Chef') {
      return <Navigate to="/chef/dashboard" replace />
    }
    else if (userRole === 'Worker') {
      return <Navigate to="/worker/task" replace />
    }
    if (userRole === 'Head of Department') {
      return <Navigate to="/hod/dashboard" replace />
    }
    if (userRole === 'Accountant') {
      return <Navigate to="/accountant/dashboard" replace />
    }
    // Otherwise redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
