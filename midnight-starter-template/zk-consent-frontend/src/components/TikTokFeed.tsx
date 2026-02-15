import { useState, useRef, useEffect } from 'react';

interface TikTokFeedProps {
  onLogout?: () => void;
}

interface CatGif {
  id: string;
  url: string;
  width: number;
  height: number;
}

export function TikTokFeed({ onLogout }: TikTokFeedProps) {
  const [gifs, setGifs] = useState<CatGif[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch GIFs from API
  const fetchGifs = async (count = 5) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`https://api.thecatapi.com/v1/images/search?mime_types=gif&limit=${count}`);
      const data = await res.json();
      setGifs(prev => [...prev, ...data]);
    } catch (err) {
      console.error('Failed to fetch gifs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchGifs(5);
  }, []);

  // Handle scroll to snap to next/previous GIF
  const handleScroll = () => {
    if (!containerRef.current) return;

    const scrollTop = containerRef.current.scrollTop;
    const itemHeight = window.innerHeight;
    const newIndex = Math.round(scrollTop / itemHeight);

    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
      // Fetch more when nearing end
      if (newIndex >= gifs.length - 2) {
        fetchGifs(3);
      }
    }
  };

  // Scroll to specific index
  const scrollToIndex = (index: number) => {
    if (!containerRef.current) return;
    const itemHeight = window.innerHeight;
    containerRef.current.scrollTo({
      top: index * itemHeight,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentIndex, gifs]);

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4 flex justify-between items-center">
        <h1 className="text-white text-xl font-bold drop-shadow-md">🐱 Cat Zone (API)</h1>
        {onLogout && (
          <button
            onClick={onLogout}
            className="bg-red-500/80 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm transition backdrop-blur-sm"
          >
            Logout
          </button>
        )}
      </div>

      {/* Scroll Container */}
      <div
        ref={containerRef}
        className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {gifs.map((gif, index) => (
          <div
            key={gif.id}
            className="h-screen w-full snap-start flex items-center justify-center relative"
          >
            {/* GIF Container */}
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <img
                src={gif.url}
                alt="Random Cat"
                className="max-w-full max-h-full object-contain"
              />

              {/* Title Overlay */}
              <div className="absolute bottom-20 left-0 right-0 text-center pointer-events-none">
                <h2 className="text-white text-lg font-bold drop-shadow-lg px-4 truncate">
                  Random Cat #{index + 1}
                </h2>
                <p className="text-white/80 text-xs mt-1">
                  API Source: thecatapi.com
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 flex flex-col gap-4">
        {currentIndex > 0 && (
          <button
            onClick={() => scrollToIndex(currentIndex - 1)}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 rounded-full transition shadow-lg"
          >
            ↑
          </button>
        )}
        {currentIndex < gifs.length - 1 && (
          <button
            onClick={() => scrollToIndex(currentIndex + 1)}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 rounded-full transition shadow-lg"
          >
            ↓
          </button>
        )}
      </div>

      {/* Privacy Badge */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="bg-green-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-xs text-center">
          🔒 Verified via Zero-Knowledge Proof • Your identity remains private
        </div>
      </div>

      {/* CSS to hide scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
