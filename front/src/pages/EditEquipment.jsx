/*
 * ============================================================
 *  EditEquipment.jsx  |  Camada: Front-end React (tela / página)
 *  Responsável na apresentação: Laura  |  Atividade: Q2 (CRUD de Equipamentos - UPDATE), Q3 (reuso do EquipmentForm)
 * ------------------------------------------------------------
 *  O que faz: tela de edição de equipamento. Pega o id da URL e passa para o mesmo
 *  EquipmentForm usado no cadastro; com o id, o formulário carrega os dados e salva com PUT.
 *  Quem chama: App.jsx, rota /equipamentos/:id/editar (botão "Editar" da EquipmentList e do EquipmentDetails).
 *  Chama: components/EquipmentForm -> GET /api/equipamentos/{id} (SELECT) e PUT /api/equipamentos/{id}
 *         -> EquipamentoController.atualizar (herdado) -> UPDATE equipamento SET ... WHERE id = ? AND tenant_id = ?.
 * ============================================================
 */
import { useParams } from 'react-router-dom';
import EquipmentForm from '../components/EquipmentForm';

/**
 * UPDATE: o mesmo formulário do cadastro, agora recebendo o id (prop equipamentoId).
 * useParams lê o ":id" da rota. O EquipmentForm faz o GET para preencher os campos e,
 * ao salvar, api.put('/equipamentos/{id}') -> UPDATE equipamento SET ... no backend.
 */
export default function EditEquipment() {
  const { id } = useParams();
  return <EquipmentForm equipamentoId={id} />;
}
