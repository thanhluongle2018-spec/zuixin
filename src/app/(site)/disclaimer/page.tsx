import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getSiteSettings } from "@/lib/site";
import { formatDateTime } from "@/lib/utils";

export default async function DisclaimerPage() {
  const settings = await getSiteSettings();
  return (
    <div className="container-page section">
      <Card orange>
        <Badge>免责声明</Badge>
        <h1 className="mt-3 font-display text-3xl font-semibold">免责声明</h1>
        <p className="mt-4 whitespace-pre-wrap text-ink-muted">{settings.disclaimer}</p>
        <p className="mt-4 text-xs text-ink-soft">更新于 {formatDateTime(settings.updatedAt)}</p>
      </Card>
    </div>
  );
}
