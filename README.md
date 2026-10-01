# 新手指南站

面向不熟悉手机应用安装与账号注册的新手中文网站，含响应式前台与可视化管理后台。

## 技术栈

- Next.js 15（App Router）+ TypeScript
- Tailwind CSS 4（橙色卡片设计系统）
- Prisma + SQLite
- Jose Session Cookie + bcrypt 密码哈希

## 本地启动

```bash
cp .env.example .env
# 编辑 .env：设置 SESSION_SECRET（≥32 字符）
# 以及 BOOTSTRAP_ADMIN_EMAIL / BOOTSTRAP_ADMIN_PASSWORD（≥12 位）

npm install
npm run db:setup
npm run dev
```

- 前台：http://localhost:3000
- 后台：http://localhost:3000/admin/login

## 创建首个管理员

**不要**在代码中硬编码管理员密码。通过环境变量在 seed 时创建：

1. 在 `.env` 中设置：
   - `BOOTSTRAP_ADMIN_EMAIL`
   - `BOOTSTRAP_ADMIN_PASSWORD`（至少 12 位）
   - `BOOTSTRAP_ADMIN_NAME`（可选）
2. 运行 `npm run db:seed`
3. 使用该邮箱密码登录 `/admin/login`
4. 之后可在「账号与审计」中创建编辑者/其他管理员

## 数据保存方式

- SQLite 文件：`prisma/dev.db`（由 `DATABASE_URL` 指定）
- 站点设置、Logo、教程、服务、价格、订单、付款方式、审计日志均存数据库
- 上传 Logo 存于 `public/uploads/logos/`，前台统一从 `SiteSettings.activeLogo` 读取

## 主要页面

| 路径 | 说明 |
|------|------|
| `/` | 首页：苹果/安卓入口、教程与价格概览 |
| `/ios` `/android` | 平台指南（步骤、目录、FAQ） |
| `/services` | 服务与价格 |
| `/orders` | 订单说明 + 演示下单/模拟付款 |
| `/demo/sms` | 接码演示 |
| `/faq` `/privacy` `/terms` `/disclaimer` | 说明页 |
| `/admin/*` | 管理后台 |

## 接入真实支付 / 接码前还需要

**支付**

- 支付服务商名称与官方文档
- `PAYMENT_PROVIDER` / `PAYMENT_API_KEY` / `PAYMENT_WEBHOOK_SECRET`
- 服务端下单接口与**回调验签**实现

**接码**

- 服务商授权与正式 API 文档、服务条款
- `SMS_PROVIDER_API_URL` / `SMS_PROVIDER_API_KEY`
- 在 `src/lib/sms/provider.ts` 完成 live 适配（当前强制 demo）

未完成前，界面将明确显示演示模式。
