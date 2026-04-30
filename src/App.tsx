import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from '@/layouts/dashboard/dashboard-layout'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPassword'
import { LoginPage } from '@/pages/auth/Login'
import { RegisterPage } from '@/pages/auth/Register'
import { AppSectionPage } from '@/pages/app/AppSectionPage'
import { ConfiguracoesGeralPage } from '@/pages/configuracoes/ConfiguracoesGeralPage'
import { ConfiguracoesPerfilPage } from '@/pages/configuracoes/ConfiguracoesPerfilPage'
import { ConfiguracoesLogsPage } from '@/pages/configuracoes/ConfiguracoesLogsPage'
import { ConfiguracoesSegurancaPage } from '@/pages/configuracoes/ConfiguracoesSegurancaPage'
import { DenunciaNovaPage } from '@/pages/denuncias/DenunciaNovaPage'
import { DenunciasPage } from '@/pages/denuncias/DenunciasPage'
import { CategoriaDenunciasPage } from '@/pages/dados-mestres/CategoriaDenunciasPage'
import { StatusDenunciasPage } from '@/pages/dados-mestres/StatusDenunciasPage'
import { StatusDenunciaFormPage } from '@/pages/dados-mestres/StatusDenunciaFormPage'
import { CategoriaDenunciaFormPage } from '@/pages/dados-mestres/CategoriaDenunciaFormPage'
import { DashboardHomePage } from '@/pages/painel/DashboardHomePage'
import { DesignSystemSetupPage } from '@/pages/DesignSystemSetupPage'
import { HomePage } from '@/pages/HomePage'
import { AjudaSuportePage } from '@/pages/ajuda/AjudaSuportePage'

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
          <Route path="denuncias/new" element={<DenunciaNovaPage />} />
          <Route path="denuncias" element={<DenunciasPage />} />
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
          <Route path="indicadores" element={<AppSectionPage title="Insights IA" />} />
          <Route path="dados-mestres/status-denuncias" element={<StatusDenunciasPage />} />
          <Route path="dados-mestres/status-denuncias/new" element={<StatusDenunciaFormPage />} />
          <Route path="dados-mestres/status-denuncias/:id" element={<StatusDenunciaFormPage />} />
          <Route path="dados-mestres/categoria-denuncias" element={<CategoriaDenunciasPage />} />
          <Route path="dados-mestres/categoria-denuncias/new" element={<CategoriaDenunciaFormPage />} />
          <Route path="dados-mestres/categoria-denuncias/:id" element={<CategoriaDenunciaFormPage />} />
          <Route path="analises" element={<AppSectionPage title="Análises" />} />
          <Route path="recursos-pro" element={<AppSectionPage title="Recursos Pro" />} />
          <Route
            path="configuracoes"
            element={<Navigate to="/app/configuracoes/geral" replace />}
          />
          <Route
            path="configuracoes/geral"
            element={<ConfiguracoesGeralPage />}
          />
          <Route
            path="configuracoes/perfil"
            element={<ConfiguracoesPerfilPage />}
          />
          <Route
            path="configuracoes/seguranca"
            element={<ConfiguracoesSegurancaPage />}
          />
          <Route path="configuracoes/logs" element={<ConfiguracoesLogsPage />} />
          <Route path="ajuda" element={<AjudaSuportePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
