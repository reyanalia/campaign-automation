"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Plus, X } from "lucide-react";

type Client = { id: string; name: string; company: string };
type Template = { id: string; name: string; platform: string };

export function NewCampaignButton({ clients, templates }: { clients: Client[]; templates: Template[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [platform, setPlatform] = useState("");
  const router = useRouter();

  const filteredTemplates = platform ? templates.filter((t) => t.platform === platform) : templates;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        platform: fd.get("platform"),
        clientId: fd.get("clientId"),
        templateId: fd.get("templateId") || null,
        budget: fd.get("budget") || null,
        startDate: fd.get("startDate") || null,
        status: "draft",
      }),
    });
    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4" /> New Campaign
      </Button>
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">New Campaign</h2>
              <button onClick={() => setOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input name="name" placeholder="Campaign name" required />
              <Select name="clientId" required>
                <option value="">Select client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} — {c.company}</option>
                ))}
              </Select>
              <Select name="platform" required onChange={(e) => setPlatform(e.target.value)}>
                <option value="">Select platform</option>
                <option value="google_ads">Google Ads</option>
                <option value="meta">Meta</option>
                <option value="email">Email</option>
              </Select>
              <Select name="templateId">
                <option value="">From template (optional)</option>
                {filteredTemplates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </Select>
              <Input name="budget" type="number" placeholder="Budget ($)" min="0" step="0.01" />
              <Input name="startDate" type="date" />
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-1" disabled={loading}>{loading ? "Creating..." : "Create"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
