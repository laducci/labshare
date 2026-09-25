import { Cpu, Camera, Monitor, Wrench } from 'lucide-react';

const icons = {
  cpu: Cpu,
  camera: Camera,
  monitor: Monitor,
  wrench: Wrench,
};

export default function CategoryIcon({ name, size = 24 }) {
  const Icon = icons[name] || Cpu;
  return <Icon size={size} />;
}
