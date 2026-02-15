import { useEffect, useRef } from 'react';

export function ParticleBackground() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Clear existing particles
        container.innerHTML = '';

        const particleCount = 30;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            const size = Math.random() * 8 + 4;
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const delay = Math.random() * 10;
            const duration = Math.random() * 20 + 15;
            const hue = Math.random() > 0.5 ? '199' : '51'; // sky blue (199) or pastel yellow (51)

            // We set style directly for dynamic values
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${x}%`;
            particle.style.top = `${y}%`;
            particle.style.background = `radial-gradient(circle, hsla(${hue}, 80%, 60%, 0.4), transparent)`;
            particle.style.animationDelay = `${delay}s`;
            particle.style.animationDuration = `${duration}s`;

            container.appendChild(particle);
        }
    }, []);

    return <div ref={containerRef} id="particles" className="fixed inset-0 pointer-events-none z-0" />;
}
