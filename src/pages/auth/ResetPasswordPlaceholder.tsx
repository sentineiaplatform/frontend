import { Link } from 'react-router-dom'

/** Destino do link enviado por e-mail (`/redefinir-senha?token=…`). A definir: formulário + rota no backend. */
export function ResetPasswordPlaceholderPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-foreground max-w-md text-sm leading-relaxed">
        Esta página recebe o token da URL para definir uma nova senha. A integração com o endpoint de
        redefinição será acrescentada em seguida.
      </p>
      <Link to="/login" className="text-primary text-sm font-medium hover:underline">
        Voltar ao login
      </Link>
    </div>
  )
}
