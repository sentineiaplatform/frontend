import type { ConfigAuditLogEntry } from '@/pages/configuracoes/configuracoes-audit-log'

function offsetIsoMinutes(minutes: number): string {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString()
}

function offsetIso(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
}

function offsetIsoDays(days: number, extraHours = 0): string {
  return new Date(Date.now() - (days * 24 + extraHours) * 60 * 60 * 1000).toISOString()
}

/** Entradas fictícias para visualização (não são persistidas). */
export function getMockConfigAuditLogEntries(): ConfigAuditLogEntry[] {
  return [
    {
      id: 'mock-audit-1',
      at: offsetIso(0.5),
      category: 'seguranca',
      action: 'Tentativa de login com MFA pendente',
      detail: 'Usuário ana.silva@empresa.com · IP 189.45.xx.xx',
    },
    {
      id: 'mock-audit-2',
      at: offsetIso(2),
      category: 'perfil',
      action: 'Foto do perfil atualizada',
      detail: 'Substituída por nova imagem (JPEG, ~180 KB)',
    },
    {
      id: 'mock-audit-3',
      at: offsetIso(5),
      category: 'geral',
      action: 'Fuso horário padrão alterado',
      detail: 'America/Sao_Paulo → America/Manaus',
    },
    {
      id: 'mock-audit-4',
      at: offsetIso(8),
      category: 'seguranca',
      action: 'Política de bloqueio por inatividade aplicada',
      detail: 'Intervalo definido em 30 minutos em todas as estações do setor.',
    },
    {
      id: 'mock-audit-5',
      at: offsetIso(14),
      category: 'perfil',
      action: 'E-mail de contato alterado',
      detail: 'antigo@empresa.com → novo.contato@empresa.com',
    },
    {
      id: 'mock-audit-6',
      at: offsetIso(26),
      category: 'geral',
      action: 'Idioma da interface redefinido',
      detail: 'Português (Brasil) · Formato de data dd/MM/yyyy mantido',
    },
    {
      id: 'mock-audit-7',
      at: offsetIso(40),
      category: 'seguranca',
      action: 'Chave de API rotacionada (integração SIEM)',
      detail: 'Prefixo sk_live_…7q4 · expira em 90 dias',
    },
    {
      id: 'mock-audit-8',
      at: offsetIso(52),
      category: 'geral',
      action: 'Nome da organização sincronizado',
      detail: 'Organização: Confiança & Compliance Ltda.',
    },
    {
      id: 'mock-audit-9',
      at: offsetIso(72),
      category: 'seguranca',
      action: 'Sessões encerradas remotamente',
      detail: '3 sessões ativas encerradas após alerta de dispositivo perdido',
    },
    {
      id: 'mock-audit-10',
      at: offsetIso(96),
      category: 'perfil',
      action: 'Cargo e unidade atualizados',
      detail: 'Analista sênior · Ouvidoria Regional Sul',
    },
    {
      id: 'mock-audit-11',
      at: offsetIso(120),
      category: 'seguranca',
      action: 'Relatório de acessos exportado',
      detail: 'CSV · período 01/04/2026–28/04/2026 · 847 linhas',
    },
    {
      id: 'mock-audit-12',
      at: offsetIso(168),
      category: 'geral',
      action: 'Preferências regionais importadas de modelo',
      detail: 'Modelo: “Matriz SP — denúncias” v3',
    },
    {
      id: 'mock-audit-13',
      at: offsetIsoMinutes(12),
      category: 'integracao',
      action: 'Webhook de outbound disparado com sucesso',
      detail: 'Destino https://api.parceiro.com/v1/events · denúncia #8842 · HTTP 200',
    },
    {
      id: 'mock-audit-14',
      at: offsetIsoMinutes(45),
      category: 'notificacoes',
      action: 'Canal Microsoft Teams configurado',
      detail: 'Workspace “Ouvidoria — Alertas” · canal #geral',
    },
    {
      id: 'mock-audit-15',
      at: offsetIso(1.25),
      category: 'geral',
      action: 'Agendamento de relatório criado',
      detail: '“Resumo semanal de SLAs” · toda segunda às 08:00 · PDF + e-mail',
    },
    {
      id: 'mock-audit-16',
      at: offsetIso(3.5),
      category: 'integracao',
      action: 'Falha temporária na sincronização LDAP',
      detail: 'Timeout após 30s · retentativa automática agendada · AD primário',
    },
    {
      id: 'mock-audit-17',
      at: offsetIso(7),
      category: 'notificacoes',
      action: 'Regra de alerta “SLA crítico” desativada',
      detail: 'Responsável: carlos.ferreira · motivo: revisão de processo',
    },
    {
      id: 'mock-audit-18',
      at: offsetIso(11),
      category: 'geral',
      action: 'Download de painel executivo (Power BI)',
      detail: 'Dataset “Denúncias Q2” · última refresh 28/04/2026 18:00',
    },
    {
      id: 'mock-audit-19',
      at: offsetIso(18),
      category: 'integracao',
      action: 'Token OAuth renovado (provedor Gov.br)',
      detail: 'Escopo leitura_perfil · expira em 45 dias',
    },
    {
      id: 'mock-audit-20',
      at: offsetIso(22),
      category: 'seguranca',
      action: 'IP adicionado à lista de permissões administrativas',
      detail: '201.48.xx.xx · VPN corporativa · válido por 24 h',
    },
    {
      id: 'mock-audit-21',
      at: offsetIso(31),
      category: 'notificacoes',
      action: 'Digest diário de atividades ativado',
      detail: 'Destinatários: 12 analistas · horário 07:30 (America/Sao_Paulo)',
    },
    {
      id: 'mock-audit-22',
      at: offsetIso(38),
      category: 'perfil',
      action: 'Assinatura de e-mail padrão atualizada',
      detail: 'Bloco HTML substituído · pré-visualização validada',
    },
    {
      id: 'mock-audit-23',
      at: offsetIso(44),
      category: 'geral',
      action: 'Modelo de exportação CSV personalizado',
      detail: 'Colunas: protocolo, status, UF, prazo · delimitador ; · UTF-8',
    },
    {
      id: 'mock-audit-24',
      at: offsetIso(60),
      category: 'geral',
      action: 'Logo institucional substituída no portal cidadão',
      detail: 'SVG vetorial · cache CDN invalidado',
    },
    {
      id: 'mock-audit-25',
      at: offsetIso(80),
      category: 'integracao',
      action: 'Fila de mensageria reconectada (RabbitMQ)',
      detail: 'Cluster mq-prod-02 · fila sentineia.events.dlq drenada (14 msgs)',
    },
    {
      id: 'mock-audit-26',
      at: offsetIso(90),
      category: 'notificacoes',
      action: 'SMS de contingência testado em homologação',
      detail: 'Provedor Zenvia · 1 crédito consumido · entrega confirmada',
    },
    {
      id: 'mock-audit-27',
      at: offsetIsoDays(5, 2),
      category: 'seguranca',
      action: 'Política de senha ampliada (Complexidade +12 caracteres)',
      detail: 'Vigência: 01/05/2026 · não aplica a contas de serviço',
    },
    {
      id: 'mock-audit-28',
      at: offsetIsoDays(6, 8),
      category: 'geral',
      action: 'Compartilhamento de dashboard revogado',
      detail: 'Usuário externo removido · link público invalidado',
    },
    {
      id: 'mock-audit-29',
      at: offsetIsoDays(9, 4),
      category: 'integracao',
      action: 'Schema de mapeamento de campos importado',
      detail: 'Arquivo field-map-v4.json · 38 regras · backup automático criado',
    },
    {
      id: 'mock-audit-30',
      at: offsetIsoDays(11),
      category: 'geral',
      action: 'Subdomínio de denúncias alterado',
      detail: 'denuncias.empresa.gov.br → ouvidoria.empresa.gov.br · SSL wildcard renovado',
    },
    {
      id: 'mock-audit-31',
      at: offsetIsoDays(14, 6),
      category: 'perfil',
      action: 'Preferência de acessibilidade: alto contraste',
      detail: 'Ativada neste navegador · persistência em perfil local',
    },
    {
      id: 'mock-audit-32',
      at: offsetIsoDays(18, 1),
      category: 'notificacoes',
      action: 'Plantão de escala registrado',
      detail: 'Analista plantonista: juliana.melo · 28/04 18:00 – 29/04 08:00',
    },
    {
      id: 'mock-audit-33',
      at: offsetIsoDays(21, 11),
      category: 'geral',
      action: 'Auditoria de impressão de relatórios sensíveis',
      detail: '3 trabalhos na fila HP-OUV-01 · classificação restrita',
    },
    {
      id: 'mock-audit-34',
      at: offsetIsoDays(25),
      category: 'seguranca',
      action: 'Verificação de integridade de certificado mTLS',
      detail: 'Todas as rotas internas OK · próxima checagem agendada',
    },
    {
      id: 'mock-audit-35',
      at: offsetIsoDays(30, 3),
      category: 'integracao',
      action: 'Carga inicial de API pública concluída',
      detail: 'Rate limit 120 req/min · chave anônima rotacionada',
    },
  ]
}

export function isMockAuditEntry(id: string): boolean {
  return id.startsWith('mock-audit-')
}
