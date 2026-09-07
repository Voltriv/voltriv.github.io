import { useEffect, useRef, useState } from "react";
import { profileData } from "@/data/profile";
import "./boot-intro.css";

type BootIntroProps = {
  lockTz?: string | null;
  oncePerSession?: boolean;
  churnMs?: number;
  name?: string;
  role?: string;
};

const GLYPHS = "01#$%&*<>/\\|{}[]≡+=~";
const HEX = "0123456789abcdef";
const rnd = (s: string) => s[Math.floor(Math.random() * s.length)];
const byte = () => rnd(HEX) + rnd(HEX);

export function BootIntro({
  lockTz = null,
  oncePerSession = true,
  churnMs = 50,
  name = profileData.profileCard.name,
  role = profileData.hero.role,
}: BootIntroProps) {
  const [mounted, setMounted] = useState(() => {
    if (!oncePerSession) return true;
    try {
      return !sessionStorage.getItem("boot-seen");
    } catch {
      return true;
    }
  });
  const rootRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const dumpRef = useRef<HTMLPreElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const scanRef = useRef<HTMLElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const srRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const out = textRef.current;
    const dump = dumpRef.current;
    const status = statusRef.current;
    const bar = barRef.current;
    if (!root || !out || !dump || !status || !bar) return;

    let alive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let raf: number | null = null;
    let unmountTimer: ReturnType<typeof setTimeout> | null = null;
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));

    const cleanup = () => {
      alive = false;
      timers.forEach(clearTimeout);
      if (raf) cancelAnimationFrame(raf);
      if (unmountTimer) clearTimeout(unmountTimer);
      document.documentElement.style.overflow = "";
    };

    const kill = () => {
      if (!alive) return;
      alive = false;
      timers.forEach(clearTimeout);
      if (raf) cancelAnimationFrame(raf);
      root.classList.add("boot-gone");
      document.documentElement.style.overflow = "";
      unmountTimer = setTimeout(() => setMounted(false), 1000);
    };

    try {
      if (oncePerSession) sessionStorage.setItem("boot-seen", "1");
    } catch {
      // sessionStorage can be unavailable in privacy-restricted browsing contexts.
    }

    document.documentElement.style.overflow = "hidden";
    at(11000, kill); // failsafe — never strand a visitor

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const hourNow = (tz: string | null) => {
      if (!tz) return new Date().getHours();
      try {
        const h = new Intl.DateTimeFormat("en-US", {
          hour: "2-digit",
          hourCycle: "h23",
          timeZone: tz,
        }).format(new Date());
        return parseInt(h, 10) % 24;
      } catch {
        return new Date().getHours();
      }
    };

    const hour = hourNow(lockTz);
    const greeting =
      hour < 5
        ? "Still awake?"
        : hour < 12
          ? "Good morning."
          : hour < 18
            ? "Good afternoon."
            : "Good evening.";

    if (srRef.current) {
      srRef.current.textContent = `${greeting} Connection secure. ${name}, ${role}.`;
    }

    let digestHex: string | null = null;
    try {
      window.crypto.subtle
        .digest("SHA-256", new TextEncoder().encode(greeting))
        .then((buf) => {
          digestHex = Array.from(new Uint8Array(buf))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
        })
        .catch(() => {});
    } catch {
      // Web Crypto can be unavailable in some embedded contexts.
    }

    const digestOrFallback = () => {
      if (digestHex) return digestHex;
      let s = "";
      while (s.length < 64) s += rnd(HEX);
      return s;
    };

    const COLS = 8;
    const rows = Math.ceil(greeting.length / COLS);
    const SLOTS = rows * COLS;
    const filler: string[] = [];
    for (let i = greeting.length; i < SLOTS; i++) filler[i] = byte();
    const hexOf = (i: number) => greeting.charCodeAt(i).toString(16).padStart(2, "0");

    const hexEls: HTMLSpanElement[] = [];
    const ascEls: HTMLSpanElement[] = [];
    const greetEls: HTMLSpanElement[] = [];

    out.textContent = "";
    for (let i = 0; i < greeting.length; i++) {
      const s = document.createElement("span");
      if (greeting[i] === " ") s.textContent = " ";
      else {
        s.className = "g-dim";
        s.textContent = rnd(GLYPHS);
      }
      out.appendChild(s);
      greetEls[i] = s;
    }

    dump.textContent = "";
    const txt = (t: string) => document.createTextNode(t);
    for (let r = 0; r < rows; r++) {
      const off = document.createElement("span");
      off.className = "off";
      off.textContent = (r * COLS).toString(16).padStart(4, "0");
      dump.appendChild(off);
      dump.appendChild(txt("  "));

      for (let c = 0; c < COLS; c++) {
        const i = r * COLS + c;
        const h = document.createElement("span");
        h.className = "b-dim";
        h.textContent = byte();
        dump.appendChild(h);
        hexEls[i] = h;
        dump.appendChild(txt(c === COLS - 1 ? "  " : " "));
      }
      for (let c = 0; c < COLS; c++) {
        const i = r * COLS + c;
        const a = document.createElement("span");
        a.className = "b-dim";
        a.textContent = "·";
        dump.appendChild(a);
        ascEls[i] = a;
      }
      if (r < rows - 1) dump.appendChild(txt("\n"));
    }

    const settle = (i: number) => {
      hexEls[i].className = "b-on";
      hexEls[i].textContent = i < greeting.length ? hexOf(i) : filler[i];
      if (i < greeting.length) {
        ascEls[i].className = "a-on";
        ascEls[i].textContent = greeting[i];
        if (greeting[i] !== " ") {
          greetEls[i].className = "";
          greetEls[i].textContent = greeting[i];
        }
      }
    };
    const settleAll = () => {
      for (let i = 0; i < SLOTS; i++) settle(i);
    };

    let settled = 0;
    let decoding = false;
    let decodeStart = 0;
    let lastChurn = 0;
    const decodeMs = 1150;

    const loop = (t: number) => {
      if (!alive) return;

      if (decoding) {
        const p = Math.min((t - decodeStart) / decodeMs, 1);
        const want = Math.floor(p * SLOTS);
        while (settled < want) settle(settled++);
        if (p >= 1) {
          decoding = false;
          settleAll();
          settled = SLOTS;
        }
      }

      if (t - lastChurn > churnMs) {
        lastChurn = t;
        for (let i = settled; i < SLOTS; i++) {
          hexEls[i].textContent = byte();
          if (i < greeting.length && greeting[i] !== " ") {
            greetEls[i].textContent = rnd(GLYPHS);
          }
        }
      }

      if (settled < SLOTS) raf = requestAnimationFrame(loop);
    };

    if (reduce) {
      settleAll();
      settled = SLOTS;
    } else raf = requestAnimationFrame(loop);

    const setStatus = (html: string, cb?: () => void) => {
      status.classList.add("blink");
      at(reduce ? 1 : 140, () => {
        if (!alive) return;
        status.innerHTML = html;
        status.classList.remove("blink");
        if (cb) cb();
      });
    };
    const fill = (step: number) => {
      bar.style.width = `${(step / 8) * 100}%`;
    };

    const revealDigest = (el: HTMLElement, hexStr: string, duration: number) => {
      const text = `${hexStr.slice(0, 32)}\n${hexStr.slice(32)}`;
      if (reduce) {
        el.textContent = text;
        el.className = "fp done";
        return;
      }
      const start = performance.now();
      const frame = (t: number) => {
        if (!alive) return;
        const p = Math.min((t - start) / duration, 1);
        const n = Math.floor(p * text.length);
        let s = "";
        for (let i = 0; i < text.length; i++) {
          s += i < n || text[i] === "\n" ? text[i] : rnd(HEX);
        }
        el.textContent = s;
        if (p < 1) requestAnimationFrame(frame);
        else {
          el.textContent = text;
          el.className = "fp done";
        }
      };
      requestAnimationFrame(frame);
    };

    /* ---- sequence ---- */
    if (!reduce && scanRef.current) scanRef.current.classList.add("run");

    at(250, () => {
      setStatus("&rarr; syn");
      fill(1);
    });
    at(650, () => {
      setStatus("&larr; syn-ack");
      fill(2);
    });
    at(1050, () => {
      setStatus("&rarr; ack");
      fill(3);
    });

    at(1450, () => {
      setStatus("key exchange x25519");
      fill(4);
    });
    at(1850, () => {
      setStatus("cipher aes-256-gcm");
      fill(5);
    });

    at(2300, () => {
      setStatus("decrypting payload");
      fill(6);
      dump.classList.add("on");
      if (!reduce) {
        decoding = true;
        decodeStart = performance.now();
      }
    });

    at(3650, () => {
      setStatus(`sha256 <q>${greeting}</q><span class="fp" id="boot-fp"></span>`, () => {
        const el = status.querySelector<HTMLElement>("#boot-fp");
        if (el) revealDigest(el, digestOrFallback(), reduce ? 1 : 1100);
      });
      fill(7);
    });

    at(5000, () => {
      setStatus(`<em>${name}</em>${role}<u></u>`);
      fill(8);
    });

    at(reduce ? 5200 : 5900, kill);
    at(700, () => {
      if (skipRef.current) skipRef.current.classList.add("on");
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") kill();
    };
    const onClick = () => kill();

    document.addEventListener("keydown", onKey);
    root.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("keydown", onKey);
      root.removeEventListener("click", onClick);
      cleanup();
    };
  }, [lockTz, oncePerSession, churnMs, name, role]);

  if (!mounted) return null;

  return (
    <div id="boot" ref={rootRef}>
      <div className="boot-sheet">
        <i className="boot-grain" />
        <i className="boot-lines" />
        <i className="boot-drift" />
        <i className="boot-scan" ref={scanRef} />

        <h1 className="boot-greet" aria-hidden="true">
          <span ref={textRef} />
        </h1>

        <div className="boot-rule">
          <i ref={barRef} />
        </div>

        <p className="boot-status" ref={statusRef} aria-hidden="true" />
        <pre className="boot-dump" ref={dumpRef} aria-hidden="true" />

        <button className="boot-skip" ref={skipRef} type="button">
          skip
        </button>
      </div>

      <p className="boot-sr" ref={srRef} />
    </div>
  );
}
