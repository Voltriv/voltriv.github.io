export type HeroCardConfig = {
  id: string;
  dx: number;
  dy: number;
};

export const HERO_CARDS: HeroCardConfig[] = [
  { id: "c1", dx: -70, dy: -46 },
  { id: "c2", dx: 72, dy: -52 },
  { id: "c3", dx: -80, dy: 10 },
  { id: "c4", dx: 78, dy: 14 },
  { id: "c5", dx: -46, dy: 66 },
  { id: "c6", dx: 52, dy: 62 },
];

const CARD_SVGS: Record<string, JSX.Element> = {
  c1: (
    <svg viewBox="0 0 120 90">
      <rect width="120" height="90" fill="#161616" />
      <rect x="10" y="12" width="100" height="66" fill="#1d1d1d" stroke="#313131" />
      <rect x="10" y="12" width="100" height="9" fill="#313131" />
      <g fill="#4a4a4a">
        <rect x="18" y="30" width="5" height="3" />
        <rect x="27" y="30" width="42" height="3" />
        <rect x="18" y="40" width="5" height="3" />
        <rect x="27" y="40" width="27" height="3" />
        <rect x="18" y="50" width="5" height="3" />
        <rect x="27" y="50" width="48" height="3" />
      </g>
      <rect x="18" y="60" width="5" height="6" fill="#787878" />
    </svg>
  ),
  c2: (
    <svg viewBox="0 0 120 90">
      <rect width="120" height="90" fill="#161616" />
      <g stroke="#3a3a3a" strokeWidth="1.5" fill="none">
        <path d="M60 45 L26 24" />
        <path d="M60 45 L96 26" />
        <path d="M60 45 L24 66" />
        <path d="M60 45 L94 68" />
      </g>
      <g fill="#565656">
        <circle cx="26" cy="24" r="5" />
        <circle cx="96" cy="26" r="5" />
        <circle cx="24" cy="66" r="5" />
        <circle cx="94" cy="68" r="5" />
      </g>
      <circle cx="60" cy="45" r="9" fill="#7d7d7d" />
    </svg>
  ),
  c3: (
    <svg viewBox="0 0 120 90">
      <rect width="120" height="90" fill="#161616" />
      <g fill="#2c2c2c">
        <rect x="14" y="18" width="11" height="6" />
        <rect x="30" y="18" width="11" height="6" />
        <rect x="46" y="18" width="11" height="6" />
        <rect x="62" y="18" width="11" height="6" />
        <rect x="78" y="18" width="11" height="6" />
        <rect x="94" y="18" width="11" height="6" />
        <rect x="14" y="34" width="11" height="6" />
        <rect x="46" y="34" width="11" height="6" />
        <rect x="78" y="34" width="11" height="6" />
        <rect x="94" y="34" width="11" height="6" />
        <rect x="14" y="50" width="11" height="6" />
        <rect x="30" y="50" width="11" height="6" />
        <rect x="62" y="50" width="11" height="6" />
        <rect x="78" y="50" width="11" height="6" />
        <rect x="94" y="50" width="11" height="6" />
        <rect x="14" y="66" width="11" height="6" />
        <rect x="30" y="66" width="11" height="6" />
        <rect x="46" y="66" width="11" height="6" />
        <rect x="62" y="66" width="11" height="6" />
        <rect x="78" y="66" width="11" height="6" />
        <rect x="94" y="66" width="11" height="6" />
      </g>
      <g fill="#7a7a7a">
        <rect x="30" y="34" width="11" height="6" />
        <rect x="62" y="34" width="11" height="6" />
        <rect x="46" y="50" width="11" height="6" />
      </g>
    </svg>
  ),
  c4: (
    <svg viewBox="0 0 120 90">
      <rect width="120" height="90" fill="#161616" />
      <g fill="#454545">
        <rect x="14" y="52" width="8" height="24" />
        <rect x="26" y="40" width="8" height="36" />
        <rect x="38" y="58" width="8" height="18" />
        <rect x="62" y="46" width="8" height="30" />
        <rect x="74" y="62" width="8" height="14" />
        <rect x="86" y="36" width="8" height="40" />
        <rect x="98" y="54" width="8" height="22" />
      </g>
      <rect x="50" y="24" width="8" height="52" fill="#8a8a8a" />
      <rect x="10" y="77" width="100" height="1" fill="#313131" />
    </svg>
  ),
  c5: (
    <svg viewBox="0 0 120 90">
      <rect width="120" height="90" fill="#161616" />
      <rect x="22" y="11" width="76" height="68" fill="#1d1d1d" stroke="#313131" />
      <g fill="#434343">
        <rect x="32" y="23" width="46" height="3" />
        <rect x="32" y="32" width="56" height="3" />
        <rect x="32" y="41" width="37" height="3" />
      </g>
      <circle cx="76" cy="61" r="11" fill="none" stroke="#7a7a7a" strokeWidth="2" />
      <path
        d="M71 61 l4 4 l7 -8"
        fill="none"
        stroke="#7a7a7a"
        strokeWidth="2"
        strokeLinecap="square"
      />
    </svg>
  ),
  c6: (
    <svg viewBox="0 0 120 90">
      <rect width="120" height="90" fill="#161616" />
      <rect x="16" y="20" width="7" height="7" fill="#7a7a7a" />
      <rect x="30" y="22" width="28" height="3" fill="#454545" />
      <rect x="66" y="22" width="38" height="3" fill="#2c2c2c" />
      <rect x="16" y="35" width="7" height="7" fill="#2c2c2c" />
      <rect x="30" y="37" width="22" height="3" fill="#454545" />
      <rect x="66" y="37" width="30" height="3" fill="#2c2c2c" />
      <rect x="16" y="50" width="7" height="7" fill="#7a7a7a" />
      <rect x="30" y="52" width="31" height="3" fill="#454545" />
      <rect x="66" y="52" width="26" height="3" fill="#2c2c2c" />
      <rect x="16" y="65" width="7" height="7" fill="#2c2c2c" />
      <rect x="30" y="67" width="19" height="3" fill="#454545" />
      <rect x="66" y="67" width="34" height="3" fill="#2c2c2c" />
    </svg>
  ),
};

export const heroCardSvg = (id: string) => CARD_SVGS[id];
