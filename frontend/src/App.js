import './App.css';
import { Provider } from 'react-redux';
import { configureStore } from './Redux/Store';
import { SnackbarProvider } from 'notistack';
import { Route, Routes } from 'react-router-dom';
import Alert from './Pages/Alert';
import { Dashboard } from './Pages/Dashboard';
import Rooms from './Pages/Rooms';
import About from './Pages/About';
import Layout from './Pages/Layout';
import Staff from './Pages/Staff';
import Departments from './Pages/Departments';
import Blog from './Pages/Blog';
import Review from './Pages/Review';
import Contact from './Pages/Contact';
import Help from './Pages/Help';

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
            <Route element={<Layout />}>
              <Route path='/' element={<Dashboard />} />
              <Route path='/rooms' element={<Rooms />} />
              <Route path='/staff' element={<Staff />} />
              <Route path='/departments' element={<Departments />} />
              <Route path='/about' element={<About />} />
              <Route path='/blog' element={<Blog />} />
              <Route path='/review' element={<Review />} />
              <Route path='/contact' element={<Contact />} />
              <Route path='/help' element={<Help />} />
            </Route>
          </Routes>
        </SnackbarProvider>
      </Provider>
    </>
  );
}

export default App;
