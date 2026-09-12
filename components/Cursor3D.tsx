"use client";

import { useEffect, useRef, useState } from "react";

export function Cursor3D() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const mousePos = useRef({ x: 0, y: 0 });
  const cursorPos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    const handleHoverStart = (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        target.closest("a") ||
        target.closest("button") ||
        target.closest("[role='button']") ||
        target.closest("input") ||
        target.closest("textarea") ||
        target.closest("select") ||
        target.closest(".cursor-pointer")
      ) {
        setIsHovering(true);
      }
    };

    const handleHoverEnd = () => setIsHovering(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseover", handleHoverStart);
    document.addEventListener("mouseout", handleHoverEnd);

    let animationId: number;

    const animate = () => {
      // Smooth follow for dot (fast)
      const dotSpeed = 0.15;
      cursorPos.current.x += (mousePos.current.x - cursorPos.current.x) * dotSpeed;
      cursorPos.current.y += (mousePos.current.y - cursorPos.current.y) * dotSpeed;

      // Slower follow for ring (creates depth effect)
      const ringSpeed = 0.08;
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * ringSpeed;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * ringSpeed;

      // Calculate rotation based on movement
      const deltaX = mousePos.current.x - cursorPos.current.x;
      const deltaY = mousePos.current.y - cursorPos.current.y;
      const rotation = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

      // Calculate scale based on velocity
      const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const scale = 1 + Math.min(velocity * 0.01, 0.3);

      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${cursorPos.current.x}px, ${cursorPos.current.y}px, 0) scale(${isClicking ? 0.5 : isHovering ? 1.5 : 1})`;
      }

      if (cursorRingRef.current) {
        cursorRingRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) rotate(${rotation}deg) scale(${isHovering ? 1.8 : scale})`;
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseover", handleHoverStart);
      document.removeEventListener("mouseout", handleHoverEnd);
      cancelAnimationFrame(animationId);
    };
  }, [isVisible, isHovering, isClicking]);

  // Don't render on touch devices
  if (typeof window !== "undefined" && "ontouchstart" in window) {
    return null;
  }

  return (
    <div
      ref={cursorRef}
      className="fixed inset-0 z-[9999] pointer-events-none"
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      {/* Main dot */}
      <div
        ref={cursorDotRef}
        className="fixed top-0 left-0 w-3 h-3 -ml-1.5 -mt-1.5"
        style={{
          transition: "transform 0.1s ease-out",
          willChange: "transform",
        }}
      >
        <div
          className={`w-full h-full rounded-full transition-all duration-200 ${
            isClicking
              ? "bg-primary-500 scale-75"
              : isHovering
              ? "bg-primary-600 scale-125"
              : "bg-primary-500"
          }`}
          style={{
            boxShadow: isHovering
              ? "0 0 20px rgba(99, 102, 241, 0.6), 0 0 40px rgba(99, 102, 241, 0.3)"
              : "0 0 10px rgba(99, 102, 241, 0.4)",
          }}
        />
      </div>

      {/* Outer ring */}
      <div
        ref={cursorRingRef}
        className="fixed top-0 left-0 w-10 h-10 -ml-5 -mt-5"
        style={{
          transition: "transform 0.15s ease-out",
          willChange: "transform",
        }}
      >
        <div
          className={`w-full h-full rounded-full border-2 transition-all duration-300 ${
            isHovering
              ? "border-primary-500 scale-150 bg-primary-500/10"
              : isClicking
              ? "border-primary-400 scale-75"
              : "border-primary-400/50"
          }`}
          style={{
            boxShadow: isHovering
              ? "0 0 30px rgba(99, 102, 241, 0.3)"
              : "none",
          }}
        />
      </div>

      {/* Trail particles */}
      {[...Array(3)].map((_, i) => (
        <TrailParticle
          key={i}
          mousePos={mousePos}
          delay={i * 0.1}
          isVisible={isVisible}
        />
      ))}
    </div>
  );
}

function TrailParticle({
  mousePos,
  delay,
  isVisible,
}: {
  mousePos: React.MutableRefObject<{ x: number; y: number }>;
  delay: number;
  isVisible: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let animationId: number;
    let time = 0;

    const animate = () => {
      time += 0.016;
      const speed = 0.04 - delay * 0.01;
      posRef.current.x += (mousePos.current.x - posRef.current.x) * speed;
      posRef.current.y += (mousePos.current.y - posRef.current.y) * speed;

      if (ref.current) {
        const opacity = Math.max(0, 0.3 - delay * 0.1);
        const scale = 0.5 - delay * 0.15;
        ref.current.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0) scale(${scale})`;
        ref.current.style.opacity = String(opacity);
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [delay, mousePos]);

  return (
    <div
      ref={ref}
      className="fixed top-0 left-0 w-2 h-2 -ml-1 -mt-1 rounded-full bg-primary-400/30"
      style={{ willChange: "transform", opacity: 0 }}
    />
  );
}
