import { ArrowDown, ArrowUpRight, Info, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Code } from "@/components/Code";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getDocs } from "@/lib/versioned-docs";
import { latestVersion, resolveVersion } from "@/lib/releases";
import { DocsSidebar } from "@/components/DocsSidebar";

export const metadata: Metadata = {
  title: "Documentation — xp-level-system",
  description:
    "Install and integrate xp-level-system. API reference, progression curves, React examples, achievements, prestige, events, persistence, and leaderboards.",
};

export default function DocsPage({
  searchParams,
}: {
  searchParams: { version?: string };
}) {
  const version = resolveVersion(searchParams.version);
  const docs = getDocs(version);
  return (
    <>
      <a className="skip-link" href="#docs-content">
        Skip to documentation
      </a>
      <SiteHeader docs />
      <main className="wrap docs-shell">
        <DocsSidebar
          topics={docs.map(({ id, title, group }) => ({ id, title, group }))}
          version={version}
        />
        <article id="docs-content" className="docs-article">
          <div className="docs-intro">
            <span className="docs-breadcrumb">
              xp-level-system <span>/</span> Documentation{" "}
              <span className="version">v{version}</span>
            </span>
            <h1>
              Build the next
              <br />
              <span>level of progress.</span>
            </h1>
            <p>
              From your first XP reward to a complete progression system. Learn
              the concepts, copy the code, and make it yours.
            </p>
            <a className="text-link" href="#installation">
              Start in a few lines <ArrowDown aria-hidden="true" />
            </a>
          </div>
          {version !== latestVersion && (
            <aside className="docs-note">
              <Info aria-hidden="true" />
              <p>
                You are reading v{version}. Features added in v{latestVersion}{" "}
                are excluded. <Link href="/docs">Read the latest docs</Link> or{" "}
                <Link
                  href={`/docs/changelog?from=${version}&to=${latestVersion}`}
                >
                  compare the changes
                </Link>
                .
              </p>
            </aside>
          )}
          {docs.map((section) => (
            <section className="doc-section" id={section.id} key={section.id}>
              <p className="eyebrow">{section.group}</p>
              <h2>
                <a href={`#${section.id}`}>
                  {section.title}
                  <span aria-hidden="true">#</span>
                </a>
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.table && (
                <div
                  className="docs-table-scroll"
                  tabIndex={0}
                  role="region"
                  aria-label={`${section.title} reference table`}
                >
                  <table>
                    <caption className="sr-only">
                      {section.title} reference
                    </caption>
                    <thead>
                      <tr>
                        {section.table.headers.map((header) => (
                          <th key={header} scope="col">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((row) => (
                        <tr key={row[0]}>
                          {row.map((cell, i) =>
                            i === 0 ? (
                              <th scope="row" key={i}>
                                <code>{cell}</code>
                              </th>
                            ) : (
                              <td key={i}>{cell}</td>
                            ),
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {section.examples?.map((example) => (
                <Code
                  key={example.name}
                  name={example.name}
                  code={example.code}
                />
              ))}
              {section.note && (
                <aside className="docs-note">
                  <Info aria-hidden="true" />
                  <p>{section.note}</p>
                </aside>
              )}
            </section>
          ))}
          <div className="docs-next">
            <Sparkles aria-hidden="true" />
            <div>
              <h2>Now make it move.</h2>
              <p>
                Test rewards, ranks, prestige, and snapshots in the live
                playground.
              </p>
            </div>
            <Link className="button primary" href="/#playground">
              Open playground <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
