/*
 * ============================================================
 *  CreateEquipment.jsx  |  Camada: Front-end React (tela / página)
 *  Responsável na apresentação: Laura  |  Atividade: Q2 (CRUD de Equipamentos - CREATE), Q3 (reuso do EquipmentForm)
 * ------------------------------------------------------------
 *  O que faz: tela de cadastro de equipamento. Não tem lógica própria: só renderiza o
 *  EquipmentForm sem id, e o formulário entende que é um cadastro novo.
 *  Quem chama: App.jsx, rota /equipamentos/novo (botão "Novo equipamento" da EquipmentList).
 *  Chama: components/EquipmentForm -> POST /api/equipamentos -> EquipamentoController.criar (herdado)
 *         -> EquipamentoService -> INSERT INTO equipamento (...) VALUES (?, ...) RETURNING id.
 * ============================================================
 */
import EquipmentForm from '../components/EquipmentForm';

/**
 * CREATE: reaproveita o formulário único (Q3 - antes eram ~140 linhas duplicadas entre criar e editar).
 * Sem a prop equipamentoId o EquipmentForm faz api.post('/equipamentos') ao salvar,
 * que no backend vira INSERT INTO equipamento.
 */
export default function CreateEquipment() {
  return <EquipmentForm />;
}
