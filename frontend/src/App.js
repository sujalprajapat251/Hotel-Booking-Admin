import './App.css';
import { Provider } from 'react-redux';
import { configureStore } from './Redux/Store';
import { SnackbarProvider } from 'notistack';
import { Route, Routes } from 'react-router-dom';
import Alert from './Pages/Alert';
import { Dashboard } from './Pages/Dashboard';
import EditorDemo from './Pages/EditorDemo';
import DataTable from './Pages/DataTable';

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
            <Route path='/editor' element={<EditorDemo />}></Route>
            <Route path='/data-table' element={<DataTable />}></Route>
          </Routes>
        </SnackbarProvider>
      </Provider>
    </>
  );
}

export default App;
