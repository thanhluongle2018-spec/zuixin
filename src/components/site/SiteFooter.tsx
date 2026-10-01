import Link from "next/link";

export function SiteFooter({
  siteName,
  footerText,
  logo,
  logoAlt,
  contactEmail,
}: {
  siteName: string;
  footerText: string;
  logo: { path: string; altText: string } | null;
  logoAlt: string;
  contactEmail?: string | null;
}) {
  return (
    <footer className="mt-10 border-t border-border bg-white/70">
      <div className="container-page grid gap-8 py-10 md:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="mb-3 flex items-center gap-3">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logo.path}
                alt={logo.altText || logoAlt}
                width={40}
                height={40}
                className="h-10 w-10 rounded-xl object-contain"
              />
            ) : null}
            <div className="font-display text-lg font-semibold">{siteName}</div>
          </div>
          <p className="max-w-xl text-sm text-ink-muted">{footerText}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="font-semibold text-ink">指南</div>
            <Link className="block text-ink-muted hover:text-brand-strong" href="/ios">
              苹果手机
            </Link>
            <Link className="block text-ink-muted hover:text-brand-strong" href="/android">
              安卓手机
            </Link>
            <Link className="block text-ink-muted hover:text-brand-strong" href="/services">
              服务与价格
            </Link>
          </div>
          <div className="space-y-2">
            <div className="font-semibold text-ink">说明</div>
            <Link className="block text-ink-muted hover:text-brand-strong" href="/faq">
              常见问题
            </Link>
            <Link className="block text-ink-muted hover:text-brand-strong" href="/privacy">
              隐私说明
            </Link>
            <Link className="block text-ink-muted hover:text-brand-strong" href="/terms">
              服务条款
            </Link>
            <Link className="block text-ink-muted hover:text-brand-strong" href="/disclaimer">
              免责声明
            </Link>
            {contactEmail ? (
              <a className="block text-ink-muted hover:text-brand-strong" href={`mailto:${contactEmail}`}>
                {contactEmail}
              </a>
            ) : null}
          </div>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-ink-soft">
        © {new Date().getFullYear()} {siteName}
      </div>
    </footer>
  );
}
