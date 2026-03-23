# OpenCode 专家包 MVP skill 清单与来源建议

## 1. 文档目的

本文档用于整理 **OpenCode 专家包 MVP** 所需的 skill 清单，并对每个 skill 给出来源建议与建设策略，帮助快速判断：

- 哪些 skill 可以直接复用
- 哪些 skill 可以半复用后改造
- 哪些 skill 必须按你的专家包体系自定义
- 哪些适合先手工写
- 哪些适合用 skill creator 辅助生成

本文档聚焦 MVP，不追求一次把所有 skill 做满，而是优先覆盖：

- architect
- developer
- tester
- reviewer
- docs（可选）
- security（可选）

---

## 2. 分类原则

所有 skill 按以下三类评估：

### A. 可直接复用
定义：
- 现成来源较成熟
- 和你的专家包架构冲突小
- 改动很少即可接入

### B. 可半复用
定义：
- 现成来源能提供方法骨架
- 但需要按你的角色边界、输出格式、gate 规则进行改写

### C. 必须自定义
定义：
- 和你的 OpenClaw 调度协议、artifact schema、质量 gate、返工机制强绑定
- 外部 skill 很难直接匹配

---

## 3. 总体策略建议

建议采取下面的建设顺序：

### 第一步：先复用通用方法型 skill
优先找：
- artifact-reading
- context-summarization
- failure-analysis
- execution-reporting

### 第二步：再补四个核心角色的最小专属 skill
- architect
- developer
- tester
- reviewer

### 第三步：最后补 docs / security
只有在主闭环跑通后，再增强外侧角色。

### 第四步：用 skill creator 做定制补全
不建议一开始就批量生成大量 skills。  
更适合在你已经确定 skill 清单之后，用它生成初稿、补 checklist、补 failure modes、调 description。

---

## 4. MVP skill 清单总表

| 角色/类别 | skill 名称 | 优先级 | 复用建议 | 说明 |
|---|---|---:|---|---|
| common | artifact-reading | P0 | 可半复用 | 所有角色都会用到 |
| common | context-summarization | P0 | 可半复用 | 防止上下文膨胀 |
| common | failure-analysis | P0 | 可半复用 | 返工闭环核心 |
| common | execution-reporting | P0 | 必须自定义 | 要和你的 result schema 对齐 |
| architect | requirement-to-design | P0 | 可半复用 | 从需求到设计 |
| architect | interface-contract-design | P1 | 可半复用 | 接口和边界契约 |
| architect | tradeoff-analysis | P0 | 可直接复用 / 半复用 | 结构化 trade-off |
| developer | feature-implementation | P0 | 可半复用 | 功能落地主 skill |
| developer | bugfix-workflow | P0 | 可半复用 | bug 修复闭环 |
| developer | code-change-selfcheck | P0 | 必须自定义 | 必须和你的 gate 对齐 |
| tester | unit-test-design | P0 | 可半复用 | 单测设计 |
| tester | regression-analysis | P0 | 可半复用 | 回归分析 |
| tester | edge-case-matrix | P1 | 可半复用 | 边界条件矩阵 |
| reviewer | code-review-checklist | P0 | 可半复用 | code review 主 skill |
| reviewer | spec-implementation-diff | P0 | 必须自定义 | 必须和 spec / artifact 格式对齐 |
| reviewer | reject-with-actionable-feedback | P0 | 可半复用 | 提高 review 可执行性 |
| docs | readme-sync | P1 | 可半复用 | 文档同步 |
| docs | changelog-writing | P1 | 可直接复用 / 半复用 | 变更说明 |
| security | auth-and-permission-review | P1 | 可半复用 | 高风险任务用 |
| security | input-validation-review | P1 | 可半复用 | 基础安全检查 |

---

## 5. Common Skills

## 5.1 artifact-reading

### 作用
统一读取 spec、design note、implementation summary、test report、review report 等工件，并抽取出当前 task 真正需要的信息。

### 为什么是 P0
如果这个 skill 没有，所有角色都会各自“随便理解”工件，导致：
- 上下游理解不一致
- task 边界漂移
- 返工很难收敛

### 复用建议
**可半复用**

### 原因
外部现成 skill 往往能提供“如何读取文档 / 总结工件”的方法，但你的 artifact 类型、字段命名、路径规范、schema 是自定义的，因此必须改造。

### 建议来源
- OpenCode skills 原生机制下自建 common skill
- 可参考 Anthropic skills 的基础 skill 写法
- 可参考 Superpowers / 社区 skill 库对“读计划、读设计、读上下文”的写法

