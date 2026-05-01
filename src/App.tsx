import { useLayoutEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { syncUiZoomFromGeralStorage } from '@/lib/ui-zoom'
import { AuthProvider } from '@/contexts/auth-context'
import { RequireAuth } from '@/components/auth/require-auth'
import { RedirectIfAuthenticated } from '@/components/auth/redirect-if-authenticated'
import { DashboardLayout } from '@/layouts/dashboard/dashboard-layout'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPassword'
import { LoginPage } from '@/pages/auth/Login'
import { RegisterPage } from '@/pages/auth/Register'
import { AppSectionPage } from '@/pages/app/AppSectionPage'
import { ConfiguracoesGeralPage } from '@/pages/configuracoes/ConfiguracoesGeralPage'
import { ConfiguracoesPerfilPage } from '@/pages/configuracoes/ConfiguracoesPerfilPage'
import { ConfiguracoesLogsPage } from '@/pages/configuracoes/ConfiguracoesLogsPage'
import { ConfiguracoesSegurancaPage } from '@/pages/configuracoes/ConfiguracoesSegurancaPage'
import { ConfiguracoesPerfisPage } from '@/pages/configuracoes/ConfiguracoesPerfisPage'
import { ConfiguracoesMembrosPage } from '@/pages/configuracoes/ConfiguracoesMembrosPage'
import { ConfiguracoesPermissoesPage } from '@/pages/configuracoes/ConfiguracoesPermissoesPage'
import { DenunciaInvestigacaoPage } from '@/pages/denuncias/DenunciaInvestigacaoPage'
import { DenunciaNovaPage } from '@/pages/denuncias/DenunciaNovaPage'
import { DenunciasPage } from '@/pages/denuncias/DenunciasPage'
import { CategoriaDenunciasPage } from '@/pages/dados-mestres/CategoriaDenunciasPage'
import { StatusDenunciasPage } from '@/pages/dados-mestres/StatusDenunciasPage'
import { StatusDenunciaFormPage } from '@/pages/dados-mestres/StatusDenunciaFormPage'
import { WorkflowsPage } from '@/pages/dados-mestres/workflows/WorkflowsPage'
import { CategoriaDenunciaFormPage } from '@/pages/dados-mestres/CategoriaDenunciaFormPage'
import { DashboardHomePage } from '@/pages/painel/DashboardHomePage'
import { DesignSystemSetupPage } from '@/pages/DesignSystemSetupPage'
import { HomePage } from '@/pages/HomePage'
import { AjudaSuportePage } from '@/pages/ajuda/AjudaSuportePage'

export default function App() {
  useLayoutEffect(() => {
    syncUiZoomFromGeralStorage()
  }, [])

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/design-system" element={<DesignSystemSetupPage />} />
          <Route
            path="/login"
            element={
              <RedirectIfAuthenticated>
                <LoginPage />
              </RedirectIfAuthenticated>
            }
          />
          <Route path="/cadastro" element={<RegisterPage />} />
          <Route path="/recuperar-senha" element={<ForgotPasswordPage />} />
          <Route path="/dashboard" element={<Navigate to="/app/painel" replace />} />

          <Route element={<RequireAuth />}>
            <Route path="/app" element={<DashboardLayout />}>
              <Route index element={<Navigate to="painel" replace />} />
              <Route path="painel" element={<DashboardHomePage />} />
              <Route path="denuncias/new" element={<DenunciaNovaPage />} />
              <Route path="denuncias/:protocolo/investigacao" element={<DenunciaInvestigacaoPage />} />
              <Route path="denuncias" element={<DenunciasPage />} />
              <Route path="indicadores" element={<AppSectionPage title="Insights IA" />} />
              <Route path="dados-mestres/status-denuncias" element={<StatusDenunciasPage />} />
              <Route path="dados-mestres/status-denuncias/new" element={<StatusDenunciaFormPage />} />
              <Route path="dados-mestres/status-denuncias/:id" element={<StatusDenunciaFormPage />} />
              <Route path="dados-mestres/categoria-denuncias" element={<CategoriaDenunciasPage />} />
              <Route path="dados-mestres/categoria-denuncias/new" element={<CategoriaDenunciaFormPage />} />
              <Route path="dados-mestres/categoria-denuncias/:id" element={<CategoriaDenunciaFormPage />} />
              <Route path="dados-mestres/workflows" element={<WorkflowsPage />} />
              <Route path="analises" element={<AppSectionPage title="Análises" />} />
              <Route path="recursos-pro" element={<AppSectionPage title="Recursos Pro" />} />
              <Route path="configuracoes" element={<Navigate to="/app/configuracoes/geral" replace />} />
              <Route path="configuracoes/geral" element={<ConfiguracoesGeralPage />} />
              <Route path="configuracoes/perfil" element={<ConfiguracoesPerfilPage />} />
              <Route path="configuracoes/perfis" element={<ConfiguracoesPerfisPage />} />
              <Route path="configuracoes/seguranca" element={<ConfiguracoesSegurancaPage />} />
              <Route path="configuracoes/membros" element={<ConfiguracoesMembrosPage />} />
              <Route path="configuracoes/permissoes" element={<ConfiguracoesPermissoesPage />} />
              <Route path="configuracoes/logs" element={<ConfiguracoesLogsPage />} />
              <Route path="ajuda" element={<AjudaSuportePage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
