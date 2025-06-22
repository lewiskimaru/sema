import { useEffect, useState } from 'react';

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress with a smooth animation
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Smooth progress increment with some randomness
        const increment = Math.random() * 15 + 5; // 5-20% increments
        return Math.min(prev + increment, 100);
      });
    }, 150); // Update every 150ms

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen w-screen bg-white flex flex-col items-center justify-center" style={{ fontFamily: 'Outfit, sans-serif' }}>
      {/* Sema Logo/Name */}
      <div className="mb-12">
        <h1 className="text-4xl font-light text-gray-800 tracking-wide">
          Sema
        </h1>
      </div>

      {/* Apple-style Loading Bar */}
      <div className="w-64 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gray-800 rounded-full transition-all duration-300 ease-out ${progress < 100 ? 'loading-shimmer' : ''}`}
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #374151 0%, #6B7280 50%, #374151 100%)',
            backgroundSize: '200% 100%'
          }}
        />
      </div>
    </div>
  );
}
