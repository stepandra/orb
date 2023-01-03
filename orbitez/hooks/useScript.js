import { useEffect } from 'react';

export function useScript(url, defer = false) {
  useEffect(() => {
    const script = document.createElement('script');

    script.src = url;
    if (defer) script.defer = true;
  
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    }
  }, [url])
};

