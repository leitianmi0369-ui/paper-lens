# PaperLens 部署指南

## 部署到 Vercel

### 第一步：准备代码

```bash
# 1. 进入项目目录
cd /Users/emily/paper-reader

# 2. 初始化 Git 仓库
git init
git add .
git commit -m "Initial commit"
```

### 第二步：推送到 GitHub

1. 访问 https://github.com/new 创建新仓库
2. 仓库名填 `paper-lens`
3. 不要勾选 "Initialize this repository"
4. 创建后执行：

```bash
git remote add origin https://github.com/你的用户名/paper-lens.git
git branch -M main
git push -u origin main
```

### 第三步：在 Vercel 部署

1. 访问 https://vercel.com
2. 用 GitHub 账号登录
3. 点击 "New Project"
4. 选择 `paper-lens` 仓库
5. 点击 "Import"

### 第四步：配置环境变量

在 Vercel 项目设置中添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DASHSCOPE_API_KEY` | `sk-ws-H.RPMDHYX.m5hm...` | 通义千问 API Key |

### 第五步：创建 Vercel Postgres 数据库

1. 在 Vercel 项目页面，点击 "Storage" 标签
2. 点击 "Create Database"
3. 选择 "Postgres"
4. 选择区域（建议 Singapore 或 Hong Kong）
5. 点击 "Create"
6. 创建后会自动添加 `POSTGRES_PRISMA_URL` 等环境变量

### 第六步：重新部署

1. 回到项目首页
2. 点击 "Deployments" 标签
3. 点击最新部署右侧的 "..." 菜单
4. 选择 "Redeploy"
5. 等待部署完成

### 第七步：初始化数据库

部署完成后，数据库表会自动创建。如果没有，可以：

1. 在 Vercel 项目设置中找到 "Environment Variables"
2. 复制 `POSTGRES_PRISMA_URL` 的值
3. 在本地运行：

```bash
DATABASE_URL="复制的URL" npx prisma db push
```

## 部署完成！

访问 Vercel 提供的域名（如 `paper-lens.vercel.app`）即可使用。

## 注意事项

1. **文件存储**：PDF 文件以 base64 形式存储在数据库中，适合小型论文
2. **API 限制**：通义千问 API 有调用频率限制
3. **免费额度**：Vercel 免费版每月有 100GB 带宽限制

## 自定义域名（可选）

1. 在 Vercel 项目设置中点击 "Domains"
2. 输入你的域名
3. 按提示配置 DNS
