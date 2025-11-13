import './App.css';
import { Provider } from 'react-redux';
import { configureStore } from './Redux/Store';
import { SnackbarProvider } from 'notistack';
import { Routes } from 'react-router-dom';
import Alert from './Pages/Alert';

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

          </Routes>
        </SnackbarProvider>
      </Provider>
    </>
  );
}

export default App;
