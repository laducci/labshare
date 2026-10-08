/*
 * ============================================================
 *  FotoEquipamento.jsx  |  Camada: Front-end (componente visual reutilizável)
 *  Responsável na apresentação: Laura  |  Atividade: Q3 (reuso)
 * ------------------------------------------------------------
 *  O que faz: mostra a foto do equipamento; se ele não tem foto (ou o link não carrega),
 *  mostra um ícone de caixa no mesmo espaço, para a tela não ficar com um buraco.
 *  Quem chama: EquipmentCard, EquipmentDetails e EquipmentMaintenance.
 *  Chama: nada (só o ícone Package do lucide-react).
 * ============================================================
 */
import { useState } from 'react';
import { Package } from 'lucide-react';

// Props: src = URL da foto (pode ser vazia), alt = texto alternativo, className = classe do CSS
// (ex.: "detail-image"), tamanhoIcone = tamanho do ícone quando não há foto.
export default function FotoEquipamento({ src, alt, className, tamanhoIcone = 40 }) {
  // erro = true quando o navegador não conseguiu carregar a imagem (onError).
  const [erro, setErro] = useState(false);
  if (!src || erro) {
    return (
      <div className={`${className} foto-vazia`} role="img" aria-label={alt}>
        <Package size={tamanhoIcone} aria-hidden="true" />
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setErro(true)} />;
}
