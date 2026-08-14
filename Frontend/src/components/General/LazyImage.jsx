import { useEffect, useState } from "react";
import axios from "axios";

export default function LazyImage({ src, alt = "", width, className = "", style = {} }) {
  const [optimized, setOptimized] = useState(null);
  useEffect(() => {
    if (!src) return;
    const cacheKey = `opt:${src}:${width || 'auto'}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      setOptimized(cached);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/images/optimize`, { url: src, width }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!cancelled && res.data?.url) {
          sessionStorage.setItem(cacheKey, res.data.url);
          setOptimized(res.data.url);
        }
      } catch (e) {
        // fail silently - fallback to original src
      }
    })();

    return () => { cancelled = true; };
  }, [src, width]);

  return (
    <img src={optimized || src} alt={alt} loading="lazy" className={className} style={style} />
  );
}
