"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";

export function NewTemplateButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const vars = (fd.get("variables") as string).split(",").map((v) => v.trim()).filter(Boolean);
    const tags = (fd.get("tags") as string).split(",").map((t) => t.trim()).filter(Boolean);
    await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        description: fd.get("description"),
        platform: fd.get("platform"),
        category: fd.get("category"),
        variables: vars,
        tags,
        content: { description: fd.get("description") },
      }),
    });
    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4" /> New Template
      </Button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Create Template</h2>
              <button onClick={() => setOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input name="name" placeholder="Template name" required />
              <Textarea name="description" placeholder="Description (optional)" rows={2} />
              <Select name="platform" required>
                <option value="">Select platform</option>
                <option value="google_ads">Google Ads</option>
                <option value="meta">Meta</option>
                <option value="email">Email</option>
              </Select>
              <Select name="category">
                <option value="">Category (optional)</option>
                <option value="awareness">Awareness</option>
                <option value="conversion">Conversion</option>
                <option value="retargeting">Retargeting</option>
                <option value="nurture">Nurture</option>
              </Select>
              <Input name="variables" placeholder="Variables: client_name, budget, landing_url" />
              <Input name="tags" placeholder="Tags: lead-gen, search (comma separated)" />
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