### 必须改写的部分
- artifact 类型枚举
- 读取优先级
- 输出摘要格式
- 与 dispatch payload 的衔接方式

---

## 5.2 context-summarization

### 作用
把大量项目上下文裁剪成当前角色执行当前 task 需要的最小上下文。

### 为什么是 P0
你这套架构后续一定会遇到上下文膨胀问题。  
没有这个 skill，各角色会拿到过大输入，质量会下降。

### 复用建议
**可半复用**

### 原因
外部已有大量“上下文压缩 / 摘要”范式，但你的场景需要：
- 保留 task goal
- 保留 constraints
- 保留 expected outputs
- 保留 retry context
- 丢弃无关项目噪音

这部分必须按你的调度协议定制。

### 建议来源
- 通用 summarization skill 思路
- Superpowers 的 workflow-style context discipline
- 你自己的 dispatch payload schema

---

## 5.3 failure-analysis

### 作用
从 test fail、review reject、verification fail、logs 中提炼出：
- 根因
- 是否可重试
- 是否应返工
- 是否应重规划
- 是否应升级

### 为什么是 P0
返工质量高低，基本取决于 failure-analysis 好不好。

### 复用建议
**可半复用**

### 原因
社区常见 skill 可以提供“如何分析失败”的方法，但你需要的输出是结构化的：
- reason_type
- failed_checks
- required_fixes
- non_goals
- recommendation

这部分要与你的返工机制强绑定。

### 建议来源
- Anthropic skill 写法
- skill creator 后续优化
- 你自己的 ReworkRequest / Escalation schema

---

## 5.4 execution-reporting

### 作用
要求所有角色以统一格式输出 execution result 和 artifact summary。

### 为什么是 P0
没有它，OpenClaw 管理层无法稳定 intake，不同角色的输出会风格漂移。

### 复用建议
**必须自定义**

### 原因
这直接和你的 `execution-result.schema.yaml`、artifact 规范、后续 verification / acceptance 对接强绑定。

### 建议建设方式
- 不从外部找成品
- 直接按你自己的 output contract 写

### 建议后续是否用 skill creator
可以。  
但前提是你先把 schema 和模板定下来，再用 skill creator 去生成 skill 初稿。

---

## 6. Architect Skills

## 6.1 requirement-to-design

### 作用
将 requirement / spec 转成可执行设计，包括：
- 设计目标
- 模块边界
- 接口方案
- 风险
- 实施顺序

### 优先级
P0

### 复用建议
**可半复用**

### 原因
外部“从需求到设计”的范式很多，但你需要它输出：
- design note
- task split suggestion
- architecture risk summary

这要求和你的 artifact 模板对齐。

### 建议来源
- Superpowers 中偏 workflow / planning / design 的技能思想
- 你自己的 architect 角色要求
- 适当用 skill creator 生成第一版框架

### 不建议直接照搬的原因
很多现成“设计 skill”偏通用咨询风格，不够工程化，容易写得太虚。

---

## 6.2 interface-contract-design

### 作用
聚焦接口设计，包括：
- 输入输出约束
- 错误码 / 错误语义
- 数据契约
- 兼容性要求

### 优先级
P1

### 复用建议
**可半复用**

### 原因
方法通用，但项目中的接口风格、错误模型、artifact 输出格式要自定义。

### 建议来源
- 你自己的架构实践
- requirement-to-design skill 内可先内嵌，后续再拆独立 skill

### MVP 建议
第一版可以先不独立成 skill，先作为 requirement-to-design 的一个章节。

---

## 6.3 tradeoff-analysis

### 作用
对多个方案做结构化对比，例如：
- 简单实现 vs 可扩展性
- 当前迭代速度 vs 长期维护成本
- 风险较低路径 vs 性能更优路径

### 优先级
P0

### 复用建议
**可直接复用 / 可半复用**

### 原因
这个方法论本身非常通用，外部来源能直接给你很好的骨架。

### 建议来源
- Anthropic skills 思路
- Superpowers 中 design-first / review-first 工作流思路
- 你自己的 architect 模板

### MVP 建议
可以优先作为可复用 skill 使用，再按你的输出格式略改。

---

## 7. Developer Skills

## 7.1 feature-implementation

### 作用
指导 developer：
- 对齐目标
- 按 design 落地
- 限制范围
- 保留变更摘要
- 做自检

### 优先级
P0

### 复用建议
**可半复用**

