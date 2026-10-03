'use client';

interface ModeToggleProps {
  mode: 'AUTO' | 'MANUAL';
  onToggle: (newMode: 'AUTO' | 'MANUAL') => void;
  disabled?: boolean;
}

export default function ModeToggle({ mode, onToggle, disabled }: ModeToggleProps) {
  const isAuto = mode === 'AUTO';

  return (
    <div className="inline-flex rounded-lg border border-slate-300 bg-slate-100 p-1 shadow-2xs">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onToggle('AUTO')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
          isAuto
            ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/80'
            : 'text-slate-600 hover:text-slate-900'
        } disabled:opacity-50`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${isAuto ? 'bg-emerald-500' : 'bg-transparent'}`} />
        Otomatis (AUTO)
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onToggle('MANUAL')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
          !isAuto
            ? 'bg-white text-amber-700 shadow-xs border border-slate-200/80'
            : 'text-slate-600 hover:text-slate-900'
        } disabled:opacity-50`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${!isAuto ? 'bg-amber-500' : 'bg-transparent'}`} />
        Manual Remote
      </button>
    </div>
  );
}
