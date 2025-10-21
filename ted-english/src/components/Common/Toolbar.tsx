import type { ReactNode } from 'react';
import { cn } from '../../features/analyze/core/cn';

interface ToolbarProps {
  title: string;
  actions?: ReactNode;
  className?: string;
}

export function Toolbar({ title, actions, className }: ToolbarProps) {
  return (
    <div className={cn('flex items-center justify-between gap-3 border-b border-slate-800 pb-3', className)}>
      <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
      <div className="flex items-center gap-2 text-sm text-slate-300">{actions}</div>
    </div>
  );
}
