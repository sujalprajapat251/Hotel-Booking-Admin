import './App.css';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { configureStore } from './Redux/Store';
import { SnackbarProvider } from 'notistack';
import { Route, Routes, Navigate, Outlet } from 'react-router-dom';
import Alert from './Pages/Alert';
import { Dashboard } from './Pages/Dashboard';
import Rooms from './Pages/Rooms';
import CreateRoom from './Pages/CreateRoom';
import AvailableRooms from './Pages/AvailableRooms';
import RoomFeatures from './Pages/RoomFeatures';
import About from './Pages/About';
import Layout from './Pages/Layout';
import Staff from './Pages/Staff.jsx';
import Departments from './Pages/Departments';
import Blog from './Pages/Blog';
import BlogForm from './Pages/BlogForm.jsx';
import Review from './Pages/Review';
import Contact from './Pages/Contact';
import Help from './Pages/Help';
import LoginPage from './Pages/Login';
import RoomType from './Pages/RoomType';
import StaffForm from './Pages/StaffForm.jsx';
import User from './Pages/User';
import TermsCondition from "./Pages/TermsCondition";
import Profile from './Pages/Profile';
import BookingDashboard from './component/Reseption/BookingDashboard.jsx';
import ProtectedRoute from './component/ProtectedRoute';
import Cafe from './Pages/Cafe';
import Cafecategory from './Pages/Cafecategory';
import CafeItems from './Pages/CafeItems';
import HODLayout from './component/HOD/HODLayout';
import HODDashboard from './component/HOD/HODDashboard';
import HODStaff from './component/HOD/HODStaff';
import HODTable from './component/HOD/HODTable';
import HODHistory from './component/HOD/HODHistory';
import HODProfile from './component/HOD/HODProfile';
import HODStaffForm from './component/HOD/HODStaffForm';
import WaiterDashboard from './component/Waiter/Dashboard'
import WaiterLayout from './component/Waiter/Layout'
import WaiterTable from './component/Waiter/Table';
import CafeOrder from './component/Waiter/TableOrder';
import BarSection from './Pages/BarSection';
import Barcategory from './Pages/Barcategory';
import BarItems from './Pages/BarItems';
import CabsDetails from './Pages/CabsDetails';
import DriverDetails from './Pages/DriverDetails';
import Cabs from './Pages/Cabs';
import CabBookingDetail from './Pages/CabBookingDetail';
import RestaurantSection from './Pages/Restaurant';
import Restaurantcategory from './Pages/Restaurantcategory';
import Restaurantitem from './Pages/Restaurantitem';
import StaffDetails from './Pages/StaffDetails.jsx';
import ChefLayout from './component/Chef/Layout'
import ChefDashboard from './component/Chef/Dashboard'
import AccountantLayout from './component/Accountant/Layout.js'
import AccountantDashboard from './component/Accountant/Dashboard.js'
import AllBookings from './Pages/AllBookings.jsx';
import AllHouseKeeping from './Pages/AllHouseKeeping.jsx';
import AboutForm from './Pages/AboutForm.jsx';
import RestaurantOrder from './Pages/RestaurantOrder.jsx';
import BarOrder from './Pages/BarOrder.jsx';
import CafeOrderList from './Pages/CafeOrderList.jsx';
import HouseKeepingLayout from './component/HouseKeepingWorker/Layout';
import Tasks from './component/HouseKeepingWorker/Tasks.jsx';
import OrderRequest from './Pages/OrderRequest.jsx';
import Order from './component/HouseKeepingWorker/Order.jsx';
import DriverDashboard from './component/Driver/DriverDashboard.jsx';
import DriverLayout from './component/Driver/Layout';

