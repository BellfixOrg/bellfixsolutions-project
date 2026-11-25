import React from 'react';
import {
  AirVent,
  Disc,
  Refrigerator,
  Snowflake,
  Camera,
  Sparkles,
  Layers,
  Droplets,
  Wrench,
  CheckCircle2,
  Shield,
  Zap,
  LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  AirVent,
  Disc,
  Refrigerator,
  Snowflake,
  Camera,
  Sparkles,
  Layers,
  Droplets,
  Wrench,
  CheckCircle2,
  Shield,
  Zap,
};

interface ServiceIconProps {
  name: string;
  className?: string;
}

export default function ServiceIcon({ name, className = 'w-5 h-5' }: ServiceIconProps) {
  const IconComponent = ICON_MAP[name] || Wrench;
  return <IconComponent className={className} />;
}

