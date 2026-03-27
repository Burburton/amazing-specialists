# Developer 角色示例

本文档展示 developer 角色的具体工作方式和 skill 使用。

---

## 角色定义

**developer** 负责代码实现，将技术设计转化为可运行的代码。

### MVP Skills
- `feature-implementation` - 功能实现
- `bugfix-workflow` - Bug 修复闭环
- `code-change-selfcheck` - 代码变更自检

### M4 Skills (可选)
- `refactor-safely` - 安全重构流程
- `dependency-minimization` - 依赖最小化

---

## 典型工作流程

### 输入
```yaml
dispatch_id: dsp-dev-001
role: developer
command: implement-task
title: 实现登录功能

inputs:
  - artifact_id: design-login-v1
    artifact_type: design_note
    path: artifacts/design/design-login-v1.md

constraints:
  - 使用 TypeScript
  - 遵循 NestJS 框架规范
  - 代码覆盖率 > 80%

expected_outputs:
  - code changes
  - implementation_summary
```

### 执行过程

#### Step 1: 读取设计
```
developer 使用 artifact-reading skill 读取 design_note
理解: 架构设计, 接口契约, 技术决策
```

#### Step 2: 实现功能
```
使用 feature-implementation skill:
1. 创建文件结构
2. 实现核心逻辑
3. 添加错误处理
4. 编写基础测试
```

#### Step 3: 代码自检
```
使用 code-change-selfcheck skill:
1. 实现目标对齐检查
2. 改动范围检查
3. 依赖引入检查
4. 与设计一致性检查
```

### 输出
```yaml
status: SUCCESS
summary: 完成登录功能实现

changed_files:
  - path: src/controllers/AuthController.ts
    change_type: added
  - path: src/services/AuthService.ts
    change_type: added

checks_performed:
  - 实现目标对齐检查 ✅
  - 改动范围检查 ✅
  - 依赖引入检查 ✅

recommendation: SEND_TO_TEST
```

---

## Skill 使用示例

### feature-implementation

**何时使用**: 实现新功能

**输入**: design_note, spec

**输出**: 代码文件, implementation_summary

**实现清单**:
1. [ ] 创建必要的文件和目录
2. [ ] 实现核心业务逻辑
3. [ ] 添加输入验证
4. [ ] 添加错误处理
5. [ ] 添加日志记录
6. [ ] 处理边界条件

### code-change-selfcheck

**何时使用**: 代码实现完成后

**自检清单**:

| 检查项 | 说明 |
|--------|------|
| 实现目标对齐 | 是否满足所有 AC? |
| 改动范围检查 | 是否只改动必要文件? |
| 依赖引入检查 | 是否引入了新依赖? 是否必要? |
| 与设计一致性 | 实现是否与 design_note 一致? |
| 代码规范 | 是否符合项目编码规范? |
| 安全检查 | 是否有潜在安全问题? |

**示例输出**:
```yaml
selfcheck_result:
  - check: 实现目标对齐
    status: PASS
    details: 所有 AC 已实现
  
  - check: 改动范围检查
    status: PASS
    details: 仅新增文件，无现有文件修改
  
  - check: 依赖引入检查
    status: PASS
    details: 使用已有 jsonwebtoken, bcrypt
  
  - check: 与设计一致性
    status: PASS
    details: 接口契约完全匹配
```

### bugfix-workflow

**何时使用**: 修复 bug

**输入**: bug report, error logs

**流程**:
1. 复现问题
2. 定位根因
3. 编写失败测试
4. 修复代码
5. 验证修复

**示例**:
```yaml
bug_id: BUG-001
description: 登录返回 500 而非 401

reproduce_steps:
  1. 发送错误密码
  2. 观察返回 500

root_cause: 未捕获 AuthenticationError

fix:
  - 添加 try-catch
  - 返回正确错误码

verification:
  - 测试通过
  - 返回 401
```

---

## 代码模板

### Controller 模板
```typescript
@Controller('api/{module}')
export class {Module}Controller {
  constructor(private readonly {module}Service: {Module}Service) {}
  
  @Post('{action}')
  @HttpCode(HttpStatus.OK)
  async {action}(@Body() request: {Action}Request): Promise<{Action}Response> {
    // Implementation
  }
}
```

### Service 模板
```typescript
@Injectable()
export class {Module}Service {
  constructor(
    private readonly {module}Repository: {Module}Repository,
  ) {}
  
  async {action}(...args): Promise<Result> {
    // Business logic
  }
}
```

---

## 质量门禁

developer 输出必须满足:
- [ ] 所有 AC 对应代码已实现
- [ ] 代码自检通过
- [ ] 无 TypeScript 编译错误
- [ ] 无明显安全问题
- [ ] 改动范围符合约束