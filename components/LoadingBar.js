import { useEffect, useState } from 'react';

export default function LoadingBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    return () => {
      clearInterval(interval);
      setProgress(0);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div 
        className="h-1 bg-primary-light transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
