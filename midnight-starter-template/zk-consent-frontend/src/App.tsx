
import React, { useState } from 'react';
import { CyberLayout } from './components/CyberLayout';
import { ParentDashboard } from './components/ParentDashboard';
import { ChildApp } from './components/ChildApp';

function App() {
  const [mode, setMode] = useState<'parent' | 'child'>('parent');

  return (
    <CyberLayout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-12">

        {/* Mode Switcher */}
        <div className="relative flex p-1 bg-[rgba(15,23,42,0.8)] border border-[rgba(255,255,255,0.1)] rounded-full backdrop-blur-md">
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[var(--color-neon-cyan)] rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]
              ${mode === 'child' ? 'left-[calc(50%+2px)]' : 'left-1'}
            `}
          />
          <button
            onClick={() => setMode('parent')}
            className={`relative z-10 px-8 py-2 font-display font-bold uppercase tracking-wider text-sm transition-colors duration-300
              ${mode === 'parent' ? 'text-black' : 'text-gray-400 hover:text-white'}
            `}
          >
            Parent
          </button>
          <button
            onClick={() => setMode('child')}
            className={`relative z-10 px-8 py-2 font-display font-bold uppercase tracking-wider text-sm transition-colors duration-300
              ${mode === 'child' ? 'text-black' : 'text-gray-400 hover:text-white'}
            `}
          >
            Child
          </button>
        </div>

        {/* Content Area */}
        <div className="w-full animate-fade-in-up">
          {mode === 'parent' ? <ParentDashboard /> : <ChildApp />}
        </div>
      </div>
    </CyberLayout>
  );
}

export default App;
