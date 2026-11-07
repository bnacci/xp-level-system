import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { XPLogo } from "./XPLogo";
import { TrioooLogo } from "./triooo-logo";

export function SiteFooter() {
  return (
    <footer className="wrap footer">
      <Link className="brand" href="/">
        <XPLogo className="xp-logo" aria-hidden="true" />
        xp-level-system
      </Link>
      <span>
        Built by{" "}
        <a
          className="triooo-credit"
          href="https://triooo.com.br"
          aria-label="Triooo website"
        >
          <TrioooLogo aria-hidden="true" className="triooo-logo w-14" />
        </a>
      </span>
      <Link href="/docs">Docs</Link>
      <a href="https://www.npmjs.com/package/xp-level-system">
        npm <ArrowUpRight aria-hidden="true" />
      </a>
      <a href="https://github.com/bnacci/xp-level-system">
        GitHub <ArrowUpRight aria-hidden="true" />
      </a>
    </footer>
  );
}
