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
    <div className="h-screen w-screen bg-white dark:bg-[#09090b] flex flex-col items-center justify-center" style={{ fontFamily: 'Outfit, sans-serif' }}>
      {/* Sema Logo/Name */}
      <div className="mb-12">
        <h1 className="text-4xl font-light text-gray-800 dark:text-white tracking-wide">
          Sema
        </h1>
      </div>

      {/* Apple-style Loading Bar */}
      <div className="w-64 h-1 bg-gray-200 dark:bg-[#27272A] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out bg-gradient-to-r from-gray-700 via-gray-500 to-gray-700 dark:from-[#3F3F46] dark:via-[#A1A1AA] dark:to-[#3F3F46] bg-[length:200%_100%] ${progress < 100 ? 'loading-shimmer' : ''}`}
          style={{
            width: `${progress}%`
          }}
        />
      </div>
    </div>
  );
}
