import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getEntryCards, getSiteSettings, getVisibleNav } from "@/lib/site";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, navItems] = await Promise.all([getSiteSettings(), getVisibleNav()]);
  // warm entry cards query path for pages that need it (no-op side usage avoided)
  void getEntryCards;

  return (
    <div className="min-h-screen">
      <SiteHeader
        siteName={settings.siteName}
        logo={settings.activeLogo}
        logoAlt={settings.logoAlt}
        navItems={navItems}
        demoMode={settings.demoMode}
      />
      <main>{children}</main>
      <SiteFooter
        siteName={settings.siteName}
        footerText={settings.footerText}
        logo={settings.activeLogo}
        logoAlt={settings.logoAlt}
        contactEmail={settings.contactEmail}
      />
    </div>
  );
}
