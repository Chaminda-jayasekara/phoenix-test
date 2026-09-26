import Link from "next/link";
import { Card } from "@/components/ui";
import { getCategories } from "@/lib/categories";
import PageShell from "@/components/PageShell";

// Cached for 60 seconds, then refreshed on the next request — avoids
// hitting the database on every single page view under high traffic,
// while staying close enough to real-time for content that rarely
// changes mid-minute (categories, rules, settings).
export const revalidate = 60;
export const metadata = { title: "Categories — PHOENIX'26" };

export default async function CategoriesPage() {
  const categories = (await getCategories()).filter((c) => c.isOpen);

  return (
    <PageShell>
    <div>
      <h1 className="text-[24px] font-extrabold tracking-tight mb-2">Competition Categories</h1>
      <p className="text-muted text-sm mb-6">
        Make sure your school or university has completed institution registration first — you&apos;ll need
        to select it while registering here.
      </p>
      <div className="flex flex-col gap-4">
        {categories.map((c) => (
          <Link key={c.slug} href={`/categories/${c.slug}`}>
            <Card className="hover:border-flame1 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-base">{c.label}</div>
                  <div className="text-muted text-[12.5px] mt-1">{c.description}</div>
                </div>
                <div className="text-flame2 text-xl">→</div>
              </div>
            </Card>
          </Link>
        ))}
        {categories.length === 0 && (
          <Card className="text-center text-muted text-sm">No categories published yet.</Card>
        )}
      </div>
    </div>
  </PageShell>
  );
}
