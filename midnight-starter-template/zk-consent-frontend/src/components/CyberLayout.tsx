
import React, { ReactNode } from 'react';
import { ParticleBackground } from './ParticleBackground';

interface CyberLayoutProps {
    children: ReactNode;
}

export const CyberLayout: React.FC<CyberLayoutProps> = ({ children }) => {
    return (
        <div className="relative min-h-screen bg-[var(--color-midnight-bg)] text-white font-sans overflow-hidden">
            {/* Background Layer */}
            <div className="fixed inset-0 z-0">
                <ParticleBackground />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(15,23,42,0.5)] to-[var(--color-midnight-bg)] pointer-events-none" />
            </div>

            {/* Grid Overlay for Cyberpunk feel */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-20"
                style={{ backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
            </div>

            {/* Content Layer */}
            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Header */}
                <header className="fixed top-0 left-0 right-0 h-16 glass-panel flex items-center justify-between px-6 z-50 border-b border-[rgba(255,255,255,0.05)]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--color-neon-cyan)] shadow-[0_0_15px_var(--color-neon-cyan)] animate-pulse" />
                        <h1 className="text-xl font-bold tracking-wider uppercase font-display text-transparent bg-clip-text bg-gradient-to-r from-white to-[var(--color-neon-cyan)]">
                            Midnight <span className="text-[var(--color-neon-purple)]">ZK Consent</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-mono text-gray-400">
                        <span>SYSTEM: ONLINE</span>
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 pt-24 px-4 pb-12 max-w-7xl mx-auto w-full">
                    {children}
                </main>

                {/* Footer */}
                <footer className="py-6 text-center text-xs text-slate-500 font-mono border-t border-[rgba(255,255,255,0.05)] glass-panel">
                    <p>SECURED BY MIDNIGHT NETWORK // ZERO KNOWLEDGE PROTOCOL</p>
                </footer>
            </div>
        </div>
    );
};
