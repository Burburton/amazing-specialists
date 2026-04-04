# 文档修改策略规范（适用于 amazing-specialists / OpenCode 专家包）

## 1. 目的

本规范用于约束仓库中文档的修改方式，解决以下问题：

- 当前有效规则被埋在文末补丁说明里，导致后续读者和 agent 容易误读
- 历史记录与现行规则混杂，source of truth 不清晰
- completion-report / verification-report 与治理正文之间发生长期漂移
- “只能增量追加、不能回写正文”的统一限制，不适合治理型、可执行型仓库

本规范的核心目标是：

- 让 **当前规则** 在正文中可直接读取
- 让 **历史变化** 可追溯、可审计
- 让 OpenCode / agent / 人类读者都能快速识别哪份文档代表“现在的真相”

---

## 2. 总原则

采用以下三条总原则：

### 原则 A：治理正文可回写

凡是承担“当前规则声明”职责的文档，允许直接修改正文。  
修改完成后，正文必须能够直接表达当前有效规则，不应依赖文末补充说明才能理解。

### 原则 B：历史记录增量修正

凡是承担“过程记录 / 验收记录 / 审计记录”职责的文档，不覆盖原有历史结论，而是通过追加说明的方式进行修正，例如：

- `Post-Completion Note`
- `Follow-up Repair`
- `Correction`
- `Sequence Semantics Correction`

### 原则 C：当前规则与历史说明分层管理

- **当前规则** 放在 canonical docs（规范正文）
- **历史变化** 放在 reports / changelog / repair notes
- 不允许把“当前真相”长期只放在历史补丁区

---

## 3. 文档分类与修改方式

### 3.1 Canonical Docs（规范正文 / 当前真相文档）

这类文档用于回答：

> 现在应该按什么规则做？

这类文档必须保持：

- 正文即当前有效版本
- 可直接回写
- 不依赖读者通读全文末尾补丁才能获取当前规则
- 不允许旧规则长期停留在正文核心位置

#### 适用文件（示例）

- `README.md`
- `AGENTS.md`
- `package-spec.md`
- `role-definition.md`
- `io-contract.md`
- `quality-gate.md`
- 其他承担“当前规则定义”职责的治理文档

#### 修改要求

当这类文档发生规则更新时：

1. **直接修改正文**
2. 将旧规则替换为当前规则
3. 如需保留兼容说明，可简短保留 legacy/transition 注释
4. 不应在正文中累积大量“某日修补 / 某日更正 / 某日再修补”的历史痕迹
5. 如需保留历史，应转移到 changelog 或 report 文档

#### 正确示例

- 直接把  
  `3 个核心技能目录`  
  改成  
  `6-role formal execution model + legacy 3-skill transition layer`

- 直接把高风险流程顺序正文改成统一版本，而不是只在文末说“以上顺序已被更新”

#### 错误示例

- 正文仍写旧规则，文末追加一句“请以后以下面的补丁为准”
- 正文第一屏写“3-skill 是核心”，最后一节再写“实际上 6-role 才是正式模型”

---

### 3.2 Historical Reports（历史记录 / 验收 / 审计文档）

这类文档用于回答：

> 当时做了什么？当时怎么验证的？后来发现了什么问题？

这类文档不应伪造“从来没错过”，而应保留历史，并通过追加说明建立修正链路。

#### 适用文件（示例）

- `completion-report.md`
- `verification-report.md`
- `audit-report.md`
- `migration-report.md`
- `retrospective.md`
- feature 下的交付总结类文档

#### 修改要求

当这类文档需要修正时：

1. **保留原历史内容**
2. 不直接抹去原本的结论、验收或判断
3. 通过新增章节追加修正说明，例如：
   - `## Post-Completion Note`
   - `## Follow-up Repair Note`
   - `## Correction`
   - `## Sequence Semantics Correction`
4. 说明：
   - 原结论在当时的上下文是什么
   - 后来发现的问题是什么
   - 当前正式规则以哪份 canonical doc 为准
   - 本次由哪个 repair feature 收口修复

#### 正确示例

- 在 `specs/002-role-model-alignment/completion-report.md` 中补充：
  - 002 在语义设计层面完成
  - 但治理落盘存在漂移
  - 由 `002b-governance-repair` 进行收口修复

#### 错误示例

- 直接把原 completion-report 改写成“从来都没有问题”
- 删除原报告里所有不一致痕迹，导致历史不可追溯

---

### 3.3 Change Logs / Repair Notes（变更记录文档）

这类文档专门用于保存变化轨迹，而不是定义当前规则。

#### 适用文件（示例）

- `CHANGELOG.md`
- repair note
- migration note
- release note

#### 修改要求

- 只记录变化和原因
- 不承担“当前正式规则”的唯一来源职责
- 应明确引用对应 canonical docs

---

## 4. 判断标准：一个简单的决策问题

