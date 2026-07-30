import { motion } from 'framer-motion';
import { MapPin, AlertTriangle, Clock } from 'lucide-react';

const ZONA_CONFIG = {
  general: {
    color: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success',
    icon: MapPin,
    label: 'General',
  },
  restringida: {
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive',
    icon: AlertTriangle,
    label: 'Restringida',
  },
  transito: {
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning',
    icon: Clock,
    label: 'Tránsito',
  },
};

function ZoneBadge({ zona, size = 'md' }) {
  if (!zona) return null;

  const config = ZONA_CONFIG[zona.tipo] || ZONA_CONFIG.general;
  const Icono = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${config.border} ${sizeClasses[size]}`}
    >
      <Icono className={`w-3 h-3 ${config.color}`} />
      <span className={`font-medium ${config.color}`}>{zona.nombre}</span>
      <span className={`${config.color} opacity-70`}>·</span>
      <span className={`${config.color} opacity-70`}>{config.label}</span>
    </motion.div>
  );
}

export default ZoneBadge;
