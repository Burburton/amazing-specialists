# Skill: vue-setup

## Metadata
```yaml
plugin_id: vue-vite
plugin_version: 1.0.0
core_compatibility: >=1.0.0
```

## Purpose

指导开发者正确配置 Vue 3 + Vite + TypeScript 项目，解决常见配置问题。

解决的核心问题：
- Composition API 使用模式
- Pinia 状态管理配置
- Vue Router 路由配置
- TypeScript 类型支持
- 组件测试配置

## When to Use

必须使用时：
- 新建 Vue 3 + Vite 项目
- 配置 Pinia 状态管理
- 配置 Vue Router
- 解决 Vue + TypeScript 配置错误

推荐使用时：
- 项目初始化阶段
- 遇到 Vue 配置问题
- 添加状态管理或路由

## When Not to Use

不适用场景：
- Vue 2 项目（使用 Options API）
- 非 Vue 前端项目
- Nuxt.js 项目（使用 nextjs 或单独 plugin）

## Implementation Process

### Step 1: 项目结构

```
src/
├── main.ts              # 入口文件
├── App.vue              # 根组件
├── vite-env.d.ts        # 类型声明
│
├── components/          # 组件目录
│   └── HelloWorld.vue
│
├── views/               # 页面视图
│   └── HomeView.vue
│
├── router/              # 路由配置
│   └── index.ts
│
├── stores/              # Pinia 状态
│   └── counter.ts
│
├── composables/         # 组合式函数
│   └── useCounter.ts
│
└── types/               # 类型定义
    └── index.ts
```

### Step 2: Composition API 模式

**推荐**: 使用 `<script setup>` 语法：

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useCounterStore } from '@/stores/counter';

// Props 定义
const props = defineProps<{
  title: string;
  count?: number;
}>();

// Emits 定义
const emit = defineEmits<{
  (e: 'update', value: number): void;
}>();

// 响应式状态
const localCount = ref(props.count ?? 0);

// 计算属性
const doubled = computed(() => localCount.value * 2);

// 方法
function increment() {
  localCount.value++;
  emit('update', localCount.value);
}

// 生命周期
onMounted(() => {
  console.log('Component mounted');
});

// 使用 Pinia store
const counterStore = useCounterStore();
</script>

<template>
  <div>
    <h1>{{ props.title }}</h1>
    <p>Count: {{ localCount }}</p>
    <p>Doubled: {{ doubled }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>

<style scoped>
h1 {
  color: #42b883;
}
</style>
```

### Step 3: Pinia 状态管理

```typescript
// stores/counter.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCounterStore = defineStore('counter', () => {
  // State
  const count = ref(0);

  // Getters
  const doubled = computed(() => count.value * 2);

  // Actions
  function increment() {
    count.value++;
  }

  function decrement() {
    count.value--;
  }

  async function fetchCount() {
    const response = await fetch('/api/count');
    count.value = await response.json();
  }

  return {
    count,
    doubled,
    increment,
    decrement,
    fetchCount,
  };
});
```

### Step 4: Vue Router 配置

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // 路由懒加载
      component: () => import('@/views/AboutView.vue'),
    },
    {
      path: '/user/:id',
      name: 'user',
      component: () => import('@/views/UserView.vue'),
      props: true, // 将路由参数作为 props 传递
    },
  ],
});

// 路由守卫
router.beforeEach((to, from, next) => {
  // 认证检查
  // const isAuthenticated = checkAuth();
  // if (to.meta.requiresAuth && !isAuthenticated) {
  //   next('/login');
  // } else {
  //   next();
  // }
  next();
});

export default router;
```

### Step 5: vite.config.ts 配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [vue()],
  
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  
  build: {
    // 生产构建优化
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue', 'vue-router', 'pinia'],
        },
      },
    },
  },
});
```

### Step 6: TypeScript 配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2023",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
  "exclude": ["node_modules"]
}
```

## Output Requirements

```yaml
setup_summary:
  status: success | partial | failed
  
  files_created:
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

### 示例 1：组件 Props 类型定义

**问题**: Props 类型定义不清晰。

**解决**:
```vue
<script setup lang="ts">
// 使用 TypeScript 泛型定义 props
interface Props {
  title: string;
  count?: number;
  items: Array<{ id: number; name: string }>;
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
});
</script>
```

### 示例 2：Composable 封装

**问题**: 需要复用组件逻辑。

**解决**:
```typescript
// composables/useCounter.ts
import { ref, computed } from 'vue';

export function useCounter(initialValue = 0) {
  const count = ref(initialValue);
  const doubled = computed(() => count.value * 2);
  
  function increment() {
    count.value++;
  }
  
  function reset() {
    count.value = initialValue;
  }
  
  return {
    count,
    doubled,
    increment,
    reset,
  };
}
```

## Checklists

### 项目初始化
- [ ] 确认使用 Vue 3 + Composition API
- [ ] 配置 TypeScript 支持
- [ ] 配置路径别名 (@/)
- [ ] 配置 ESLint + Prettier

### 功能实现
- [ ] 使用 `<script setup>` 语法
- [ ] 正确定义 Props 和 Emits 类型
- [ ] 使用 Pinia 管理状态
- [ ] 配置 Vue Router

### 测试配置
- [ ] 配置 Vitest
- [ ] 配置 @vue/test-utils
- [ ] 编写组件测试

## Common Failure Modes

| 失败模式 | 表现 | 处理建议 |
|----------|------|----------|
| Props 类型错误 | TypeScript 报错 | 使用 `defineProps<T>()` 泛型 |
| 路径别名不工作 | 模块找不到 | 检查 tsconfig.json 和 vite.config.ts |
| 组件未注册 | Unknown component | 使用 `<script setup>` 自动注册 |
| 状态不同步 | Pinia 更新失败 | 检查 store 实例是否正确 |

## Notes

### 与其他 plugin 的关系
- vue-setup 是技术栈特定配置 skill
- 与 developer/feature-implementation 配合使用
- 测试相关使用 tester/unit-test-design