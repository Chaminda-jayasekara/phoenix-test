import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategoryBySlug } from "@/lib/categories";
import RulesEmbed from "@/components/RulesEmbed";
import PageShell from "@/components/PageShell";

// Cached for 60 seconds, then refreshed on the next request — avoids
// hitting the database on every single page view under high traffic,
// while staying close enough to real-time for content that rarely
// changes mid-minute (categories, rules, settings).
export const revalidate = 60;

export async function generateMetadata({ params }) {
  const category = await getCategoryBySlug(params.slug);
  return { title: category ? `${category.label} — PHOENIX'26` : "PHOENIX'26" };
}

export default async function CategoryPage({ params }) {
  const category = await getCategoryBySlug(params.slug);
  if (!category) notFound();

  return (
    <PageShell>
    <div>
      <h1 className="text-xl font-extrabold mb-1">{category.label}</h1>
      <p className="text-muted text-[12.5px] mb-6">{category.description}</p>

      <div className="text-[12.5px] text-muted mb-3 font-semibold">Rules & Regulations</div>
      <RulesEmbed videoUrl={category.rulesVideoUrl} pdfUrl={category.rulesPdfUrl} />

      <div className="mt-8">
        {category.isOpen ? (
          <Link href={`/categories/${category.slug}/register`}>
            <button className="w-full bg-ember text-ink font-bold py-3 rounded-xl text-sm">
              Register Now →
            </button>
          </Link>
        ) : (
          <div className="text-center text-muted text-[12.5px] border border-border rounded-xl py-3">
            Registration for this category is currently closed.
          </div>
        )}
      </div>

      <div className="mt-4 text-center">
        <Link href="/categories" className="text-muted text-[12.5px]">
          ← All categories
        </Link>
      </div>
    </div>
  </PageShell>
  );
}
