import { useState, useEffect } from 'react';
import { ParentDashboard } from './components/ParentDashboard';
import { ChildApp } from './components/ChildApp';
import { DebugPanel } from './components/DebugPanel';
import { ParticleBackground } from './components/ParticleBackground';

type AppMode = 'parent' | 'child';

function App() {
  const [mode, setMode] = useState<AppMode>('parent');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [stats, setStats] = useState({ consents: 2847, verifications: 1293 });

  // Handle Theme Toggle
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Scroll Reveal Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('active');
            }, index * 100);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Stats Animation
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        consents: prev.consents + Math.floor(Math.random() * 3),
        verifications: prev.verifications + Math.floor(Math.random() * 2)
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen bg-gradient-animated transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      <ParticleBackground />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 glass-card border-b border-white/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-sky-400 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-gray-900 dark:text-white">ZK Gateway</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => scrollToSection('how-it-works')} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-sky-500 transition-colors hidden md:block">How It Works</button>
            <button onClick={() => scrollToSection('features')} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-sky-500 transition-colors hidden md:block">Features</button>
            <button onClick={() => scrollToSection('demo')} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-sky-500 transition-colors hidden md:block">Stats</button>

            <button
              onClick={toggleTheme}
              className="relative w-14 h-8 bg-gray-200 dark:bg-gray-700 rounded-full p-1 transition-colors focus:outline-none"
              aria-label="Toggle dark mode"
            >
              <div
                className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${isDarkMode ? 'translate-x-6' : 'translate-x-0'
                  }`}
              >
                {isDarkMode ? '🌙' : '☀️'}
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-32 pb-20">
        <div className="max-w-6xl mx-auto text-center z-10 w-full">
          <div className="reveal">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 bg-white/50 dark:bg-slate-800/50 border border-white/20 backdrop-blur-md shadow-sm">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Powered by Midnight Zero-Knowledge Technology</span>
            </div>
          </div>

          <h1 className="font-display font-bold text-5xl md:text-7xl mb-6 reveal text-gray-900 dark:text-white leading-tight">
            Privacy-First Parental
            <span className="block bg-gradient-to-r from-sky-500 to-sky-400 bg-clip-text text-transparent pb-2">
              Consent Gateway
            </span>
          </h1>

          <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-12 reveal text-gray-600 dark:text-gray-300 font-light">
            Grant or revoke consent for minors' platform usage via ZK proof
            without ever disclosing your child's identity to the platform.
          </p>

          {/* Mode Toggle */}
          <div className="flex flex-col items-center gap-6 reveal mb-16">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest">Select Your Mode</span>
            </div>
            <div className="relative bg-gray-200 dark:bg-slate-800 p-1 rounded-full flex w-72 h-14 shadow-inner">
              <div
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-sky-600 rounded-full shadow-md transition-all duration-500 ease-out z-0
                    ${mode === 'child' ? 'left-[calc(50%+2px)]' : 'left-1'}
                  `}
              ></div>
              <button
                onClick={() => setMode('parent')}
                className={`flex-1 relative z-10 font-display font-bold text-sm transition-colors duration-300 ${mode === 'parent' ? 'text-sky-600 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
              >
                Parent Mode
              </button>
              <button
                onClick={() => setMode('child')}
                className={`flex-1 relative z-10 font-display font-bold text-sm transition-colors duration-300 ${mode === 'child' ? 'text-sky-600 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
              >
                Child Mode
              </button>
            </div>
          </div>

          {/* Floating Interaction Card */}
          <div className="relative mt-8 reveal min-h-[500px]">
            {mode === 'parent' ? <ParentDashboard /> : <ChildApp />}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-32 px-6 relative bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 reveal">
            <h2 className="font-display font-bold text-4xl md:text-5xl mb-6 text-gray-900 dark:text-white">
              How It Works
            </h2>
            <p className="text-xl max-w-2xl mx-auto text-gray-600 dark:text-gray-300">
              A seamless, privacy-preserving consent flow powered by zero-knowledge proofs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            {/* Parent Steps */}
            <div className="reveal">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-sky-400 flex items-center justify-center shadow-lg shadow-sky-500/20">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Parent Flow</h3>
              </div>
              <div className="space-y-6">
                {[
                  { title: "Connect Lace Wallet", desc: "Authenticate using your Cardano Lace wallet for secure identity verification" },
                  { title: "Enter Child's Identifier", desc: "Provide your child's email or username which will be hashed using ZK technology" },
                  { title: "Generate ZK Hash", desc: "The system creates a zero-knowledge proof hash that cannot be reversed" },
                  { title: "Store on Midnight", desc: "The hash is securely stored on the Midnight blockchain for verification" }
                ].map((step, idx) => (
                  <div key={idx} className="glass-card rounded-2xl p-6 pl-12 relative hover:-translate-y-1 transition-transform duration-300 bg-white/60 dark:bg-slate-800/60">
                    <div className="absolute top-6 left-[-16px] w-8 h-8 flex items-center justify-center bg-gradient-to-br from-sky-500 to-sky-400 text-white rounded-lg font-bold text-sm shadow-lg">
                      {idx + 1}
                    </div>
                    <h4 className="font-display font-semibold text-lg mb-2 text-gray-900 dark:text-white">{step.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Child Steps */}
            <div className="reveal">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pastel-yellow to-pastel-gold flex items-center justify-center shadow-lg shadow-yellow-500/20">
                  <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Child Flow</h3>
              </div>
              <div className="space-y-6">
                {[
                  { title: "Connect Wallet", desc: "Child connects their own wallet for identity verification (different from parent)" },
                  { title: "Enter Identifier", desc: "Provide the same identifier registered by parent for verification" },
                  { title: "Generate ZK Proof", desc: "Create a zero-knowledge proof of ownership without revealing the identifier" },
                  { title: "Access Granted", desc: "Smart contract verifies proof against the registry and grants platform access" }
                ].map((step, idx) => (
                  <div key={idx} className="glass-card rounded-2xl p-6 pl-12 relative hover:-translate-y-1 transition-transform duration-300 bg-white/60 dark:bg-slate-800/60">
                    <div className="absolute top-6 left-[-16px] w-8 h-8 flex items-center justify-center bg-gradient-to-br from-pastel-yellow to-pastel-gold text-amber-900 rounded-lg font-bold text-sm shadow-lg">
                      {idx + 1}
                    </div>
                    <h4 className="font-display font-semibold text-lg mb-2 text-gray-900 dark:text-white">{step.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 relative overflow-hidden">
        {/* Background Orbs */}
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-sky-400/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-yellow-400/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20 reveal">
            <h2 className="font-display font-bold text-4xl md:text-5xl mb-6 text-gray-900 dark:text-white">Why ZK Gateway</h2>
            <p className="text-xl max-w-2xl mx-auto text-gray-600 dark:text-gray-300">Privacy-preserving consent management built for the modern web</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Complete Privacy", desc: "Child's identity is never exposed. Only cryptographic proofs are shared.", icon: "shield" },
              { title: "Cryptographic Security", desc: "Powered by Midnight's zero-knowledge technology for proven security.", icon: "lock" },
              { title: "Instant Verification", desc: "Sub-second verification times with on-chain proof validation.", icon: "lightning" },
              { title: "Revocable Consent", desc: "Parents can revoke consent at any time with immediate effect.", icon: "trash" },
              { title: "Cross-Platform", desc: "Single consent works across multiple platforms supporting the ZK Gateway.", icon: "globe" },
              { title: "Audit Trail", desc: "Immutable on-chain records of all consent activities for transparency.", icon: "doc" },
            ].map((feature, idx) => (
              <div key={idx} className="glass-card rounded-3xl p-8 reveal hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl bg-white/40 dark:bg-slate-800/40 border-white/20">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${idx % 2 === 0 ? 'bg-gradient-to-br from-sky-500 to-sky-400 text-white shadow-sky-500/20' : 'bg-gradient-to-br from-pastel-yellow to-pastel-gold text-amber-800 shadow-yellow-500/20'}`}>
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    {/* Using generic check icon for brevity, ideally map specific icons */}
                  </svg>
                </div>
                <h3 className="font-display font-bold text-xl mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Stats Section */}
      <section id="demo" className="py-20 px-6 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card rounded-3xl p-8 md:p-12 reveal bg-white dark:bg-slate-800 shadow-xl border-none">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Advanced Visualization */}
              <div className="relative aspect-square flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full border-2 border-dashed border-sky-400 animate-spin-slow"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 rounded-full border-2 border-dashed border-yellow-400/50 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '5s' }}></div>
                </div>
                <div className="relative z-10 w-24 h-24 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 shadow-2xl flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-6">
                <h3 className="font-display font-bold text-3xl mb-6 text-gray-900 dark:text-white">Live Network Activity</h3>

                <div className="p-6 rounded-2xl bg-gray-50 dark:bg-slate-700/50 transition-all">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold text-gray-700 dark:text-gray-200">Total Consents</span>
                    <span className="font-bold text-sky-500 text-xl">{stats.consents.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500 w-[72%] rounded-full shadow-[0_0_10px_rgba(14,165,233,0.5)]"></div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-gray-50 dark:bg-slate-700/50 transition-all">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold text-gray-700 dark:text-gray-200">Active Verifications</span>
                    <span className="font-bold text-yellow-500 text-xl">{stats.verifications.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 w-[54%] rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-sky-900/20 text-center">
                    <div className="text-3xl font-bold text-sky-500 font-display">0.3s</div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">Avg Verification</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-green-50/50 dark:bg-green-900/20 text-center">
                    <div className="text-3xl font-bold text-green-500 font-display">Zero</div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">Data Exposed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">ZK Gateway</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Privacy-preserving parental consent for the next generation</p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-gray-500 hover:text-sky-500 transition-colors">Documentation</a>
            <a href="#" className="text-sm text-gray-500 hover:text-sky-500 transition-colors">GitHub</a>
          </div>
        </div>
      </footer>

      {/* Debug Panel - Fixed */}
      <DebugPanel />
    </div>
  );
}

export default App;
