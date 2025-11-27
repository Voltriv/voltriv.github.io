import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Sparkles, CalendarDays } from "lucide-react";
import { BIRTHDAY_DATE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { HeartFireworks } from "./HeartFireworks";

interface BirthdayBannerProps {
  onOpenStory: () => void;
  onOpenPlaylist: () => void;
  onFireworksChange?: (active: boolean) => void;
}

export function BirthdayBanner({
  onOpenStory,
  onOpenPlaylist,
  onFireworksChange,
}: BirthdayBannerProps) {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isBirthday, setIsBirthday] = useState(false);

  useEffect(() => {
    const target = BIRTHDAY_DATE.getTime();
    const timer = setInterval(() => {
      const now = Date.now();
      const difference = target - now;

      if (difference > 0) {
        setIsBirthday(false);
        setCountdown({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / (1000 * 60)) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsBirthday(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    onFireworksChange?.(isBirthday);
  }, [isBirthday, onFireworksChange]);

  return (
    <section className="relative min-h-screen px-4 py-16">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          className="relative overflow-hidden rounded-[2.5rem] border border-white/50 bg-gradient-to-r from-pink-200/75 via-rose-200/75 to-amber-100/75 p-10 shadow-[0_35px_80px_-30px_rgba(244,114,182,0.8)] backdrop-blur"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {isBirthday && (
            <HeartFireworks
              active
              count={180}
              className="mix-blend-screen opacity-95"
            />
          )}
          <div className="absolute inset-0 opacity-30">
            {[...Array(16)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute text-white"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  fontSize: `${Math.random() * 16 + 8}px`,
                }}
                animate={{
                  y: [0, -12, 0],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random(),
                }}
              >
                *
              </motion.span>
            ))}
          </div>

          <div className="relative z-10 grid items-center gap-10 text-slate-900">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-800">
                <Sparkles className="h-4 w-4" />
                Birthday Countdown
                <CalendarDays className="h-4 w-4" />
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-semibold md:text-5xl">
                  {isBirthday ? "Happy Birthday, Annielyn!" : "Happy birthday month, Annielyn!"}
                </h1>
                <p className="text-lg text-slate-700">
                  With every day we count down to your birthday and our monthsary, I want you wrapped in calm, softness, and proof of how deeply I cherish you. Here is what I am preparing for you.
                </p>
                <p className="text-sm uppercase tracking-[0.4em] text-slate-600">
                  Softer hugs - brighter laughter - starlit wishes
                </p>
                <p className="text-sm font-medium text-rose-700">
                  November 30 - your birthday and our monthsary
                </p>
              </div>

              {!isBirthday && (
                <div className="flex flex-wrap gap-4 text-slate-900">
                  {[
                    { label: "Days", value: countdown.days },
                    { label: "Hours", value: countdown.hours },
                    { label: "Minutes", value: countdown.minutes },
                    { label: "Seconds", value: countdown.seconds },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex min-w-[110px] flex-col rounded-2xl bg-white/80 px-4 py-3 text-center shadow-sm"
                    >
                      <span className="text-3xl font-bold">{item.value.toString().padStart(2, "0")}</span>
                      <span className="text-xs uppercase tracking-wide text-slate-500">{item.label}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  size="lg"
                  className="min-w-[180px]"
                  onClick={() => isBirthday && onOpenStory()}
                  disabled={!isBirthday}
                  title={isBirthday ? "Open our story" : "Unlocks once the countdown ends"}
                >
                  {isBirthday ? "See our story" : "See our story (soon)"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="min-w-[200px] border-white/70 bg-white/70 text-slate-900 hover:bg-white"
                  onClick={onOpenPlaylist}
                >
                  Play birthday playlist
                </Button>
              </div>
              {!isBirthday && (
                <p className="text-xs text-slate-600">
                  The story unlocks the second the countdown hits zero on November 30.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
