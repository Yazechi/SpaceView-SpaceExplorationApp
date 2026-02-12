import { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './PageTransition.css';

function PageTransition({ children }) {
  const location = useLocation();
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.remove('page-enter-active');
    el.classList.add('page-enter');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.classList.add('page-enter-active');
        el.classList.remove('page-enter');
      });
    });
  }, [location.pathname]);

  return (
    <div ref={ref} className="page-transition">
      {children}
    </div>
  );
}

export default PageTransition;
