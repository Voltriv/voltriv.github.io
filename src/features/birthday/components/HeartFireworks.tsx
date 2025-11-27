import { useMemo } from "react";
import { motion } from "motion/react";

interface HeartFireworksProps {
  active: boolean;
  count?: number;
  className?: string;
}

const COLORS = ["#ff4d79", "#ff8fb1", "#ffd166", "#8be9fd", "#c084fc", "#fb7185"];
const ORIGIN_ZONES = [
  { x: [30, 70], y: -12, travel: -230 }, // center lift
  { x: [-5, 15], y: -6, travel: -210 }, // left edge
  { x: [85, 105], y: -6, travel: -210 }, // right edge
];

export function HeartFireworks({ active, count = 200, className }: HeartFireworksProps) {
  if (!active) return null;

  const rand = (min: number, max: number) => Math.random() * (max - min) + min;

  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const zone = ORIGIN_ZONES[i % ORIGIN_ZONES.length];
        const hue = COLORS[i % COLORS.length];
        const size = rand(12, 26);
        const startX = rand(zone.x[0], zone.x[1]);
        const travelX = rand(-160, 160);

        return { zone, hue, size, startX, travelX };
      }),
    [count],
  );

  const containerClass = [
    "pointer-events-none absolute inset-0 z-20 overflow-hidden",
    className ?? "",
  ]
    .join(" ")
    .trim();

  return (
    <div className={containerClass}>
      {particles.map((particle, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${particle.startX}%`,
            bottom: `${particle.zone.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: `radial-gradient(circle at 30% 30%, #fff, ${particle.hue})`,
            boxShadow: `0 0 12px ${particle.hue}80, 0 0 28px ${particle.hue}40`,
          }}
          animate={{
            y: ["0%", `${particle.zone.travel}%`],
            x: [0, particle.travelX],
            opacity: [1, 0.7, 0],
            scale: [0.7, rand(1.6, 2.2)],
            filter: ["blur(0px)", "blur(0px)", "blur(2px)"],
          }}
          transition={{
            duration: 3 + Math.random() * 2.5,
            delay: i * 0.06,
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  );
}
