import './App.css';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { configureStore } from './Redux/Store';
import { SnackbarProvider } from 'notistack';
import { Route, Routes, Navigate } from 'react-router-dom';
import Alert from './Pages/Alert';
import { Dashboard } from './Pages/Dashboard';
import EditorDemo from './Pages/EditorDemo';
import DataTable from './Pages/DataTable';
import Rooms from './Pages/Rooms';
import CreateRoom from './Pages/CreateRoom';
import AvailableRooms from './Pages/AvailableRooms';
import RoomFeatures from './Pages/RoomFeatures';
import About from './Pages/About';
import Layout from './Pages/Layout';
import Staff from './Pages/Staff';
import Departments from './Pages/Departments';
import Blog from './Pages/Blog';
import Review from './Pages/Review';
import Contact from './Pages/Contact';
import Help from './Pages/Help';
import LoginPage from './Pages/Login';
import RoomType from './Pages/RoomType';
import StaffForm from './Pages/StaffForm';
import User from './Pages/User';
import TermsCondition from "./Pages/TermsCondition";
import Profile from './Pages/Profile';
import BookingDashboard from './Pages/BookingDashboard';
import ProtectedRoute from './component/ProtectedRoute';

function App() {

  const { store, persistor } = configureStore();

  return (
    <>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
        <SnackbarProvider
          maxSnack={3}
          autoHideDuration={3000}
        >
          <Alert />
          <Routes>
            <Route path='/editor' element={<EditorDemo />}></Route>
            <Route path='/data-table' element={<DataTable />}></Route>
            <Route path='/' element={<LoginPage/>}/>
            <Route element={<Layout />}>
              {/* Receptionist/User only route - Booking Dashboard */}
              <Route 
                path='/booking-dashboard' 
                element={
                  <ProtectedRoute allowedRoles={['receptionist']}>
                    <BookingDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin only routes */}
              <Route 
                path='/dashboard' 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path='/rooms' 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Rooms />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/rooms/create" replace />} />
                <Route path='create' element={<CreateRoom />} />
                <Route path='available' element={<AvailableRooms />} />
                <Route path='features' element={<RoomFeatures />} />
                <Route path='room-type' element={<RoomType />} />
              </Route>
              <Route 
                path='/staff' 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Staff />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path='/departments' 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Departments />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path='/about' 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <About />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path='/blog' 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Blog />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path='/review' 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Review />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path='/contact' 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Contact />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path='/help' 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Help />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path='/addstaff' 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <StaffForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path='/user' 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <User />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path='/terms' 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <TermsCondition />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path='/user-profile' 
                element={
                  <ProtectedRoute allowedRoles={['admin', 'user']}>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch-all route - redirect based on role */}
              <Route 
                path='*' 
                element={<ProtectedRoute allowedRoles={[]}><Navigate to="/booking-dashboard" replace /></ProtectedRoute>} 
              />
            </Route>
          </Routes>
        </SnackbarProvider>
        </PersistGate>
      </Provider>
    </>
  );
}

export default App;
