"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  GitCompareArrows,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { DocSection } from "@/lib/docs";
import type { DocsVersion } from "@/lib/releases";
import { VersionSelector } from "./VersionSelector";

type Topic = Pick<DocSection, "id" | "title" | "group">;
export function DocsSidebar({
  topics,
  version,
  changes = false,
}: {
  topics: Topic[];
  version: DocsVersion;
  changes?: boolean;
}) {
  const [active, setActive] = useState(topics[0]?.id ?? "");
  useEffect(() => {
    if (changes) return;
    let frame = 0;
    function update() {
      const headerBottom =
        document.querySelector(".site-header")?.getBoundingClientRect()
          .bottom ?? 110;
      const scrollPadding =
        parseFloat(
          getComputedStyle(document.documentElement).scrollPaddingTop,
        ) || 0;
      const boundary = Math.max(headerBottom + 36, scrollPadding) + 2;
      const reached = topics.filter((topic) => {
        const element = document.getElementById(topic.id);
        return element && element.getBoundingClientRect().top <= boundary;
      });
      setActive(reached.at(-1)?.id ?? topics[0]?.id ?? "");
    }
    function schedule() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    }
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("hashchange", schedule);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("hashchange", schedule);
    };
  }, [topics, changes]);
  return (
    <aside className="docs-sidebar">
      <p className="eyebrow">
        <BookOpen aria-hidden="true" /> DOCUMENTATION
      </p>
      <VersionSelector version={version} />
      <Link
        className="changes-link"
        href={`/docs/changelog?from=1.0.0&to=${version}`}
        aria-current={changes ? "page" : undefined}
      >
        <GitCompareArrows aria-hidden="true" /> Changelog & comparison
      </Link>
      <nav aria-label="Documentation topics">
        {(["Getting started", "Core concepts", "Integrations"] as const).map(
          (group) => (
            <div className="docs-nav-group" key={group}>
              <p>{group}</p>
              {topics
                .filter((topic) => topic.group === group)
                .map((topic) =>
                  changes ? (
                    <Link
                      key={topic.id}
                      href={`/docs?version=${version}#${topic.id}`}
                    >
                      {topic.title}
                    </Link>
                  ) : (
                    <a
                      key={topic.id}
                      href={`#${topic.id}`}
                      aria-current={
                        active === topic.id ? "location" : undefined
                      }
                    >
                      {topic.title}
                    </a>
                  ),
                )}
            </div>
          ),
        )}
      </nav>
      <Link className="docs-playground-link" href="/#playground">
        <Sparkles aria-hidden="true" /> Try the playground{" "}
        <ArrowUpRight aria-hidden="true" />
      </Link>
    </aside>
  );
}
