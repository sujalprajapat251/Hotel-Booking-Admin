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
import Staff from './Pages/Staff.jsx';
import Departments from './Pages/Departments';
import Blog from './Pages/Blog';
import Review from './Pages/Review';
import Contact from './Pages/Contact';
import Help from './Pages/Help';
import LoginPage from './Pages/Login';
import RoomType from './Pages/RoomType';
import StaffForm from './Pages/StaffForm.jsx';
import User from './Pages/User';
import TermsCondition from "./Pages/TermsCondition";
import Profile from './Pages/Profile';
import BookingDashboard from './Pages/BookingDashboard';
import ProtectedRoute from './component/ProtectedRoute';
import Cafe from './Pages/Cafe';
import Cafecategory from './Pages/Cafecategory';
import CafeItems from './Pages/CafeItems';
import HODLayout from './Pages/HODLayout';
import HODDashboard from './Pages/HODDashboard';
import HODStaff from './Pages/HODStaff';
import HODTable from './Pages/HODTable';
import HODHistory from './Pages/HODHistory';
import HODProfile from './Pages/HODProfile';
import WaiterDashboard from './component/Waiter/Dashboard'
import WaiterLayout from './component/Waiter/Layout'
import WaiterTable from './component/Waiter/Table';
import CafeOrder from './component/Waiter/TableOrder';
import BarSection from './Pages/BarSection';
import Barcategory from './Pages/Barcategory';
import BarItems from './Pages/BarItems';
import HODStaffForm from './Pages/HODStaffForm';
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
            <Route path='/editor' element={<EditorDemo />}></Route>
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
                  <Route path='cafeorder' element={<HODHistory />} />
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
                {/* <Route 
                path='/staff' 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Staff />
                  </ProtectedRoute>
                } 
              /> */}
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
                {/* <Route 
                path='/addstaff' 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <StaffForm />
                  </ProtectedRoute>
                } 
              /> */}
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

              </Route>

              {/* HOD Panel Routes */}
              <Route element={<HODLayout />}>
                <Route
                  path='/hod/dashboard'
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <HODDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/hod/staff'
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <HODStaff />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/hod/table'
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <HODTable />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/hod/history'
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <HODHistory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/hod/addstaff'
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <HODStaffForm />
                    </ProtectedRoute>
                  }
                />

                {/* Default HOD route */}
                <Route
                  path='/hod'
                  element={<Navigate to="/hod/dashboard" replace />}
                />
              </Route>

              {/* Catch-all route - redirect based on role */}
              <Route
                path='*'
                element={<ProtectedRoute allowedRoles={[]}><Navigate to="/booking-dashboard" replace /></ProtectedRoute>}
              />

              <Route path='/waiter' element={<WaiterLayout />}>
                <Route path='dashboard' element={<WaiterDashboard />}></Route>
                <Route path='table' element={<WaiterTable />}></Route>
                <Route path='table/:id' element={<CafeOrder />}></Route>
              </Route>

              <Route path='/chef' element={<ChefLayout />} >
                  <Route path='dashboard' element={<ChefDashboard />}></Route>
              </Route>

              <Route path='/accountant' element={<AccountantLayout />} >
                  <Route path='dashboard' element={<AccountantDashboard />}></Route>
              </Route> 

            </Routes>
          </SnackbarProvider>
        </PersistGate>
      </Provider>
    </>
  );
}

export default App;
