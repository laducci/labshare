/*
 * ============================================================
 *  LateFeePanel.jsx  |  Camada: Front-end React (tela / página)
 *  Responsável na apresentação: Todos  |  Atividade: Q3 (reuso do CrudPage), Q2 (variabilidade), Q1 (Strategy CalculoMulta)
 * ------------------------------------------------------------
 *  O que faz: tela de multas por atraso. Só existe para clientes com o recurso lateFee
 *  (Escola Técnica). Toda a tela é o CrudPage genérico com a configuração CRUDS.multas.
 *  Quem chama: App.jsx, rota /admin/multas (protegida pelo recurso "lateFee").
 *  Chama: CrudPage -> GET /api/multas (MultaController.listar -> MultaService -> SELECT t.*, u.nome, e.nome FROM multa t
 *         JOIN reserva r ... JOIN usuario u ... JOIN equipamento e ... WHERE t.tenant_id = ? AND t.ativo = TRUE);
 *         botão "Marcar como paga" -> POST /api/multas/{id}/pagar -> UPDATE multa SET ..., status = ? WHERE id = ? AND tenant_id = ?.
 * ============================================================
 */
import CrudPage from '../components/CrudPage';
import { CRUDS } from '../config/crudConfigs';

/**
 * Multas (Escola Técnica): reaproveita a tela genérica de CRUD só com uma config (Q3).
 * As multas são criadas no backend pela devolução em atraso (ProcessoDevolucao + Strategy
 * MultaPorDiaDeAtraso -> INSERT INTO multa); aqui só se lista e registra o pagamento.
 * Se o cliente não tem lateFee, o MultaService responde 403 (recursoNecessario).
 */
export default function LateFeePanel() {
  return <CrudPage config={CRUDS.multas} />;
}
