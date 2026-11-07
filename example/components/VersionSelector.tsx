"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { GitBranch } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { latestVersion, versions, type DocsVersion } from "@/lib/releases";

export function VersionSelector({ version }: { version: DocsVersion }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <div className="version-picker">
      <label htmlFor="docs-version">
        <GitBranch aria-hidden="true" /> Documentation version
      </label>
      <Select
        value={version}
        disabled={pending}
        onValueChange={(next) => {
          startTransition(() =>
            router.push(`/docs?version=${next}#installation`),
          );
        }}
      >
        <SelectTrigger id="docs-version" aria-describedby="docs-version-status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="start" sideOffset={4}>
          {versions.map((item) => (
            <SelectItem key={item} value={item}>
              v{item}
              {item === latestVersion ? " · Latest" : " · Previous"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span id="docs-version-status" className="version-status" role="status">
        {pending ? "Loading documentation…" : `Viewing v${version}`}
      </span>
    </div>
  );
}
