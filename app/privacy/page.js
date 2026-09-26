import PageShell from "@/components/PageShell";

export const metadata = { title: "Privacy Policy — PHOENIX'26" };

export default function PrivacyPage() {
  return (
    <PageShell>
      <h1 className="text-xl font-extrabold mb-1">Privacy Policy</h1>
      <p className="text-muted text-[12.5px] mb-6">Last updated for PHOENIX&apos;26</p>

      <div className="flex flex-col gap-5 text-sm text-muted leading-relaxed">
        <div>
          <div className="font-bold text-white mb-1">What we collect</div>
          <p>
            When you register a school or university, we collect the institution&apos;s name, address, contact
            details, and the name, contact number, and email of its MIC, President, and Secretary. When you
            register as a contestant, we collect your name, contact number, email, age category, institution,
            and (where applicable) a link to your submission.
          </p>
        </div>
        <div>
          <div className="font-bold text-white mb-1">Why we collect it</div>
          <p>
            This information is used only to run PHOENIX&apos;26 — confirming registrations, organizing
            competition categories, contacting participants about schedules or results, and coordinating
            WhatsApp groups for each institution and category.
          </p>
        </div>
        <div>
          <div className="font-bold text-white mb-1">Who can see it</div>
          <p>
            Only the PHOENIX&apos;26 organizing team (J&apos;pura Flames) has access to this information, through
            a password-protected admin dashboard. It is never sold, published, or shared with third parties
            outside the organizing team.
          </p>
        </div>
        <div>
          <div className="font-bold text-white mb-1">How long we keep it</div>
          <p>
            Registration data is kept for the duration of the competition and a reasonable period afterward for
            record-keeping, then deleted.
          </p>
        </div>
        <div>
          <div className="font-bold text-white mb-1">Contact</div>
          <p>
            If you have questions about your data, or wish to have it corrected or removed, contact the
            PHOENIX&apos;26 organizing team through the official J&apos;pura Flames channels.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
