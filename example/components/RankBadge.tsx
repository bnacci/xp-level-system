import type { RankInfo } from "xp-level-system";

export function RankBadge({ rank }: { rank: RankInfo | null }) {
  if (!rank) return null;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold"
      style={{
        borderColor: `${rank.color ?? "#9aa3c2"}55`,
        color: rank.color ?? "#9aa3c2",
        background: `${rank.color ?? "#9aa3c2"}14`,
      }}
    >
      <span>{rank.icon}</span>
      <span>{rank.name}</span>
    </span>
  );
}
