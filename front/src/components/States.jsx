/** Estados de tela reutilizáveis (LoadingState / ErrorState / EmptyState do design system). */
export function LoadingState({ texto = 'Carregando...' }) {
  return <div className="empty-state">{texto}</div>;
}

export function ErrorState({ mensagem, onTentarNovamente }) {
  if (!mensagem) return null;
  return (
    <div className="alert alert-error" role="alert">
      {mensagem}
      {onTentarNovamente && (
        <button type="button" className="btn btn-link btn-sm" onClick={onTentarNovamente} style={{ marginLeft: 8 }}>
          Tentar novamente
        </button>
      )}
    </div>
  );
}

export function EmptyState({ children }) {
  return <div className="empty-state">{children}</div>;
}

export function SuccessMessage({ mensagem }) {
  if (!mensagem) return null;
  return <div className="alert alert-success" role="status">{mensagem}</div>;
}
