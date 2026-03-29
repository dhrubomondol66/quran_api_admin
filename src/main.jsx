import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AuthFlow from './auth/AuthFlow.jsx'
import ProtectedRoute from './auth/ProtectedRoute.jsx'
import DashboardLayout from './component/dashboardLayout.jsx'
import Overview from './pages/overview.jsx'
import UserManagement from './pages/userManagement.jsx'
import ProfileSetting from './pages/profileSetting.jsx'
import ForgotPassword from './auth/forgotPassword.jsx'
import ResetPassword from './auth/resetPassword.jsx'
import { Routes, Route, BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Auth flow (login / forgot / reset — managed internally) */}
        <Route path="/" element={<AuthFlow />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected dashboard routes */}
        <Route element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route path="/overview" element={<Overview />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/profile-setting" element={<ProfileSetting />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
