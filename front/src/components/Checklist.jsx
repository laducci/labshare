/**
 * Ativo reutilizável nº 5 (Componente de Checklist).
 * O MESMO componente é usado na retirada e na devolução — só muda o "modo":
 *  - modo="retirada":  o técnico marca cada item conferido (checkbox)
 *  - modo="devolucao": o técnico marca cada item como OK ou Com defeito
 * É o espelho, no frontend, do Template Method ProcessoChecklist do backend.
 *
 * itens: [{ item: 'Cabo USB', ok: true }]
 */
export default function Checklist({ itens, modo = 'retirada', onChange }) {
  const alterar = (indice, ok) => {
    onChange(itens.map((it, i) => (i === indice ? { ...it, ok } : it)));
  };

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
export function criarItens(nomes, marcadoInicialmente) {
  return (nomes || []).map((item) => ({ item, ok: marcadoInicialmente }));
}
