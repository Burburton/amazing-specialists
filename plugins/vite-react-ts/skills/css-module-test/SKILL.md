# Skill: css-module-test

## Metadata
```yaml
plugin_id: vite-react-ts
plugin_version: 1.0.0
core_compatibility: >=1.0.0
```

## Purpose

指导 tester 测试使用 CSS Modules 的 React 组件，解决 CSS 导入和 className 验证问题。

解决的核心问题：
- CSS 导入在测试中报错
- className 验证方法不当
- 测试环境未正确配置 CSS Modules
- 样式测试策略不清晰

## When to Use

必须使用时：
- 测试使用 CSS Modules (.module.css) 的组件
- 需要验证 className 应用是否正确
- 需要验证样式条件逻辑

推荐使用时：
- 编写组件样式测试
- 验证响应式样式类
- 测试主题切换逻辑

## When Not to Use

不适用场景：
- 纯逻辑组件（无样式）
- 使用 inline styles 的组件
- 使用 CSS-in-JS 的组件
- 非 CSS Module 样式

## Implementation Process

### Step 1: 配置测试环境

确保 Vitest 正确处理 CSS Module 导入：

```typescript
// vite.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',  // DOM 环境用于组件测试
    globals: true,
    // CSS Modules 自动处理
  },
})
```

### Step 2: CSS Module 类型声明

在 `vite-env.d.ts` 添加声明：

```typescript
declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}
```

### Step 3: 基础测试模式

```typescript
import { render, screen } from '@testing-library/react'
import Component from './Component'
import styles from './Component.module.css'

describe('Component', () => {
  it('applies correct className', () => {
    render(<Component />)
    
    const element = screen.getByRole('div')
    expect(element.className).toContain(styles.primary)
  })
})
```

### Step 4: 条件样式测试

```typescript
describe('Component conditional styles', () => {
  it('applies active class when active', () => {
    render(<Component active={true} />)
    
    const element = screen.getByRole('button')
    expect(element.className).toContain(styles.active)
  })
  
  it('does not apply active class when inactive', () => {
    render(<Component active={false} />)
    
    const element = screen.getByRole('button')
    expect(element.className).not.toContain(styles.active)
  })
})
```

### Step 5: 多类名测试

```typescript
describe('Component multiple classes', () => {
  it('applies base and variant classes', () => {
    render(<Component variant="primary" />)
    
    const element = screen.getByTestId('component')
    const classNames = element.className.split(' ')
    
    expect(classNames).toContain(styles.base)
    expect(classNames).toContain(styles.primary)
  })
})
```

### Step 6: 响应式样式验证

```typescript
describe('Responsive styles', () => {
  it('applies mobile class on small viewport', () => {
    // Mock viewport
    window.innerWidth = 320
    render(<Component />)
    
    const element = screen.getByTestId('component')
    expect(element.className).toContain(styles.mobile)
  })
})
```

## Output Requirements

```yaml
test_summary:
  component: string
  styles_file: string
  
  test_cases:
    - id: string
      description: string
      class_verified: string
      result: pass | fail
      
  coverage:
    classes_tested: string[]
    classes_not_tested: string[]
    
  issues:
    - issue: string
      severity: low | medium | high
```

## Examples

### 示例 1：基础 CSS Module 测试

```typescript
// Button.module.css
.primary { background: blue; }
.secondary { background: gray; }

// Button.test.ts
import { render, screen } from '@testing-library/react'
import Button from './Button'
import styles from './Button.module.css'

describe('Button styles', () => {
  it('applies primary class', () => {
    render(<Button variant="primary">Click</Button>)
    
    const button = screen.getByRole('button')
    expect(button.className).toContain(styles.primary)
  })
  
  it('applies secondary class', () => {
    render(<Button variant="secondary">Click</Button>)
    
    const button = screen.getByRole('button')
    expect(button.className).toContain(styles.secondary)
  })
})
```

### 示例 2：动态 className 测试

```typescript
// Layout.module.css
.container { display: flex; }
.collapsed { width: 200px; }
.expanded { width: 400px; }

// Layout.test.ts
import { render, screen } from '@testing-library/react'
import Layout from './Layout'
import styles from './Layout.module.css'

describe('Layout responsive', () => {
  it('applies collapsed class when sidebar hidden', () => {
    render(<Layout sidebarVisible={false} />)
    
    const container = screen.getByTestId('layout')
    expect(container.className).toContain(styles.container)
    expect(container.className).toContain(styles.collapsed)
  })
  
  it('applies expanded class when sidebar visible', () => {
    render(<Layout sidebarVisible={true} />)
    
    const container = screen.getByTestId('layout')
    expect(container.className).toContain(styles.expanded)
  })
})
```

## Checklists

### 测试准备
- [ ] 确认 CSS Module 文件命名正确 (.module.css)
- [ ] 确认 vite-env.d.ts 有 CSS Module 声明
- [ ] 确认测试环境配置正确 (jsdom/node)

### 测试编写
- [ ] 导入 styles 对象正确
- [ ] 使用 styles.className 而非硬编码字符串
- [ ] 验证 className 包含而非精确匹配
- [ ] 测试条件样式逻辑

### 测试验证
- [ ] 所有测试通过
- [ ] 无 TypeScript 错误
- [ ] CSS 类名正确验证

## Common Failure Modes

| 失败模式 | 表现 | 处理建议 |
|----------|------|----------|
| CSS 导入报错 | Cannot find module | 添加 vite-env.d.ts 声明 |
| className 硬编码 | 测试脆弱 | 使用 styles.className |
| 环境配置错误 | CSS 未处理 | 设置 jsdom 环境 |
| 精确匹配失败 | 多类名导致失败 | 使用toContain而非toBe |

## Notes

### 最佳实践
1. **使用 styles 对象**: 不要硬编码类名字符串
2. **使用toContain**: 类名可能多个，用包含检查
3. **分离测试环境**: 组件测试用 jsdom，逻辑测试用 node

### 与 unit-test-design 的关系
- css-module-test 是技术栈特定测试模式
- 配合 tester/unit-test-design 使用
- 提供组件样式测试的具体指导