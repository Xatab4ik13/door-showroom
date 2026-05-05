import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Auto-scroll to top on route change, EXCEPT when the user navigates back/forward
 * (browser POP) — in that case we preserve the previous scroll position so that
 * returning to the catalog from a product keeps the user where they were.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    if (navType === 'POP') return;
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, navType]);

  return null;
};

export default ScrollToTop;
