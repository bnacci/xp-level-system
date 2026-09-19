"use client";

import dynamic from "next/dynamic";

const Dashboard = dynamic(() => import("@/components/Dashboard"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">
      Loading quest board…
    </div>
  ),
});

export default function Page() {
  return <Dashboard />;
}
