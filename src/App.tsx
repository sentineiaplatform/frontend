import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from '@/layouts/dashboard/dashboard-layout'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPassword'
import { LoginPage } from '@/pages/auth/Login'
import { RegisterPage } from '@/pages/auth/Register'
import { DashboardHomePage } from '@/pages/dashboard/DashboardHomePage'
import { DesignSystemSetupPage } from '@/pages/DesignSystemSetupPage'
import { HomePage } from '@/pages/HomePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/design-system"
          element={<DesignSystemSetupPage />}
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/recuperar-senha" element={<ForgotPasswordPage />} />
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardHomePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
