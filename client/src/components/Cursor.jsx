import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    let mx = 0, my = 0;
    let rx = 0, ry = 0;

    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      gsap.to(dot, { x: mx, y: my, duration: 0.05 });
    };
    document.addEventListener('mousemove', onMove);

    // Lagging ring
    let rafId;
    function animRing() {
      rx += (mx - rx) * 0.13;
      ry += (my - ry) * 0.13;
      gsap.set(ring, { x: rx, y: ry });
      rafId = requestAnimationFrame(animRing);
    }
    animRing();

    // Hover scale
    const hoverEls = document.querySelectorAll('button, a, .svc, .pill');
    const onEnter = () => gsap.to(ring, { scale: 2, borderColor: 'rgba(168,85,247,0.7)', duration: 0.25 });
    const onLeave = () => gsap.to(ring, { scale: 1, borderColor: 'rgba(168,85,247,0.4)', duration: 0.25 });
    hoverEls.forEach(el => {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    });

    return () => {
      document.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <div className="cursor" ref={dotRef} />
      <div className="cursor-ring" ref={ringRef} />
    </>
  );
}
