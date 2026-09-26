import RegistrationForm from "@/components/RegistrationForm";
import ClosedNotice from "@/components/ClosedNotice";
import PageShell from "@/components/PageShell";
import { getSiteSettings } from "@/lib/categories";

// Cached for 60 seconds, then refreshed on the next request — avoids
// hitting the database on every single page view under high traffic,
// while staying close enough to real-time for content that rarely
// changes mid-minute (categories, rules, settings).
export const revalidate = 60;
export const metadata = { title: "School Registration — Phoenix" };

export default async function SchoolRegisterPage() {
  const settings = await getSiteSettings();
  if (settings?.school_registration_open === false) {
    return (
      <PageShell>
        <ClosedNotice
          title="School registration is closed"
          message="School registration isn't open right now. Check back later, or contact the Phoenix'26 team."
        />
      </PageShell>
    );
  }
  return (
    <PageShell>
      <RegistrationForm type="school" whatsappLink={settings?.school_whatsapp_link || null} />
    </PageShell>
  );
}
