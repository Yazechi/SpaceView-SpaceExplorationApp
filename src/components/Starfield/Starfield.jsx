import { useEffect, useRef, useMemo } from 'react';
import './Starfield.css';

function Starfield() {
  const containerRef = useRef(null);

  const stars = useMemo(() => {
    const layers = [
      { count: 60, sizeRange: [1, 2], className: 'star-layer-1', parallax: 0.02 },
      { count: 40, sizeRange: [2, 3], className: 'star-layer-2', parallax: 0.04 },
      { count: 20, sizeRange: [3, 4], className: 'star-layer-3', parallax: 0.06 },
    ];

    return layers.flatMap((layer) =>
      Array.from({ length: layer.count }, (_, i) => ({
        id: `${layer.className}-${i}`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: layer.sizeRange[0] + Math.random() * (layer.sizeRange[1] - layer.sizeRange[0]),
        className: layer.className,
        parallax: layer.parallax,
        delay: Math.random() * 5,
      }))
    );
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const starEls = container.querySelectorAll('.star');
      starEls.forEach((el) => {
        const speed = parseFloat(el.dataset.parallax) || 0;
        el.style.transform = `translateY(${scrollY * speed}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="starfield" ref={containerRef}>
      {stars.map((star) => (
        <div
          key={star.id}
          className={`star ${star.className}`}
          data-parallax={star.parallax}
          style={{
            left: star.left,
            top: star.top,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default Starfield;
