/*
 * ============================================================
 *  CategoryIcon.jsx  |  Camada: Front-end (componente visual reutilizável)
 *  Responsável na apresentação: João  |  Atividade: Q2 (CRUD de Categorias), Q3 (reuso)
 * ------------------------------------------------------------
 *  O que faz: converte o nome de ícone guardado na categoria (campo "icone": cpu, camera, monitor,
 *  wrench) no ícone correspondente da biblioteca lucide-react.
 *  Quem chama: telas que listam categorias (ex.: Home).
 *  Chama: lucide-react.
 * ============================================================
 */
import { Cpu, Camera, Monitor, Wrench } from 'lucide-react';

// Mapa nome salvo no banco -> componente de ícone.
const icons = {
  cpu: Cpu,
  camera: Camera,
  monitor: Monitor,
  wrench: Wrench,
};

// Props: name = nome do ícone; size = tamanho em px. Nome desconhecido usa Cpu como padrão.
export default function CategoryIcon({ name, size = 24 }) {
  const Icon = icons[name] || Cpu;
  return <Icon size={size} />;
}
