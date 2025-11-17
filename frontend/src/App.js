import './App.css';
import { Provider } from 'react-redux';
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

function App() {

  const { store } = configureStore();

  return (
    <>
      <Provider store={store}>
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
              <Route path='/dashboard' element={<Dashboard />} />
              <Route path='/rooms' element={<Rooms />}>
                <Route index element={<Navigate to="/rooms/create" replace />} />
                <Route path='create' element={<CreateRoom />} />
                <Route path='available' element={<AvailableRooms />} />
                <Route path='features' element={<RoomFeatures />} />
                <Route path='room-type' element={<RoomType />} />
              </Route>
              <Route path='/staff' element={<Staff />} />
              <Route path='/departments' element={<Departments />} />
              <Route path='/about' element={<About />} />
              <Route path='/blog' element={<Blog />} />
              <Route path='/review' element={<Review />} />
              <Route path='/contact' element={<Contact />} />
              <Route path='/help' element={<Help />} />
              <Route path='/addstaff' element={<StaffForm />} />
            </Route>
          </Routes>
        </SnackbarProvider>
      </Provider>
    </>
  );
}

export default App;
