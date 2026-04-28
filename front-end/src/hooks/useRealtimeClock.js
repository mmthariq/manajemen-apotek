import { useState, useEffect } from 'react';

/**
 * Hook untuk menampilkan jam dan tanggal secara real-time.
 * Update setiap detik. Format: "20 Apr 2026, 10:03:18"
 */
const useRealtimeClock = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatted = now.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return formatted;
};

export default useRealtimeClock;
