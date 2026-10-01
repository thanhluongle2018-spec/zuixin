import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";

export default async function AdminAuditPage() {
  const logs = await prisma.auditLog.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">审计日志</h1>
        <p className="text-sm text-ink-muted">记录内容、Logo、价格与付款设置等重要变更</p>
      </div>

      <Card>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>时间</th>
                <th>操作人</th>
                <th>动作</th>
                <th>对象</th>
                <th>详情</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{formatDateTime(log.createdAt)}</td>
                  <td>{log.user?.name || "系统"}</td>
                  <td>
                    <Badge>{log.action}</Badge>
                  </td>
                  <td>
                    {log.entity}
                    {log.entityId ? ` #${log.entityId.slice(0, 8)}` : ""}
                  </td>
                  <td className="text-sm text-ink-muted">{log.detail || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
