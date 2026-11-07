"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";

const sections = [
  { id: "playground", label: "Playground" },
  { id: "recipes", label: "Usage guide" },
  { id: "curves", label: "Curve lab" },
];

export function SectionNavigation() {
  const [active, setActive] = useState("");

  useEffect(() => {
    function update() {
      // The header remains visible; select the last section that reached it.
      const headerHeight =
        document.querySelector(".site-header")?.getBoundingClientRect()
          .bottom ?? 100;
      const current = sections
        .filter((section) => {
          const element = document.getElementById(section.id);
          return (
            element && element.getBoundingClientRect().top <= headerHeight + 60
          );
        })
        .at(-1);
      setActive(current?.id ?? "");
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <nav aria-label="Main navigation">
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          aria-current={active === section.id ? "location" : undefined}
        >
          {section.label}
        </a>
      ))}
      <Link href="/docs">Docs</Link>
      <a href="https://github.com/bnacci/xp-level-system">
        GitHub <ArrowUpRight aria-hidden="true" />
      </a>
    </nav>
  );
}
