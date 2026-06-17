# 论文阅读助手

专为新传考研同学打造的AI辅助论文阅读工具。

## 功能特性

- 📄 **PDF上传** - 支持单篇或批量上传中英文PDF论文
- 🌐 **智能翻译** - 英文论文自动翻译为中文
- 📋 **大纲生成** - AI自动生成论文结构化大纲
- 🧠 **思维导图** - 可视化论文知识结构
- 📚 **案例理论** - 自动提取论文中的案例和理论
- 💬 **AI对话** - 基于论文内容的智能问答
- 📊 **批量分析** - 多篇论文统一知识框架整理

## 技术栈

- **前端**: Next.js 14 + React + TailwindCSS + shadcn/ui
- **后端**: Next.js API Routes
- **数据库**: SQLite + Prisma ORM
- **AI**: OpenAI GPT-4o
- **思维导图**: Markmap

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

编辑 `.env` 文件，添加你的 OpenAI API Key：

```
OPENAI_API_KEY="sk-your-openai-api-key-here"
```

### 3. 初始化数据库

```bash
npx prisma migrate dev
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 开始使用。

## 使用指南

### 上传论文

1. 点击"上传论文"按钮
2. 选择单篇上传或批量上传
3. 拖拽或选择PDF文件
4. 等待上传完成

### 查看论文详情

上传后点击论文卡片进入详情页，可以：

- **原文** - 查看论文原文，英文论文可点击"翻译为中文"
- **大纲** - 点击"生成大纲"获取结构化大纲
- **思维导图** - 点击"生成思维导图"可视化知识结构
- **案例理论** - 点击"提取案例理论"获取引用的案例和理论
- **AI对话** - 输入问题，AI基于论文内容回答

### 批量分析

批量上传的论文可以生成统一的知识框架，找出论文间的共性和差异。

## 部署到 Vercel

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 添加环境变量 `OPENAI_API_KEY`
4. 部署完成

## 项目结构

```
paper-reader/
├── src/
│   ├── app/              # 页面和API路由
│   │   ├── api/          # 后端API
│   │   ├── batch/        # 批量分析页
│   │   ├── paper/        # 论文详情页
│   │   └── upload/       # 上传页
│   ├── components/       # React组件
│   └── lib/              # 工具函数
├── prisma/               # 数据库模型
└── public/               # 静态资源
```

## 许可证

MIT
# PaperLens - deployed