### 原因
外部“实现类 skill”很多，但你的 developer 需要强绑定：
- constraints
- expected_outputs
- changed_files
- self-check
- unresolved issues

### 建议来源
- Superpowers 中 implementation workflow 的思想
- 你自己的 developer 角色规范
- skill creator 可用于生成初稿

---

## 7.2 bugfix-workflow

### 作用
指导 developer 对 bug 修复形成闭环：
- 理解问题
- 定位范围
- 最小修复
- 风险检查
- 回归提示

### 优先级
P0

### 复用建议
**可半复用**

### 原因
bugfix 的方法可以复用，但你的系统还要输出：
- 修复摘要
- 影响范围
- 需要 tester 关注的回归点
- 是否引发 replan / escalate

### 建议来源
- 通用 debugging / bugfix 思路
- failure-analysis 配套
- 你自己的 rework 规则

---

## 7.3 code-change-selfcheck

### 作用
要求 developer 在交付前完成最小自检，包括：
- 是否超范围
- 是否引入新依赖
- 是否和 design 冲突
- 是否有未说明风险
- 是否遗漏关键路径

### 优先级
P0

### 复用建议
**必须自定义**

### 原因
它直接对应你的 developer gate，是你质量保障体系的一部分，不宜依赖外部现成 skill。

### 建议建设方式
- 直接按《角色质量保障规范》写
- 作为 developer 的关键 role skill

---

## 8. Tester Skills

## 8.1 unit-test-design

### 作用
指导 tester 设计单测：
- 关键路径
- 正常路径
- 失败路径
- 依赖隔离
- 基本覆盖

### 优先级
P0

### 复用建议
**可半复用**

### 原因
单测方法通用，但你需要它对齐：
- acceptance criteria
- changed files
- expected risk areas
- test report 模板

### 建议来源
- 社区 testing skills
- 你自己的 test-report 模板
- skill creator 后续优化

---

## 8.2 regression-analysis

### 作用
分析改动后哪些路径需要回归测试，哪些问题可能复发。

### 优先级
P0

### 复用建议
**可半复用**

### 原因
回归分析方法可复用，但你系统中的 regression 需要跟：
- changed files
- known risks
- bugfix summary
- reviewer / security 建议

结合起来。

### 建议来源
- failure-analysis 延伸
- tester 专属技能

---

## 8.3 edge-case-matrix

### 作用
生成边界条件矩阵，确保 tester 不只跑 happy path。

### 优先级
P1

### 复用建议
**可半复用**

### 原因
方法通用，但要映射到你的领域和 artifact 格式。

### MVP 建议
第一版可以先作为 unit-test-design 的一部分，后续再拆 skill。

---

## 9. Reviewer Skills

## 9.1 code-review-checklist

### 作用
为 reviewer 提供稳定检查框架，包括：
- 目标对齐
- 范围控制
- 边界条件
- 风险暴露
- 可维护性
- 一致性

### 优先级
P0

### 复用建议
**可半复用**

### 原因
review checklist 很适合参考外部，但必须与你的 `review-report.md`、`review-bar.md` 对齐。

### 建议来源
- 通用 code review best practices
- 你自己的 reviewer 质量规范
- 可用 skill creator 生成第一版 checklist 结构

---

## 9.2 spec-implementation-diff

### 作用
检查 spec / design 与 implementation 是否一致。

### 优先级
P0

### 复用建议
**必须自定义**

### 原因
这项 skill 严重依赖你自己的：
- spec 结构
- design note 结构
- implementation summary 结构
- acceptance criteria

外部 skill 很难直接适配。

### 建议建设方式
- 直接按你的 schema 写
- 作为 reviewer 最关键的差异检查 skill

---

## 9.3 reject-with-actionable-feedback

### 作用
保证 reviewer 在拒绝时给出：
- must-fix
- non-blocking
- residual risks
- 可执行修改建议

### 优先级
P0

### 复用建议
**可半复用**

### 原因
这个 skill 的方法部分通用，但要与 review-report 模板和返工机制对齐。

### 建议来源
- 通用 review best practices
- skill creator 适合生成这个 skill 的骨架

---

## 10. Docs Skills（可选）

## 10.1 readme-sync

### 作用
保证 README 与当前实现一致。

### 优先级
P1

### 复用建议
**可半复用**

### 原因
通用性强，但要结合你的 changelog / doc_update_report 模板。

---

## 10.2 changelog-writing

### 作用
按结构化方式输出本轮变更说明。

### 优先级
P1

### 复用建议
**可直接复用 / 可半复用**

