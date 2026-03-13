import { useEffect, useRef } from 'react';

export default function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);

  useEffect(() => {
    const moveCursor = (e) => {
      if (dot.current) {
        dot.current.style.left = e.clientX + 'px';
        dot.current.style.top = e.clientY + 'px';
      }
      if (ring.current) {
        ring.current.style.left = e.clientX + 'px';
        ring.current.style.top = e.clientY + 'px';
      }
    };

    const hoverIn = () => {
      if (ring.current) {
        ring.current.style.transform = 'translate(-50%, -50%) scale(1.6)';
        ring.current.style.borderColor = 'rgba(201,169,110,0.8)';
      }
    };
    const hoverOut = () => {
      if (ring.current) {
        ring.current.style.transform = 'translate(-50%, -50%) scale(1)';
        ring.current.style.borderColor = 'rgba(201,169,110,0.4)';
      }
    };

    document.addEventListener('mousemove', moveCursor);
    const interactables = document.querySelectorAll('a, button, input, textarea, select');
    interactables.forEach(el => {
      el.addEventListener('mouseenter', hoverIn);
      el.addEventListener('mouseleave', hoverOut);
    });

    return () => {
      document.removeEventListener('mousemove', moveCursor);
      interactables.forEach(el => {
        el.removeEventListener('mouseenter', hoverIn);
        el.removeEventListener('mouseleave', hoverOut);
      });
    };
  }, []);

  return (
    <>
      <div ref={dot} className="cursor" />
      <div ref={ring} className="cursor-ring" />
    </>
  );
}
