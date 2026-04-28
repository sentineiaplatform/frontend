import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from '@/layouts/dashboard/dashboard-layout'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPassword'
import { LoginPage } from '@/pages/auth/Login'
import { RegisterPage } from '@/pages/auth/Register'
import { AppSectionPage } from '@/pages/app/AppSectionPage'
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
        <Route
          path="/dashboard"
          element={<Navigate to="/app/painel" replace />}
        />
        <Route path="/app" element={<DashboardLayout />}>
          <Route index element={<Navigate to="painel" replace />} />
          <Route path="painel" element={<DashboardHomePage />} />
          <Route path="denuncias" element={<AppSectionPage title="Denúncias" />} />
          <Route
            path="relatorios/visao-geral"
            element={<AppSectionPage title="Relatórios — Visão geral" />}
          />
          <Route
            path="relatorios/por-periodo"
            element={<AppSectionPage title="Relatórios — Por período" />}
          />
          <Route
            path="relatorios/agendados"
            element={<AppSectionPage title="Relatórios — Agendados" />}
          />
          <Route path="indicadores" element={<AppSectionPage title="Indicadores" />} />
          <Route
            path="financeiro/carteira"
            element={<AppSectionPage title="Financeiro — Carteira" />}
          />
          <Route
            path="financeiro/cartao-corporativo"
            element={<AppSectionPage title="Financeiro — Cartão corporativo" />}
          />
          <Route
            path="financeiro/repasses"
            element={<AppSectionPage title="Financeiro — Repasses" />}
          />
          <Route path="analises" element={<AppSectionPage title="Análises" />} />
          <Route path="recursos-pro" element={<AppSectionPage title="Recursos Pro" />} />
          <Route path="configuracoes" element={<AppSectionPage title="Configurações" />} />
          <Route path="ajuda" element={<AppSectionPage title="Ajuda" />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