### 原因
变更说明写法通用，但建议和你的模板统一。

---

## 11. Security Skills（可选）

## 11.1 auth-and-permission-review

### 作用
检查认证、授权、权限边界。

### 优先级
P1

### 复用建议
**可半复用**

### 原因
方法通用，但你的系统最终需要：
- severity
- must-fix
- gate recommendation

### 适合场景
- auth
- permission
- token
- RBAC
- user state transition

---

## 11.2 input-validation-review

### 作用
检查输入边界、参数校验和不安全默认值。

### 优先级
P1

### 复用建议
**可半复用**

### 原因
方法通用，但输出结构要接你的 security_report。

---

## 12. 来源建议总表

## 12.1 官方优先来源

### OpenCode 原生 skills 机制
适合作为承载层。  
优先级最高，因为这是你最终落地运行的目标能力层。

### Anthropic skills / skill-creator
适合作为：
- skill 结构参考
- skill 初稿生成器
- skill 迭代优化器

---

## 12.2 社区优先来源

### Superpowers
适合参考：
- workflow discipline
- design-before-implementation
- review / verification style
- sub-agent / staged workflow 思路

不建议整包照搬到你的专家包里，而是更适合作为：
- 方法灵感库
- 半复用来源
- 高质量 skill 样式参考

### opencode-skills / opencode-agent-skills / skillful 等
适合参考：
- OpenCode 兼容 skill 组织方式
- 目录命名
- 动态加载思路
- per-agent skill 过滤思路

---

## 12.3 不建议重依赖的来源类型

### 纯提示词合集
问题：
- 没有稳定输入输出契约
- 不强调 artifact
- 不强调 gate
- 很难接入你的闭环系统

### 过于通用的“万能专家” skill
问题：
- 方法不够明确
- 容易和角色边界冲突
- 最终会导致 expert pack 混乱

---

## 13. skill creator 的使用建议

## 13.1 适合用 skill creator 生成的 skill

优先建议：

- requirement-to-design
- feature-implementation
- bugfix-workflow
- unit-test-design
- code-review-checklist
- reject-with-actionable-feedback

这些 skill 的通用方法部分较多，很适合用 skill creator 先生成初稿，再按你的协议改。

## 13.2 不建议直接交给 skill creator 决定的 skill

- execution-reporting
- code-change-selfcheck
- spec-implementation-diff

因为它们太依赖你自己的 schema 和 gate 设计。

## 13.3 skill creator 的最佳使用方式

建议流程：

1. 先写清 skill 名称与用途
2. 先定该 skill 的输入输出要求
3. 用 skill creator 生成初稿
4. 按你的角色规范改写
5. 用 examples / 实际任务验证
6. 再继续迭代

不要直接说“帮我生成 20 个 skill”，那样通常只会得到一批看起来整齐但不够实战的文档。

---

## 14. MVP 推荐最终 skill 包

如果你想先快速跑通，我建议 MVP 最终只保留下面这一组：

## 14.1 必做 common
- artifact-reading
- context-summarization
- failure-analysis
- execution-reporting

## 14.2 必做 architect
- requirement-to-design
- tradeoff-analysis

## 14.3 必做 developer
- feature-implementation
- bugfix-workflow
- code-change-selfcheck

## 14.4 必做 tester
- unit-test-design
- regression-analysis

## 14.5 必做 reviewer
- code-review-checklist
- spec-implementation-diff
- reject-with-actionable-feedback

## 14.6 可选 docs
- readme-sync
- changelog-writing

## 14.7 可选 security
- auth-and-permission-review
- input-validation-review

---

## 15. 最终结论

可以把 skill 建设策略总结成一句话：

**先复用方法型 skill，再自定义协议型 skill，最后用 skill creator 补齐缺口并持续优化。**

更具体地说：

- **可直接复用 / 可半复用** 的，优先从官方机制和成熟社区 workflow 中吸收
- **和你 schema、gate、artifact 强绑定** 的，必须自己写
- **skill creator** 最适合做“生成初稿 + 优化迭代”，不适合替你决定整套专家包结构

---

## 16. 下一步建议

在这份清单之后，最实用的下一步不是再讨论原则，而是直接落第一批 skill 文件内容。  
优先顺序建议：

1. `artifact-reading/SKILL.md`
2. `failure-analysis/SKILL.md`
3. `requirement-to-design/SKILL.md`
4. `feature-implementation/SKILL.md`
5. `code-review-checklist/SKILL.md`

这样你就能把 MVP 的 skill 基础层先搭起来。
