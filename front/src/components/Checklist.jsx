/*
 * ============================================================
 *  Checklist.jsx  |  Camada: Front-end (componente reutilizável)
 *  Responsável na apresentação: Laura  |  Atividade: Q3 (reuso: Checklist), Q1 (espelho do Template Method ProcessoChecklist)
 * ------------------------------------------------------------
 *  O que faz: lista de itens do equipamento que o técnico confere. Mesmo componente para retirada
 *  (checkbox "conferido" - RN05) e devolução (OK / Com defeito - RN07). Não guarda estado próprio:
 *  recebe os itens por props e avisa a tela-mãe a cada mudança (onChange).
 *  Quem chama: RegisterPickup (modo "retirada") e RegisterReturn (modo "devolucao").
 *  Chama: nada no backend diretamente; a tela-mãe envia os itens para POST /api/emprestimos/{id}/retirada|devolucao.
 * ============================================================
 */
/**
 * Ativo reutilizável nº 5 (Componente de Checklist).
 * O MESMO componente é usado na retirada e na devolução — só muda o "modo":
 *  - modo="retirada":  o técnico marca cada item conferido (checkbox)
 *  - modo="devolucao": o técnico marca cada item como OK ou Com defeito
 * É o espelho, no frontend, do Template Method ProcessoChecklist do backend.
 *
 * itens: [{ item: 'Cabo USB', ok: true }]
 */
// Props: itens (lista atual), modo ('retirada' ou 'devolucao'), onChange (função da tela-mãe que guarda os itens no useState dela).
export default function Checklist({ itens, modo = 'retirada', onChange }) {
  // Cria uma NOVA lista trocando só o item clicado (no React não se altera o array original)
  // e entrega para a tela-mãe. Ex.: alterar(2, false) marca o 3º item como "Com defeito".
  const alterar = (indice, ok) => {
    onChange(itens.map((it, i) => (i === indice ? { ...it, ok } : it)));
  };

  // Na retirada: checkbox por item. Na devolução: botões OK / Com defeito; a cor do item muda
  // (checklist-item--ok / --error). Itens com ok = false na devolução geram ocorrência no backend (RN08).
  return (
    <ul className="checklist">
      {itens.map((it, i) => (
        <li
          key={it.item}
          className={`checklist-item ${modo === 'devolucao' ? (it.ok ? 'checklist-item--ok' : 'checklist-item--error') : ''}`}
        >
          {modo === 'retirada' ? (
            <>
              <input type="checkbox" id={`item-${i}`} checked={it.ok} onChange={(e) => alterar(i, e.target.checked)} />
              <label htmlFor={`item-${i}`}>{it.item}</label>
            </>
          ) : (
            <>
              <span style={{ flex: 1 }}>{it.item}</span>
              <div className="button-group" style={{ margin: 0 }}>
                <button type="button" className={`btn btn-sm ${it.ok ? 'btn-primary' : 'btn-secondary'}`} onClick={() => alterar(i, true)}>
                  OK
                </button>
                <button type="button" className={`btn btn-sm ${!it.ok ? 'btn-danger' : 'btn-secondary'}`} onClick={() => alterar(i, false)}>
                  Com defeito
                </button>
              </div>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

/** Monta a lista inicial a partir dos itens do equipamento. */
// Ex.: criarItens(['Cabo USB', 'Fonte'], false) -> [{item:'Cabo USB', ok:false}, {item:'Fonte', ok:false}].
// Na retirada começa desmarcado (técnico precisa conferir); na devolução começa como OK.
export function criarItens(nomes, marcadoInicialmente) {
  return (nomes || []).map((item) => ({ item, ok: marcadoInicialmente }));
}