每次修改文档前，先问：

> 这个文件是不是在回答“现在应该按什么做”？

### 如果答案是“是”
按照 **canonical docs** 处理：
- 直接回写正文
- 保证正文就是当前有效版本

### 如果答案是“不是，它是在记录过去做了什么”
按照 **historical reports** 处理：
- 增量追加修正
- 保留历史记录
- 明确当前规则引用哪份 canonical doc

---

## 5. 针对 AI / OpenCode / Agent 的特别约束

本项目不是普通说明文档仓库，而是可执行治理仓库。  
因此必须考虑 agent 的阅读方式。

### 风险

AI / agent 很可能会：

- 只读取前半部分
- 优先使用最早出现的强规则语句
- 因上下文限制忽略文末补丁
- 不自动推断“后面追加的说明优先级更高”

### 因此必须遵守

1. 当前规则必须放在正文靠前位置
2. 旧规则不得长期保留在正文主叙述中
3. 文末补丁不能作为唯一 truth source
4. 如果某条规则已被废弃，应在 canonical docs 中直接替换
5. 如需保留历史，应放到 report / changelog，不应让 agent 自己猜测优先级

---

## 6. 针对 amazing-specialists 的具体落地规则

### 6.1 必须直接回写正文的文件

以下文件属于 canonical docs：

- `README.md`
- `AGENTS.md`
- `package-spec.md`
- `role-definition.md`
- `io-contract.md`
- `quality-gate.md`

这些文件一旦发生语义调整，必须直接修改正文。

### 6.2 应增量修正的文件

以下文件属于 historical reports：

- `specs/*/completion-report.md`
- `specs/*/verification-report.md`
- `specs/m3-skills-integration-verification-report.md`
- 其他 audit / retrospective / migration 类文档

这些文件应通过追加 note / correction 的方式修正。

### 6.3 不允许出现的坏味道

以下情况视为治理坏味道：

- README 前文是旧规则，文末才补一句新规则
- AGENTS 正文仍是旧语义，但通过另一个 report 才能知道真正规则
- package-spec 与 role-definition 的正式语义不一致
- completion-report 声称已完成，但正文治理文件并未同步更新
- 流程顺序在 canonical docs 与 verification-report 中长期冲突

---

## 7. 推荐的修正模板

### 7.1 Canonical doc 修正模板

适用于 `README.md / AGENTS.md / package-spec.md / role-definition.md`

修正原则：

- 直接改正文
- 让当前规则成为主叙述
- legacy/transition 说明只保留简洁注释

推荐写法示例：

- `The formal execution model is the 6-role structure.`
- `Legacy 3-skill directories remain only as transition/bootstrap compatibility.`
- `Feature naming and actor semantics must follow the 6-role model.`

### 7.2 Historical report 修正模板

适用于 `completion-report.md / verification-report.md`

推荐新增章节：

#### `## Post-Completion Note`
用于说明：
- 原 feature 在当时完成了什么
- 后来发现哪些治理更新未完整落盘
- 当前由哪个 follow-up feature 进行修复

#### `## Correction`
用于说明：
- 原文某结论存在偏差
- 当前正式规则以哪份 canonical doc 为准

#### `## Sequence Semantics Correction`
用于说明：
- 流程顺序原记录与正式定义不一致
- 当前统一后的正式顺序是什么
- 本次修正影响哪些结论，哪些结论仍然有效

---

## 8. OpenCode 执行规则

以后给 OpenCode 下文档修补任务时，应明确要求：

1. **先判断文档类型**
   - canonical doc
   - historical report
   - changelog / repair note

2. **按类型选择修改方式**
   - canonical doc：直接回写正文
   - historical report：增量追加修正说明
   - changelog：记录变化，不承载当前规则

3. **禁止统一套用“只能增量追加”的限制**
   - 该限制只适用于历史记录类文件
   - 不适用于 canonical docs

4. **完成后必须输出文档分类结果**
   至少说明：
   - 哪些文件被视为 canonical docs
   - 哪些文件被视为 historical reports
   - 各自采用了什么修改策略

---

## 9. 最终规则（可作为仓库约定）

可在仓库治理中正式采用以下表述：

> Canonical governance documents must be updated in place so that their body always reflects the current valid rules.  
> Historical reports must preserve prior conclusions and append corrections or follow-up repair notes instead of rewriting history.  
> Current truth must not depend on readers reaching the end of a long document to discover a patch note.

---

## 10. 结论

本项目不应采用“一刀切的只能增量追加”文档策略。  
更合理的做法是：

- **治理正文文档：直接回写正文**
- **历史/验收/审计文档：增量追加修正**
- **变更记录：单独记录变化轨迹**

只有这样，才能同时满足：

- 当前规则清晰可读
- 历史变化可追溯
- OpenCode / agent 不容易被旧正文误导
- 仓库治理具备真正可执行的 source of truth
