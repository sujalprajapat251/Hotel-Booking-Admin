import './App.css';
import { Provider } from 'react-redux';
import { configureStore } from './Redux/Store';
import { SnackbarProvider } from 'notistack';
import { Route, Routes } from 'react-router-dom';
import Alert from './Pages/Alert';
import { Dashboard } from './Pages/Dashboard';
import LoginPage from './Pages/Login';

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
            <Route path='/' element={<Dashboard/>}></Route>
            <Route path='/login' element={<LoginPage/>}></Route>
          </Routes>
        </SnackbarProvider>
      </Provider>
    </>
  );
}

export default App;
