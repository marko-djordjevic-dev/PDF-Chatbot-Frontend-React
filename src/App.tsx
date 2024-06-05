import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import Dashboard from './pages/dashboard/dashboard'
import Login from './pages/auth/login'
import Register from './pages/auth/register'
// import AuthRoute from './components/authRoute'
import NotFound from './pages/auth/notfound'
import { ToastProvider } from './components/toast.tsx'
import "./App.css";
import { useSelector } from 'react-redux'

function App() {

  const { theme } = useSelector((state: any) => state.SettingsReducer.settings);

  return (
    <div data-theme={theme ?? 'light'}>
      <ToastProvider>
        <Router basename='/test'>
          <Routes>
            {/* <Route path='/' element={<AuthRoute ><Dashboard /></AuthRoute>} /> */}
            <Route path='/' element={<Dashboard />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='*' element={<NotFound />} />
          </Routes>
        </Router>
      </ToastProvider>
    </div>
  )
}

export default App
