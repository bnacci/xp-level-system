import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  GitCompareArrows,
  Info,
  Minus,
  Plus,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DocsSidebar } from "@/components/DocsSidebar";
import { CompareVersions } from "@/components/CompareVersions";
import { getDocs } from "@/lib/versioned-docs";
import {
  features,
  hasFeature,
  latestVersion,
  releases,
  resolveVersion,
} from "@/lib/releases";

export const metadata: Metadata = {
  title: "Changelog & version comparison — xp-level-system",
  description:
    "Compare the documented xp-level-system versions, inspect feature availability, and read the release history.",
};

export default function ChangelogPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string };
}) {
  const from = resolveVersion(searchParams.from ?? "1.0.0");
  const to = resolveVersion(searchParams.to);
  const added = features.filter(
    (feature) =>
      !hasFeature(from, feature.since) && hasFeature(to, feature.since),
  );
  const removed = features.filter(
    (feature) =>
      hasFeature(from, feature.since) && !hasFeature(to, feature.since),
  );
  const unchanged = features.filter(
    (feature) =>
      hasFeature(from, feature.since) && hasFeature(to, feature.since),
  );
  const topics = getDocs(to).map(({ id, title, group }) => ({
    id,
    title,
    group,
  }));
  return (
    <>
      <a className="skip-link" href="#changes-content">
        Skip to changelog
      </a>
      <SiteHeader docs />
      <main className="wrap docs-shell">
        <DocsSidebar topics={topics} version={to} changes />
        <article id="changes-content" className="docs-article">
          <div className="docs-intro">
            <span className="docs-breadcrumb">
              xp-level-system <span>/</span>
              <Link href="/docs">Documentation</Link>
              <span>/</span> Releases
            </span>
            <h1>
              Know what
              <br />
              <span>comes next.</span>
            </h1>
            <p>
              Compare features before you upgrade. Release notes come from the
              repository changelog and source history, with links to the
              original revisions.
            </p>
          </div>
          <section id="comparison" className="doc-section">
            <p className="eyebrow">
              <GitCompareArrows aria-hidden="true" /> VERSION COMPARISON
            </p>
            <h2>From one version to the next.</h2>
            <CompareVersions from={from} to={to} />
            <div className="change-stats" aria-label="Comparison summary">
              <span>
                <Plus aria-hidden="true" />
                <strong>{added.length}</strong> added
              </span>
              <span>
                <Minus aria-hidden="true" />
                <strong>{removed.length}</strong> removed
              </span>
              <span>
                <Check aria-hidden="true" />
                <strong>{unchanged.length}</strong> retained
              </span>
            </div>
            {from === to ? (
              <div className="comparison-empty" role="status">
                <Check aria-hidden="true" />
                <strong>No changes between identical versions.</strong>
                <p>Select a different source or target to compare.</p>
              </div>
            ) : (
              <>
                <aside className="docs-note">
                  <Info aria-hidden="true" />
                  <p>
                    {removed.length
                      ? "This is a downgrade. Features marked removed are unavailable in the target version; update code using those APIs before switching."
                      : "The 1.1.0 changelog declares backward compatibility with 1.0.0. The core XPSystem API remains available; the new toolkit APIs are optional."}
                  </p>
                </aside>
                <p className="comparison-metadata">
                  Package metadata also differs: v1.1.0 updates the description
                  and keywords to cover the broader toolkit. See the release
                  history below.
                </p>
                <div className="change-list">
                  {[
                    ...added.map((feature) => ({ ...feature, kind: "Added" })),
                    ...removed.map((feature) => ({
                      ...feature,
                      kind: "Removed",
                    })),
                  ].map((feature) => (
                    <div key={feature.name}>
                      <span
                        className={`change-kind ${feature.kind.toLowerCase()}`}
                      >
                        {feature.kind}
                      </span>
                      <div>
                        <h3>{feature.name}</h3>
                        <p>{feature.description}</p>
                        <Link
                          href={`/docs?version=${feature.kind === "Added" ? to : from}#${feature.topic}`}
                        >
                          Read the reference <ArrowUpRight aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            <h3 className="availability-title">Feature availability</h3>
            <div
              className="docs-table-scroll"
              tabIndex={0}
              role="region"
              aria-label="Version feature comparison"
            >
              <table>
                <caption className="sr-only">
                  Features available in source and target versions
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Feature</th>
                    <th scope="col">From · v{from}</th>
                    <th scope="col">To · v{to}</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature) => (
                    <tr key={feature.name}>
                      <th scope="row">{feature.name}</th>
                      {[from, to].map((version, index) => (
                        <td key={index}>
                          <span
                            className={
                              hasFeature(version, feature.since)
                                ? "feature-included"
                                : "feature-unavailable"
                            }
                          >
                            {hasFeature(version, feature.since) ? (
                              <>
                                <Check aria-hidden="true" />
                                Included
                              </>
                            ) : (
                              <>
                                <Minus aria-hidden="true" />
                                Unavailable
                              </>
                            )}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section id="release-history" className="doc-section">
            <p className="eyebrow">RELEASE HISTORY</p>
            <h2>What changed.</h2>
            <p>
              Only versions documented in this repository are listed. Website
              design changes are separate from package releases.
            </p>
            <div className="release-timeline">
              {releases.map((release) => (
                <section key={release.version} className="release-entry">
                  <div className="release-heading">
                    <h3>v{release.version}</h3>
                    {release.version === latestVersion && (
                      <span className="version">Latest documented</span>
                    )}
                    <span>{release.date}</span>
                  </div>
                  <h4>{release.title}</h4>
                  <p>{release.description}</p>
                  <ul>
                    {features
                      .filter((feature) => feature.since === release.version)
                      .map((feature) => (
                        <li key={feature.name}>
                          <span className="change-kind added">Added</span>
                          <strong>{feature.name}</strong> —{" "}
                          {feature.description}
                        </li>
                      ))}
                    {release.changed.map((change) => (
                      <li key={change}>
                        <span className="change-kind changed">Changed</span>
                        {change}
                      </li>
                    ))}
                  </ul>
                  <div className="release-links">
                    <Link href={`/docs?version=${release.version}`}>
                      Read v{release.version} docs{" "}
                      <ArrowUpRight aria-hidden="true" />
                    </Link>
                    <a href={release.source}>
                      View source <ArrowUpRight aria-hidden="true" />
                    </a>
                  </div>
                </section>
              ))}
            </div>
          </section>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
