# 最小可运行示例

本文档展示一个最小化的 feature 开发流程，帮助快速理解 OpenCode 专家包的工作方式。

## 场景

实现一个简单的 "Hello World" API 端点。

---

## 步骤 1: 启动 Feature

```bash
/spec-start hello-world-api
```

**输出**: `specs/hello-world-api/spec.md`

```yaml
# spec.md (示例)
Feature ID: hello-world-api
Goal: 实现一个返回 "Hello World" 的 API 端点

Acceptance Criteria:
  - AC-001: GET /api/hello 返回 200
  - AC-002: 响应体为 {"message": "Hello World"}
  - AC-003: 响应时间 < 100ms

Scope:
  - 新增 /api/hello 端点
  - 不涉及数据库
  - 不涉及认证

Out of Scope:
  - 国际化
  - 配置化消息
```

---

## 步骤 2: 生成实现计划

```bash
/spec-plan 012-hello-world-api
```

**输出**: `specs/012-hello-world-api/plan.md`

```yaml
# plan.md
Implementation Strategy: 单文件实现

Phases:
  - Phase 1: 创建 HelloController
  - Phase 2: 添加单元测试
  - Phase 3: 文档更新

Tasks:
  - T-1.1: 实现 HelloController.hello()
  - T-2.1: 编写单元测试
  - T-3.1: 更新 README.md
```

---

## 步骤 3: 生成任务列表

```bash
/spec-tasks 012-hello-world-api
```

**输出**: `specs/012-hello-world-api/tasks.md`

| Task ID | 描述 | 角色 | 状态 |
|---------|------|------|------|
| T-1.1 | 实现 HelloController | developer | PENDING |
| T-2.1 | 编写单元测试 | tester | PENDING |
| T-3.1 | 更新文档 | docs | PENDING |

---

## 步骤 4: 实现功能

```bash
/spec-implement 012-hello-world-api
```

### developer 执行 (T-1.1)

**输入**: plan.md, tasks.md

**处理**:
1. 读取 spec，理解需求
2. 创建 `src/controllers/HelloController.ts`
3. 实现 `hello()` 方法
4. 自检代码

**输出代码**:
```typescript
// src/controllers/HelloController.ts
import { Controller, Get } from '@nestjs/common';

@Controller('api')
export class HelloController {
  @Get('hello')
  hello() {
    return { message: 'Hello World' };
  }
}
```

**Execution Result**:
```yaml
status: SUCCESS
changed_files:
  - src/controllers/HelloController.ts
recommendation: SEND_TO_TEST
```

---

### tester 执行 (T-2.1)

**输入**: HelloController.ts, spec.md

**处理**:
1. 设计测试用例
2. 编写单元测试
3. 运行测试

**输出代码**:
```typescript
// src/controllers/HelloController.spec.ts
import { HelloController } from './HelloController';

describe('HelloController', () => {
  let controller: HelloController;

  beforeEach(() => {
    controller = new HelloController();
  });

  it('should return "Hello World"', () => {
    const result = controller.hello();
    expect(result).toEqual({ message: 'Hello World' });
  });

  it('should return 200 status', async () => {
    // Integration test with supertest
    const response = await request(app).get('/api/hello');
    expect(response.status).toBe(200);
  });
});
```

**Test Report**:
```yaml
tests_run: 2
tests_passed: 2
coverage: 100%
recommendation: SEND_TO_REVIEW
```

---

### reviewer 执行

**输入**: code diff, test report, spec.md

**处理**:
1. 检查代码实现是否符合 spec
2. 检查测试覆盖度
3. 检查代码质量

**Review Report**:
```yaml
status: APPROVE
issues_found: []
summary: 实现简洁，测试充分，符合规范
recommendation: CONTINUE
```

---

### docs 执行 (T-3.1)

**输入**: implementation summary

**处理**:
1. 更新 README.md
2. 更新 API 文档

**输出**:
```markdown
# API Endpoints

## GET /api/hello

Returns a greeting message.

### Response
```json
{
  "message": "Hello World"
}
```

### Status Codes
- 200: Success
```

---

## 步骤 5: 审计验证

```bash
/spec-audit 012-hello-world-api
```

**Audit Result**:
```yaml
overall_status: PASS
findings: []

ac_status:
  - AC-001: ✅ GET /api/hello 返回 200
  - AC-002: ✅ 响应体为 {"message": "Hello World"}
  - AC-003: ✅ 响应时间 < 100ms (实测: 5ms)
```

---

## 完成报告

```bash
# 自动生成 completion-report.md
```

```yaml
Feature ID: 012-hello-world-api
Status: COMPLETE

Deliverables:
  - src/controllers/HelloController.ts
  - src/controllers/HelloController.spec.ts
  - docs/api/hello.md

Metrics:
  - Tasks: 3/3 完成
  - Tests: 2/2 通过
  - Coverage: 100%
  - Reworks: 0
```

---

## 关键要点

1. **标准流程**: spec-start → spec-plan → spec-tasks → spec-implement → spec-audit
2. **角色分工**: developer 实现 → tester 测试 → reviewer 审查 → docs 文档
3. **契约传递**: 每个阶段的输出成为下一阶段的输入
4. **零返工**: 理想情况下的一次性通过流程

## 下一步

- 查看 [../02-end-to-end-feature/](../02-end-to-end-feature/) 了解更复杂的 feature 示例
- 查看 [../03-role-specific/](../03-role-specific/) 了解每个角色的详细用法