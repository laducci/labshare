import CrudPage from '../components/CrudPage';
import { CRUDS } from '../config/crudConfigs';

/** Multas (Escola Técnica): reaproveita a tela genérica de CRUD só com uma config. */
export default function LateFeePanel() {
  return <CrudPage config={CRUDS.multas} />;
}
