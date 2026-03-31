# Skill: nextjs-setup

## Metadata
```yaml
plugin_id: nextjs
plugin_version: 1.0.0
core_compatibility: >=1.0.0
```

## Purpose

指导开发者正确配置 Next.js 项目，解决常见配置问题和架构决策。

解决的核心问题：
- App Router vs Pages Router 选择
- Server Components vs Client Components 区分
- 数据获取策略（Server Actions, Route Handlers）
- Middleware 配置
- 图片优化配置
- 环境变量管理

## When to Use

必须使用时：
- 新建 Next.js 项目
- 配置 App Router 结构
- 实现 Server Components
- 配置 Middleware
- 设置数据获取策略

推荐使用时：
- 项目初始化阶段
- 遇到 Next.js 配置错误
- 需要性能优化建议

## When Not to Use

不适用场景：
- 纯静态站点（不需要 SSR）
- 非 Next.js React 项目（使用 vite-react-ts plugin）
- 纯后端 API 项目（使用 python-fastapi 或其他后端 plugin）

## Implementation Process

### Step 1: 确定路由模式

Next.js 13+ 提供两种路由模式：

| 模式 | 目录 | 适用场景 |
|------|------|----------|
| App Router | `app/` | 新项目，需要 Server Components |
| Pages Router | `pages/` | 旧项目迁移，简单需求 |

**推荐**: 新项目使用 App Router。

### Step 2: App Router 目录结构

```
app/
├── layout.tsx          # 根布局（必需）
├── page.tsx            # 首页
├── loading.tsx         # 加载状态
├── error.tsx           # 错误处理
├── not-found.tsx       # 404 页面
├── globals.css         # 全局样式
│
├── (auth)/             # 路由组（不影响 URL）
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
│
├── dashboard/          # 嵌套路由
│   ├── layout.tsx
│   ├── page.tsx
│   └── settings/
│       └── page.tsx
│
└── api/                # API Routes
    └── users/
        └── route.ts
```

### Step 3: Server Components vs Client Components

**Server Components** (默认):
```tsx
// app/dashboard/page.tsx
// 默认是 Server Component，可以直接访问数据库
async function DashboardPage() {
  const users = await db.user.findMany();  // 直接数据库操作
  
  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}

export default DashboardPage;
```

**Client Components** (需要交互时):
```tsx
// app/components/Counter.tsx
'use client';  // 必须声明

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

**规则**:
- 默认使用 Server Components
- 需要 useState, useEffect, 事件处理时使用 Client Components
- 'use client' 指令放在文件顶部

### Step 4: 数据获取策略

| 方法 | 适用场景 | 特点 |
|------|----------|------|
| Server Components | 页面初始数据 | 自动缓存，SEO 友好 |
| Server Actions | 表单提交、数据变更 | 类型安全，自动重新验证 |
| Route Handlers | REST API | 灵活，支持所有 HTTP 方法 |
| SWR/React Query | 客户端数据 | 实时更新，轮询 |

**Server Actions 示例**:
```tsx
// app/actions/users.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function createUser(formData: FormData) {
  const name = formData.get('name') as string;
  
  await db.user.create({
    data: { name }
  });
  
  revalidatePath('/users');  // 自动刷新缓存
}
```

### Step 5: Middleware 配置

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 认证检查
  const token = request.cookies.get('token');
  
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

// 配置匹配路径
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/admin/:path*',
  ],
};
```

### Step 6: next.config.mjs 配置

```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 图片优化
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
      },
    ],
  },
  
  // 实验性功能
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // 环境变量
  env: {
    NEXT_PUBLIC_API_URL: process.env.API_URL,
  },
};

export default nextConfig;
```

## Output Requirements

配置完成后应输出：

```yaml
setup_summary:
  status: success | partial | failed
  
  router_mode: app | pages
  
  structure_created:
    - path: string
      purpose: string
      
  configuration_issues_resolved:
    - issue: string
      resolution: string
      
  recommendations:
    - recommendation: string
      priority: high | medium | low
```

## Examples

### 示例 1：新建 Next.js 项目配置

**问题**: 开发者创建 Next.js 项目，不确定使用哪种路由模式。

**解决**:
1. 评估项目需求
2. 推荐 App Router（新项目）
3. 创建标准目录结构
4. 配置 TypeScript 和 ESLint

### 示例 2：Server Component 数据获取

**问题**: 需要在页面中显示数据库数据。

**解决**:
```tsx
// app/users/page.tsx
async function UsersPage() {
  const users = await fetch('https://api.example.com/users', {
    cache: 'no-store',  // 禁用缓存，每次请求最新数据
  }).then(res => res.json());
  
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### 示例 3：Middleware 认证

**问题**: 需要保护特定路由，只有登录用户可访问。

**解决**: 见 Step 5 Middleware 配置示例。

## Checklists

### 项目初始化检查
- [ ] 确定路由模式（App Router 推荐）
- [ ] 创建标准目录结构
- [ ] 配置 TypeScript
- [ ] 设置 ESLint 和 Prettier

### App Router 检查
- [ ] layout.tsx 根布局存在
- [ ] page.tsx 首页存在
- [ ] 正确区分 Server/Client Components
- [ ] Server Actions 正确配置

### 性能优化检查
- [ ] 图片使用 next/image
- [ ] 字体使用 next/font
- [ ] 合理使用缓存策略
- [ ] 代码分割和懒加载

## Common Failure Modes

| 失败模式 | 表现 | 处理建议 |
|----------|------|----------|
| 'use client' 缺失 | useState 报错 | 添加 'use client' 指令 |
| 水合错误 | HTML 不匹配 | 检查客户端/服务端数据一致性 |
| Middleware 无限循环 | 重定向循环 | 检查 matcher 配置 |
| 图片加载失败 | 403 Forbidden | 配置 images.remotePatterns |

## Notes

### 与其他 plugin 的关系
- nextjs-setup 是技术栈特定配置 skill
- 与 developer/feature-implementation 配合使用
- React 相关测试使用 vite-react-ts 的 css-module-test

### Next.js 14+ 新特性
- Server Actions 稳定
- Partial Prerendering (实验性)
- Improved Metadata API