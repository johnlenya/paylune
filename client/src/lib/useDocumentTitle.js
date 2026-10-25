import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} — Paylune` : 'Paylune — Borderless money for modern work';
    return () => {
      document.title = previous;
    };
  }, [title]);
}
