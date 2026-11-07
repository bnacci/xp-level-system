"use client";

import { ArrowLeftRight, GitCompareArrows } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { versions, type DocsVersion } from "@/lib/releases";

export function CompareVersions({
  from,
  to,
}: {
  from: DocsVersion;
  to: DocsVersion;
}) {
  const [source, setSource] = useState(from);
  const [target, setTarget] = useState(to);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  useEffect(() => {
    setSource(from);
    setTarget(to);
  }, [from, to]);
  return (
    <form
      className="compare-form"
      noValidate
      aria-busy={pending}
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(() =>
          router.push(`/docs/changelog?from=${source}&to=${target}#comparison`),
        );
      }}
    >
      <div>
        <label htmlFor="compare-from">From</label>
        <Select
          value={source}
          disabled={pending}
          onValueChange={(value) => setSource(value as DocsVersion)}
        >
          <SelectTrigger id="compare-from">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start" sideOffset={4}>
            {versions.map((version) => (
              <SelectItem key={version} value={version}>
                v{version}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <button
        className="swap-versions"
        disabled={pending}
        type="button"
        aria-label="Swap source and target versions"
        onClick={() => {
          setSource(target);
          setTarget(source);
        }}
      >
        <ArrowLeftRight aria-hidden="true" />
      </button>
      <div>
        <label htmlFor="compare-to">To</label>
        <Select
          value={target}
          disabled={pending}
          onValueChange={(value) => setTarget(value as DocsVersion)}
        >
          <SelectTrigger id="compare-to">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start" sideOffset={4}>
            {versions.map((version) => (
              <SelectItem key={version} value={version}>
                v{version}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <button className="button primary" type="submit" disabled={pending}>
        <GitCompareArrows aria-hidden="true" />
        Compare versions
      </button>
      <span className="compare-status" role="status">
        {pending ? "Loading comparison…" : `Showing v${from} → v${to}`}
      </span>
    </form>
  );
}
