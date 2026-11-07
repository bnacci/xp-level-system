import Link from "next/link";
import { ArrowLeft, ArrowUpRight, BookOpen } from "lucide-react";
import { SectionNavigation } from "./SectionNavigation";
import { XPLogo } from "./XPLogo";

export function SiteHeader({ docs = false }: { docs?: boolean }) {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="XP Level System home">
        <XPLogo className="xp-logo" aria-hidden="true" />
        <span>
          xp-level-system<small>THE PROGRESSION ENGINE</small>
        </span>
        <span className="version">v1.1</span>
      </Link>
      {docs ? (
        <nav aria-label="Main navigation">
          <Link href="/#playground">
            <ArrowLeft aria-hidden="true" /> Playground
          </Link>
          <Link href="/docs" aria-current="page">
            <BookOpen aria-hidden="true" /> Docs
          </Link>
          <a href="https://github.com/bnacci/xp-level-system">
            GitHub <ArrowUpRight aria-hidden="true" />
          </a>
        </nav>
      ) : (
        <SectionNavigation />
      )}
    </header>
  );
}
