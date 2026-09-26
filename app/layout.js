import "./globals.css";
import SiteHeader from "@/components/SiteHeader";

export const metadata = {
  title: "PHOENIX'26 — All Island Media Competition",
  description:
    "PHOENIX'26 — the inter-university and inter-school media competition organized by J'pura Flames, the Official Media Grid of the University of Sri Jayewardenepura.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen text-white flex flex-col">
          <SiteHeader />
          <main className="flex-1 w-full">{children}</main>
          <footer className="border-t border-border px-5 py-6 text-center text-muted text-[11px]">
            Organized by <span className="text-flame2 font-semibold">J&apos;pura Flames</span> — Official Media
            Grid, University of Sri Jayewardenepura
            <div className="mt-2">
              <a href="/privacy" className="text-teal hover:underline">
                Privacy Policy
              </a>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
