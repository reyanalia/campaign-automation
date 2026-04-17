"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Plus, X } from "lucide-react";

type Client = { id: string; name: string; company: string };

export function NewAlertButton({ clients }: { clients: Client[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    await fetch("/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(fd)),
    });
    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4" /> Add Alert Rule
      </Button>
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">New Alert Rule</h2>
              <button onClick={() => setOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input name="name" placeholder="Rule name (e.g. Low CTR Alert)" required />
              <Select name="clientId" required>
                <option value="">Select client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} — {c.company}</option>
                ))}
              </Select>
              <Select name="platform" required>
                <option value="">Platform</option>
                <option value="google_ads">Google Ads</option>
                <option value="meta">Meta</option>
                <option value="email">Email</option>
                <option value="all">All platforms</option>
              </Select>
              <Select name="metric" required>
                <option value="">Metric</option>
                <option value="ctr">CTR (%)</option>
                <option value="cpc">CPC ($)</option>
                <option value="spend">Daily Spend ($)</option>
                <option value="impressions">Impressions</option>
                <option value="clicks">Clicks</option>
                <option value="open_rate">Email Open Rate (%)</option>
              </Select>
              <div className="flex gap-2">
                <Select name="operator" required>
                  <option value="lt">Less than (&lt;)</option>
                  <option value="gt">Greater than (&gt;)</option>
                  <option value="lte">Less than or equal (≤)</option>
                  <option value="gte">Greater than or equal (≥)</option>
                </Select>
                <Input name="threshold" type="number" placeholder="Threshold" step="0.01" required />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-1" disabled={loading}>{loading ? "Saving..." : "Save Rule"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
