import { useEffect, useRef } from "react";
import sky from "../assets/sky.png";
import city from "../assets/bg.png";
import birds from "../assets/plane.png";

export default function ParallaxHero() {
  const skyRef = useRef(null);
  const cityRef = useRef(null);
  const birdsRef = useRef(null);

  const rafRef = useRef(null);
  const runningRef = useRef(false);

  useEffect(() => {
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let scrollY = 0;

    /* ---------- POINTER MOVE (mouse + touch) ---------- */
    const updatePointer = (clientX, clientY) => {
      const x = (clientX / window.innerWidth - 0.5) * 2;
      const y = (clientY / window.innerHeight - 0.5) * 2;

      // clamp so it never flies away
      target.x = Math.max(-1, Math.min(1, x));
      target.y = Math.max(-1, Math.min(1, y));
    };

    const handleMouse = (e) => updatePointer(e.clientX, e.clientY);
    const handleTouch = (e) =>
      updatePointer(e.touches[0].clientX, e.touches[0].clientY);

    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    window.addEventListener("mousemove", handleMouse, { passive: true });
    window.addEventListener("touchmove", handleTouch, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    /* ---------- ANIMATION LOOP ---------- */
    let lastTime = performance.now();

    const animate = (time) => {
      if (!runningRef.current) return;

      const delta = Math.min((time - lastTime) / 16.67, 2); // frame independent
      lastTime = time;

      const ease = 0.07 * delta;

      current.x += (target.x - current.x) * ease;
      current.y += (target.y - current.y) * ease;

      const sx = current.x * 12 + scrollY * 0.5;
      const sy = current.y * 12 + scrollY * 0.2;
      const bx = current.x * 25 + scrollY * 0.8;
      const by = current.y * 18 + scrollY * 0.3;
      const cx = current.x * 40 + scrollY * 1.2;
      const cy = current.y * 30 + scrollY * 0.5;

      if (skyRef.current)
        skyRef.current.style.transform = `translate3d(${sx}px, ${sy}px,0)`;

      if (birdsRef.current)
        birdsRef.current.style.transform = `translate3d(${bx}px, ${by}px,0)`;

      if (cityRef.current)
        cityRef.current.style.transform = `translate3d(${cx}px, ${cy}px,0)`;

      rafRef.current = requestAnimationFrame(animate);
    };

    /* ---------- START / STOP WHEN TAB VISIBLE ---------- */
    const start = () => {
      if (!runningRef.current) {
        runningRef.current = true;
        lastTime = performance.now();
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    const stop = () => {
      runningRef.current = false;
      cancelAnimationFrame(rafRef.current);
    };

    document.addEventListener("visibilitychange", () => {
      document.hidden ? stop() : start();
    });

    start();

    /* ---------- CLEANUP ---------- */
    return () => {
      stop();
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("touchmove", handleTouch);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {/* SKY */}
      <div ref={skyRef} className="absolute inset-0 will-change-transform">
        <img
          src={sky}
          className="absolute top-[-20%] left-1/2 w-[160%] h-[150%] object-cover select-none"
          style={{ transform: "translateX(-50%)" }}
          alt=""
        />
      </div>

      {/* BIRDS */}
      <div
        ref={birdsRef}
        className="absolute top-[15%] left-[-20%] w-[140%] will-change-transform"
      >
        <img
          src={birds}
          className="w-[300px] opacity-80 animate-birdsFly select-none"
          alt=""
        />
      </div>

      {/* CITY */}
      <div ref={cityRef} className="absolute inset-0 will-change-transform">
        <img
          src={city}
          className="absolute bottom-[-20%] left-1/2 w-[160%] h-[135%] object-cover select-none"
          style={{ transform: "translateX(-50%)" }}
          alt=""
        />
      </div>
    </div>
  );
}