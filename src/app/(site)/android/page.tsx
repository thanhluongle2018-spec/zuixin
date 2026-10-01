import { TutorialReader } from "@/components/site/TutorialReader";
import { EmptyState } from "@/components/ui/EmptyState";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";

export default async function AndroidGuidePage() {
  const tutorial = await prisma.tutorial.findFirst({
    where: { platform: "android", status: "PUBLISHED" },
    include: {
      steps: { orderBy: { order: "asc" } },
      faqs: { orderBy: { order: "asc" } },
    },
    orderBy: { order: "asc" },
  });

  if (!tutorial) {
    return (
      <div className="container-page section">
        <EmptyState title="暂无已发布的安卓指南" description="请稍后再来，或联系管理员发布内容。" />
      </div>
    );
  }

  return (
    <div className="container-page section">
      <TutorialReader
        title={tutorial.title}
        summary={tutorial.summary}
        readingMinutes={tutorial.readingMinutes}
        updatedAt={formatDateTime(tutorial.updatedAt)}
        steps={tutorial.steps}
        faqs={tutorial.faqs}
      />
    </div>
  );
}
