import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { getCatalogReturn } from '@/lib/catalogNavigation';

/**
 * Auto-scroll to top on route change, EXCEPT when the user navigates back/forward
 * (browser POP) — in that case we preserve the previous scroll position so that
 * returning to the catalog from a product keeps the user where they were.
 */
const ScrollToTop = () => {
  const { pathname, state } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    if (pathname === '/catalog' && (navType === 'POP' || getCatalogReturn(state))) return;
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, navType, state]);

  return null;
};

export default ScrollToTop;
