import { useId, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import "./YomioLogoSequence.css";

gsap.registerPlugin(useGSAP);

const SYMBOL_PATH = "M36 46Q36 34 46 34Q51 34 56 38L90 62L124 38Q129 34 134 34Q144 34 144 46V58Q144 66 138 70L104 94V136Q104 143 99 146Q95 148 90 141Q85 148 81 146Q76 143 76 136V94L42 70Q36 66 36 58Z";

export function YomioLogoSequence() {
  const rootRef = useRef(null);
  const rawId = useId();
  const maskId = `yomio-reveal-${rawId.replace(/:/g, "")}`;

  useGSAP(() => {
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: reduce)", () => {
      const closed = "[data-logo-frame='closed']";
      const open = "[data-logo-frame='open']";
      const final = "[data-logo-frame='final']";

      gsap.set("[data-logo-reveal], [data-logo-accent], [data-logo-glow]", { autoAlpha: 0 });
      gsap.set(closed, { autoAlpha: 1, scale: 1, rotation: 0 });
      gsap.set(open, { autoAlpha: 0, scale: 1, rotation: 0 });
      gsap.set(final, { autoAlpha: 0, scale: 1, rotation: 0 });

      const reducedTimeline = gsap.timeline({ repeat: -1, repeatDelay: 0.45, defaults: { ease: "none" } });
      reducedTimeline
        .to(closed, { autoAlpha: 0, duration: 0.3 }, 0.3)
        .to(open, { autoAlpha: 1, duration: 0.3 }, 0.3)
        .to(open, { autoAlpha: 0, duration: 0.35 }, 0.95)
        .to(final, { autoAlpha: 1, duration: 0.35 }, 0.95)
        .to(final, { autoAlpha: 0, duration: 0.35 }, 2.05)
        .to(closed, { autoAlpha: 1, duration: 0.35 }, 2.05);

      return () => reducedTimeline.kill();
    });

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const closed = "[data-logo-frame='closed']";
      const open = "[data-logo-frame='open']";
      const final = "[data-logo-frame='final']";
      const reveal = "[data-logo-reveal]";
      const maskPages = "[data-logo-mask-page]";
      const pageLines = "[data-logo-page-line]";
      const accents = "[data-logo-accent]";
      const glow = "[data-logo-glow]";

      gsap.set(closed, { autoAlpha: 0, scale: 0.68, rotation: -8, y: 10, svgOrigin: "90 95" });
      gsap.set(open, { autoAlpha: 0, scale: 0.9, svgOrigin: "90 104" });
      gsap.set("[data-logo-page='left']", { scaleX: 0.12, svgOrigin: "90 101" });
      gsap.set("[data-logo-page='right']", { scaleX: 0.12, svgOrigin: "90 101" });
      gsap.set(maskPages, { scaleX: 0.08, svgOrigin: "90 101" });
      gsap.set(pageLines, { strokeDasharray: 44, strokeDashoffset: 44, autoAlpha: 0 });
      gsap.set(accents, { autoAlpha: 0, scale: 0.4, svgOrigin: "90 90" });
      gsap.set(glow, { autoAlpha: 0, scale: 0.55, svgOrigin: "90 90" });
      gsap.set(reveal, { autoAlpha: 0 });
      gsap.set(final, { autoAlpha: 0, scale: 0.52, rotation: -10, svgOrigin: "90 90" });
      gsap.set("[data-logo-tile]", { scale: 0.94, svgOrigin: "90 90" });

      const timeline = gsap.timeline({
        repeat: -1,
        repeatDelay: 0.65,
        defaults: { ease: "power2.out" }
      });
      timeline
        .addLabel("book", 0)
        .to("[data-logo-tile]", { scale: 1, duration: 0.45, ease: "back.out(1.35)" }, "book")
        .to(closed, { autoAlpha: 1, scale: 1, rotation: 0, y: 0, duration: 0.48, ease: "back.out(1.55)" }, "book+=0.05")
        .to(closed, { scaleY: 0.9, scaleX: 1.05, duration: 0.18, yoyo: true, repeat: 1 }, "book+=0.52")
        .addLabel("open", 0.76)
        .to(closed, { autoAlpha: 0, scale: 0.82, duration: 0.2 }, "open")
        .to(open, { autoAlpha: 1, scale: 1, duration: 0.18 }, "open")
        .to("[data-logo-page]", { scaleX: 1, duration: 0.58, stagger: 0.06, ease: "back.out(1.55)" }, "open+=0.04")
        .to(pageLines, { autoAlpha: 0.68, strokeDashoffset: 0, duration: 0.38, stagger: 0.06 }, "open+=0.3")
        .set(reveal, { autoAlpha: 1 }, "open+=0.42")
        .to(maskPages, { scaleX: 1, duration: 0.5, stagger: 0.05, ease: "power3.inOut" }, "open+=0.42")
        .to(accents, { autoAlpha: 1, scale: 1, duration: 0.28, stagger: 0.06, ease: "back.out(2)" }, "open+=0.58")
        .addLabel("mark", 1.64)
        .to(open, { autoAlpha: 0, scale: 1.08, duration: 0.28 }, "mark")
        .to(pageLines, { autoAlpha: 0, duration: 0.16 }, "mark")
        .to(reveal, { autoAlpha: 0, duration: 0.2 }, "mark+=0.04")
        .to(final, { autoAlpha: 1, scale: 1.08, rotation: 0, duration: 0.48, ease: "back.out(1.9)" }, "mark+=0.02")
        .to(final, { scale: 1, duration: 0.2, ease: "power2.inOut" }, "mark+=0.48")
        .to(glow, { autoAlpha: 0.68, scale: 0.82, duration: 0.12 }, "mark+=0.18")
        .to(glow, { autoAlpha: 0, scale: 1.35, duration: 0.62, ease: "power2.out" }, "mark+=0.3")
        .to("[data-logo-tile]", { scale: 1.035, duration: 0.22, yoyo: true, repeat: 1 }, "mark+=0.32")
        .to(accents, { autoAlpha: 0, scale: 1.35, duration: 0.4 }, "mark+=0.42")
        .to(final, { autoAlpha: 0, scale: 0.86, rotation: 7, duration: 0.3, ease: "power2.in" }, "mark+=1.35");

      return () => timeline.kill();
    });

    return () => media.revert();
  }, { scope: rootRef });

  return (
    <div className="yomio-logo-sequence" ref={rootRef} aria-hidden="true">
      <svg viewBox="0 0 180 180" role="img" focusable="false">
        <defs>
          <linearGradient id={`${maskId}-tile`} x1="20" y1="12" x2="160" y2="168" gradientUnits="userSpaceOnUse">
            <stop stopColor="#44736b" />
            <stop offset="1" stopColor="#294f49" />
          </linearGradient>
          <linearGradient id={`${maskId}-mint`} x1="45" y1="35" x2="126" y2="146" gradientUnits="userSpaceOnUse">
            <stop stopColor="#c8f4ea" />
            <stop offset="1" stopColor="#8fe0cc" />
          </linearGradient>
          <mask id={maskId} maskUnits="userSpaceOnUse" x="25" y="24" width="130" height="130">
            <rect x="25" y="24" width="130" height="130" fill="black" />
            <path data-logo-mask-page d="M90 100C77 79 59 65 35 58V108C58 111 76 121 90 141Z" fill="white" />
            <path data-logo-mask-page d="M90 100C103 79 121 65 145 58V108C122 111 104 121 90 141Z" fill="white" />
          </mask>
        </defs>

        <rect data-logo-tile x="8" y="8" width="164" height="164" rx="40" fill={`url(#${maskId}-tile)`} />
        <circle data-logo-glow cx="90" cy="90" r="58" fill="none" stroke="#a9eadb" strokeOpacity=".72" strokeWidth="3" />
        <path d="M28 133C53 150 127 150 152 133" fill="none" stroke="#82cdbc" strokeOpacity=".18" strokeWidth="2" />
        <g data-logo-accent fill="#bff2e6">
          <path d="M28 47L31 53L37 56L31 59L28 65L25 59L19 56L25 53Z" />
          <path d="M148 33L150 38L155 40L150 42L148 47L146 42L141 40L146 38Z" />
          <circle cx="149" cy="126" r="3" />
        </g>

        <g data-logo-frame="closed">
          <path d="M47 52H133C141 52 147 58 147 66V124C147 131 141 137 133 137H47C39 137 33 131 33 124V66C33 58 39 52 47 52Z" fill="#b7e9de" />
          <path d="M42 59H85C88 59 90 61 90 64V130H45C40 130 37 127 37 122V64C37 61 39 59 42 59ZM138 59H95C92 59 90 61 90 64V130H135C140 130 143 127 143 122V64C143 61 141 59 138 59Z" fill="#315f57" fillOpacity=".34" />
          <path d="M90 62V132" stroke="#d9faf2" strokeWidth="3" strokeLinecap="round" />
        </g>

        <g data-logo-frame="open">
          <path data-logo-page="left" d="M90 101C75 79 56 66 31 61V116C55 118 75 128 90 147Z" fill="#c8f4ea" />
          <path data-logo-page="right" d="M90 101C105 79 124 66 149 61V116C125 118 105 128 90 147Z" fill="#9ce5d3" />
          <path data-logo-page-line d="M45 79C59 83 71 90 82 101" fill="none" stroke="#315f57" strokeOpacity=".5" strokeWidth="2" strokeLinecap="round" />
          <path data-logo-page-line d="M42 94C58 98 70 106 81 117" fill="none" stroke="#315f57" strokeOpacity=".42" strokeWidth="2" strokeLinecap="round" />
          <path data-logo-page-line d="M135 79C121 83 109 90 98 101" fill="none" stroke="#315f57" strokeOpacity=".5" strokeWidth="2" strokeLinecap="round" />
          <path data-logo-page-line d="M138 94C122 98 110 106 99 117" fill="none" stroke="#315f57" strokeOpacity=".42" strokeWidth="2" strokeLinecap="round" />
          <path d="M90 101V147" stroke="#315f57" strokeOpacity=".42" strokeWidth="3" strokeLinecap="round" />
        </g>

        <path data-logo-reveal d={SYMBOL_PATH} fill={`url(#${maskId}-mint)`} mask={`url(#${maskId})`} />
        <path data-logo-frame="final" d={SYMBOL_PATH} fill={`url(#${maskId}-mint)`} />
      </svg>
    </div>
  );
}