const { store, persistor } = configureStore();
function App() {
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
              <Route path='/' element={<LoginPage />} />
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
                <Route
                  path='/allbookings'
                  element={
                    <ProtectedRoute allowedRoles={['receptionist', 'admin']}>
                      <AllBookings />
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
                  path='/cafe'
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Cafe />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/cafe/cafecategory" replace />} />
                  <Route path='cafecategory' element={<Cafecategory />} />
                  <Route path='cafeitems' element={<CafeItems />} />
                </Route>
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
                  path='/cafe'
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Cafe />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/cafe/cafecategory" replace />} />
                  <Route path='cafecategory' element={<Cafecategory />} />
                  <Route path='cafeitems' element={<CafeItems />} />
                  <Route path='cafeorder' element={<CafeOrderList />} />
                </Route>
                <Route
                  path='/bar'
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <BarSection />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/bar/barcategory" replace />} />
                  <Route path='barcategory' element={<Barcategory />} />
                  <Route path='baritems' element={<BarItems />} />
                  <Route path='barorder' element={<BarOrder />} />
                </Route>
                <Route
                  path='/restaurant'
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <RestaurantSection />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/restaurant/restaurantcategory" replace />} />
                  <Route path='restaurantcategory' element={<Restaurantcategory />} />
                  <Route path='restaurantitems' element={<Restaurantitem />} />
                  <Route path='restaurantorder' element={<RestaurantOrder />} />
                </Route>
                <Route
                  path='/cabs'
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Cabs />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/cabs/cabdetails" replace />} />
                  <Route path='cabdetails' element={<CabsDetails />} />
                  <Route path='cabbooking' element={<CabBookingDetail />} />
                  <Route path='drivwerdetails' element={<DriverDetails />} />
                </Route>
                <Route
                  path='/staff'
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Staff />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/staff/staffdetails" replace />} />
                  <Route path='staffdetails' element={<StaffDetails />} />
                  <Route path='addstaff' element={<StaffForm />} />
                </Route>
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
                      <Outlet />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/about/about" replace />} />
                  <Route path='about' element={<About />} />
                  <Route path='addabout' element={<AboutForm />} />
                </Route>
                <Route
                  path='/blog'
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Outlet />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/blog/blog" replace />} />
                  <Route path='blog' element={<Blog />} />
                  <Route path='addblog' element={<BlogForm />} />
                </Route>
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
                  path='/housekeeping'
                  element={
                    <ProtectedRoute allowedRoles={['receptionist', 'admin']}>
                      <AllHouseKeeping />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/orderrequest'
                  element={
                    <ProtectedRoute allowedRoles={['receptionist', 'admin']}>
                      <OrderRequest />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/user-profile'
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'user', 'receptionist']}>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
              </Route>
              {/* Catch-all route - redirect based on role */}
              <Route
                path='*'
                element={<ProtectedRoute allowedRoles={[]}><Navigate to="/booking-dashboard" replace /></ProtectedRoute>}
              />

              {/* HOD Panel Routes */}
              <Route path='/hod' element={<HODLayout />}>
                <Route
                  path='dashboard'
                  element={
                    <ProtectedRoute allowedRoles={['Head of Department']}>
                      <HODDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='staff'
                  element={
                    <ProtectedRoute allowedRoles={['Head of Department']}>
                      <HODStaff />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='table'
                  element={
                    <ProtectedRoute allowedRoles={['Head of Department']}>
                      <HODTable />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='history'
                  element={
                    <ProtectedRoute allowedRoles={['Head of Department']}>
                      <HODHistory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='addstaff'
                  element={
                    <ProtectedRoute allowedRoles={['Head of Department']}>
                      <HODStaffForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='user-profile'
                  element={
                    <ProtectedRoute allowedRoles={['Head of Department']}>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                {/* Default HOD route */}
                <Route
                  path='/hod'
                  element={<Navigate to="/hod/dashboard" replace />}
                />
              </Route>
              <Route path='/waiter' element={<WaiterLayout />}>
                <Route path='dashboard' element={
                  <ProtectedRoute allowedRoles={['Waiter']}>
                    <WaiterDashboard />
                  </ProtectedRoute>}>
                </Route>
                <Route
                  path='user-profile'
                  element={
                    <ProtectedRoute allowedRoles={['Waiter']}>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route path='table' element={
                  <ProtectedRoute allowedRoles={['Waiter']}>
                    <WaiterTable />
                  </ProtectedRoute>}>
                </Route>
                <Route path='table/:id' element={
                  <ProtectedRoute allowedRoles={['Waiter']}>
                    <CafeOrder />
                  </ProtectedRoute>}>
                </Route>
              </Route>

              <Route path='/chef' element={<ChefLayout />} >
                <Route path='dashboard' element={
                  <ProtectedRoute allowedRoles={['Chef']}>
                    <ChefDashboard />
                  </ProtectedRoute>}></Route>
                <Route
                  path='user-profile'
                  element={
                    <ProtectedRoute allowedRoles={['Chef']}>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
              </Route>

              <Route path='/accountant' element={<AccountantLayout />} >
                <Route path='dashboard' element={<ProtectedRoute allowedRoles={['Accountant']}>
                  <AccountantDashboard />
                </ProtectedRoute>}></Route>
                <Route
                  path='user-profile'
                  element={
                    <ProtectedRoute allowedRoles={['Accountant']}>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
              </Route>

              <Route path='/worker' element={<HouseKeepingLayout />} >
                <Route path='task' element={
                  <ProtectedRoute allowedRoles={['Worker']}>
                    <Tasks />
                  </ProtectedRoute>
                }>
                </Route>
                <Route path='order' element={
                  <ProtectedRoute allowedRoles={['Worker']}>
                    <Order />
                  </ProtectedRoute>
                }>
                </Route>
                <Route
                  path='user-profile'
                  element={
                    <ProtectedRoute allowedRoles={['Worker']}>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
              </Route>
              <Route path='/driver' element={<DriverLayout />}>
                <Route path='dashboard' element={
                  <ProtectedRoute allowedRoles={['Driver']}>
                    <DriverDashboard />
                  </ProtectedRoute>
                } />
                <Route
                  path='user-profile'
                  element={
                    <ProtectedRoute allowedRoles={['Driver']}>
                      <Profile />
                    </ProtectedRoute>
                  }
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
