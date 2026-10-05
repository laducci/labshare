/*
 * ============================================================
 *  States.jsx  |  Camada: Front-end (componentes visuais reutilizáveis)
 *  Responsável na apresentação: Todos  |  Atividade: Q3 (reuso)
 * ------------------------------------------------------------
 *  O que faz: pequenos componentes para os estados de uma tela: carregando, erro, vazio e sucesso.
 *  Padronizam a aparência das mensagens em todo o sistema.
 *  Quem chama: CrudPage, EquipmentForm e várias páginas (junto com o useApi: carregando/erro).
 *  Chama: nada (só CSS).
 * ============================================================
 */
/** Estados de tela reutilizáveis (LoadingState / ErrorState / EmptyState do design system). */
// Mostrado enquanto o useApi está com carregando = true.
export function LoadingState({ texto = 'Carregando...' }) {
  return <div className="empty-state">{texto}</div>;
}

// Mostra a mensagem de erro (normalmente o {erro} enviado pelo TratadorDeErros do backend).
// Sem mensagem não desenha nada; com onTentarNovamente mostra o botão "Tentar novamente".
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

// Lista vazia (ex.: "Nenhuma reserva encontrada"); o texto vem em children.
export function EmptyState({ children }) {
  return <div className="empty-state">{children}</div>;
}

// Mensagem verde de confirmação (ex.: após salvar). Sem mensagem, não aparece.
export function SuccessMessage({ mensagem }) {
  if (!mensagem) return null;
  return <div className="alert alert-success" role="status">{mensagem}</div>;
}
