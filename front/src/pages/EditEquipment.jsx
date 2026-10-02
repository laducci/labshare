import { useParams } from 'react-router-dom';
import EquipmentForm from '../components/EquipmentForm';

/** UPDATE: o mesmo formulário do cadastro, agora recebendo o id. */
export default function EditEquipment() {
  const { id } = useParams();
  return <EquipmentForm equipamentoId={id} />;
}
