import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { scrollToId, setPendingScroll } from '../lib/scroll';

/** Scrolls to a home-page section, navigating home first when needed. */
export function useScrollToSection() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return useCallback(
    (id: string) => {
      if (pathname === '/') {
        scrollToId(id);
      } else {
        setPendingScroll(id);
        navigate('/');
      }
    },
    [navigate, pathname]
  );
}
