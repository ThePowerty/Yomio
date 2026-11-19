import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import "./YomioStoryAmbient.css";

gsap.registerPlugin(useGSAP);

export function YomioStoryAmbient() {
  const rootRef = useRef(null);

  useGSAP(() => {
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: reduce)", () => {
      const nodes = gsap.utils.toArray("[data-ambient-node]");
      const cards = gsap.utils.toArray("[data-ambient-card]");

      gsap.set("[data-ambient-route]", { autoAlpha: 0.2 });
      gsap.set("[data-ambient-dot]", { autoAlpha: 0 });
      gsap.set(nodes, { autoAlpha: 0.22 });
      gsap.set(cards, { autoAlpha: 0.12 });

      const reducedTimeline = gsap.timeline({ repeat: -1, repeatDelay: 0.35, defaults: { ease: "sine.inOut" } });
      nodes.forEach((node, index) => {
        reducedTimeline
          .to(node, { autoAlpha: 0.76, duration: 0.7 }, index * 1.05)
          .to(node, { autoAlpha: 0.22, duration: 0.7 }, index * 1.05 + 0.7);
      });
      reducedTimeline
        .to(cards, { autoAlpha: 0.32, duration: 0.8, stagger: 0.2 }, 0.4)
        .to(cards, { autoAlpha: 0.12, duration: 0.8, stagger: 0.2 }, 2.1);

      return () => reducedTimeline.kill();
    });

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const nodes = gsap.utils.toArray("[data-ambient-node]");
      const cards = gsap.utils.toArray("[data-ambient-card]");
      const dot = "[data-ambient-dot]";

      gsap.set(nodes, { autoAlpha: 0.42, scale: 1, transformBox: "fill-box", transformOrigin: "center" });
      gsap.set(cards, { autoAlpha: 0.34, transformBox: "fill-box", transformOrigin: "center" });
      gsap.set(dot, { x: 0, y: 0, autoAlpha: 1 });

      const timeline = gsap.timeline({ repeat: -1, defaults: { ease: "sine.inOut" } });
      timeline
        .to("[data-ambient-route]", { strokeDashoffset: -96, duration: 5.4, ease: "none" }, 0)
        .to(dot, { x: 115, y: -78, duration: 1.2 }, 0)
        .to(dot, { x: 300, y: -40, duration: 1.35 }, 1.2)
        .to(dot, { x: 445, y: -86, duration: 1.25 }, 2.55)
        .to(dot, { x: 590, y: 2, duration: 1.6 }, 3.8)
        .to(cards, { y: (index) => index % 2 === 0 ? -12 : 10, rotation: (index) => index % 2 === 0 ? -2 : 2, duration: 2.2, stagger: 0.3, yoyo: true, repeat: 1 }, 0)
        .to(nodes[0], { autoAlpha: 0.94, scale: 1.14, duration: 0.28, yoyo: true, repeat: 1, ease: "back.out(2)" }, 0.05)
        .to(nodes[1], { autoAlpha: 0.94, scale: 1.14, duration: 0.28, yoyo: true, repeat: 1, ease: "back.out(2)" }, 2.25)
        .to(nodes[2], { autoAlpha: 0.94, scale: 1.14, duration: 0.28, yoyo: true, repeat: 1, ease: "back.out(2)" }, 4.55);

      return () => timeline.kill();
    });

    return () => media.revert();
  }, { scope: rootRef });

  return (
    <div className="yomio-story-ambient" ref={rootRef} aria-hidden="true">
      <svg viewBox="0 0 760 340" focusable="false">
        <path
          data-ambient-route
          className="story-ambient-route"
          d="M80 180C168 72 270 82 380 140C492 199 565 65 670 182"
          fill="none"
          pathLength="240"
        />
        <circle data-ambient-dot className="story-ambient-dot" cx="80" cy="180" r="6" />

        <g data-ambient-node className="story-ambient-node" transform="translate(80 180)">
          <circle r="30" />
          <path d="M-14-11H-2C4-11 7-8 7-3V14C4 10 1 8-4 8H-14ZM14-11H2C-4-11-7-8-7-3V14C-4 10-1 8 4 8H14Z" />
        </g>
        <g data-ambient-node className="story-ambient-node" transform="translate(380 140)">
          <circle r="30" />
          <rect x="-15" y="-11" width="30" height="21" rx="3" />
          <path d="M-5 17H5M0 10V17" />
          <path className="story-ambient-play" d="M-4-6L7 0L-4 6Z" />
        </g>
        <g data-ambient-node className="story-ambient-node" transform="translate(670 182)">
          <circle r="30" />
          <path d="M0-16L4-5L15-1L5 4L1 15L-4 5L-15 1L-5-4Z" />
        </g>

        <g data-ambient-card className="story-ambient-card" transform="translate(145 32)">
          <rect width="74" height="102" rx="9" />
          <rect x="10" y="11" width="54" height="54" rx="6" />
          <path d="M12 79H57M12 89H43" />
        </g>
        <g data-ambient-card className="story-ambient-card" transform="translate(536 215)">
          <rect width="92" height="72" rx="9" />
          <circle cx="19" cy="20" r="7" />
          <path d="M32 18H76M14 42H78M14 54H61" />
        </g>
        <g data-ambient-card className="story-ambient-progress" transform="translate(270 252)">
          <rect width="192" height="28" rx="14" />
          <rect x="8" y="8" width="128" height="12" rx="6" />
          <circle cx="174" cy="14" r="5" />
        </g>
      </svg>
    </div>
  );
}
