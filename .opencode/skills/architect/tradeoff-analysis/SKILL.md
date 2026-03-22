# Skill: tradeoff-analysis

## Purpose

对多个技术方案做结构化对比分析，帮助在 conflicting goals 中做出理性决策。

解决的核心问题：
- 多个方案各有利弊，难以选择
- 决策缺乏系统性评估
- 后期后悔当初的选择
- 团队成员对方案有分歧

## When to Use

必须使用时：
- 存在多个技术方案需要选择
- 重大架构决策需要记录理由
- 团队对方案有争议
- 需要向管理层汇报决策依据

推荐使用时：
- 技术选型（框架/库/数据库）
- 架构风格选择
- 性能 vs 可维护性权衡
- 短期速度 vs 长期质量权衡

## When Not to Use

不适用场景：
- 只有一个可行方案
- 决策已做出且不可更改
- 纯个人偏好选择
- 时间紧迫无法分析

## Tradeoff Analysis Framework

### 1. 明确决策目标
- 主要目标是什么？
- 次要目标是什么？
- 约束条件是什么？
- 成功标准是什么？

### 2. 识别备选方案
- 列出所有可行方案
- 包括"保持现状"
- 包括"混合方案"
- 不预设立场

### 3. 定义评估维度
常见维度：
- **性能**: 延迟、吞吐量、资源使用
- **可维护性**: 代码复杂度、学习曲线、文档
- **开发速度**: 实现时间、团队熟悉度
- **可靠性**: 稳定性、容错性、恢复能力
- **可扩展性**: 水平扩展、功能扩展
- **安全性**: 攻击面、安全特性
- **成本**: 开发成本、运维成本、许可费用
- **风险**: 技术风险、团队风险、供应商风险

### 4. 评估每个方案
为每个方案在每个维度上评分：
- 使用相对评分（高/中/低 或 1-5分）
- 记录评分理由
- 识别关键差异

### 5. 权重分配
- 不同维度重要性不同
- 与利益相关者对齐权重
- 记录权重理由

### 6. 综合评估
- 加权计算总分
- 识别 tradeoffs（牺牲的方面）
- 检查是否符合约束

### 7. 做出决策
- 选择最优方案
- 记录决策理由
- 定义成功指标
- 制定回退计划

## Output Format

```yaml
tradeoff_analysis:
  decision_id: string
  decision_title: string
  timestamp: string
  
  context:
    problem_statement: string
    goals:
      - string
    constraints:
      - string
      
  alternatives:
    - name: string
      description: string
      
  evaluation_criteria:
    - criterion: string
      weight: number  # 0-1
      description: string
      
  evaluation_matrix:
    - alternative: string
      scores:
        - criterion: string
          score: number  # 1-5
          reasoning: string
      total_score: number
      
  tradeoffs:
    - selected: string
      sacrificed: string
      explanation: string
      
  recommendation:
    selected_alternative: string
    reasoning: string
    
  implementation_notes:
    - string
    
  monitoring_plan:
    - metric: string
      threshold: string
      action: string
      
  rollback_plan:
    trigger: string
    steps: string[]
```

## Examples

### 示例 1：API 风格选择

```yaml
tradeoff_analysis:
  decision_title: "REST vs GraphQL vs gRPC"
  
  context:
    problem_statement: "选择新的 API 风格用于移动端和 Web 端"
    goals:
      - "减少网络请求次数"
      - "降低客户端复杂度"
      - "支持快速迭代"
    constraints:
      - "团队熟悉 REST"
      - "需要支持缓存"
      
  alternatives:
    - name: REST
      description: "传统 RESTful API"
    - name: GraphQL
      description: "查询语言，客户端指定返回字段"
    - name: gRPC
      description: "二进制协议，高性能"
      
  evaluation_criteria:
    - criterion: 开发速度
      weight: 0.3
    - criterion: 性能
      weight: 0.25
    - criterion: 学习曲线
      weight: 0.2
    - criterion: 工具生态
      weight: 0.15
    - criterion: 缓存支持
      weight: 0.1
      
  evaluation_matrix:
    - alternative: REST
      scores:
        - criterion: 开发速度
          score: 4
          reasoning: "团队熟悉，开发快"
        - criterion: 性能
          score: 3
          reasoning: "可能有多余数据传输"
        - criterion: 学习曲线
          score: 5
          reasoning: "全员熟悉"
        - criterion: 工具生态
          score: 5
          reasoning: "成熟完善"
        - criterion: 缓存支持
          score: 5
          reasoning: "HTTP 缓存成熟"
      total_score: 4.1
      
    - alternative: GraphQL
      scores:
        - criterion: 开发速度
          score: 3
          reasoning: "初期学习成本，后期收益"
        - criterion: 性能
          score: 4
          reasoning: "减少请求和数据"
        - criterion: 学习曲线
          score: 2
          reasoning: "团队需学习"
        - criterion: 工具生态
          score: 3
          reasoning: "生态发展中"
        - criterion: 缓存支持
          score: 2
          reasoning: "缓存较复杂"
      total_score: 3.15
      
    - alternative: gRPC
      scores:
        - criterion: 开发速度
          score: 2
          reasoning: "学习曲线陡峭"
        - criterion: 性能
          score: 5
          reasoning: "二进制高效"
        - criterion: 学习曲线
          score: 1
          reasoning: "Protobuf 学习成本"
        - criterion: 工具生态
          score: 3
          reasoning: "后端工具好，前端弱"
        - criterion: 缓存支持
          score: 2
          reasoning: "HTTP/2 缓存有限"
      total_score: 2.55
      
  tradeoffs:
    - selected: REST
      sacrificed: "减少请求次数的能力"
      explanation: "为了团队效率和缓存优势"
      
  recommendation:
    selected_alternative: REST
    reasoning: "团队熟悉度高，开发速度快，缓存支持好。短期最优选择。"
    
  implementation_notes:
    - "使用 REST 实现 MVP"
    - "预留 GraphQL 迁移可能"
    - "使用 BFF 模式优化移动端"
    
  monitoring_plan:
    - metric: API 请求次数
      threshold: "> 10 次/页面"
      action: "评估 GraphQL 迁移"
```

### 示例 2：简单决策

```yaml
# 只有一个备选方案明显更好时
tradeoff_analysis:
  decision_title: "是否引入 Redis 缓存"
  
  context:
    problem_statement: "数据库查询慢，需要缓存"
    
  alternatives:
    - name: 不引入缓存
      description: "保持现状，优化查询"
    - name: 引入 Redis
      description: "添加 Redis 缓存层"
      
  evaluation_matrix:
    - alternative: 不引入缓存
      scores:
        - criterion: 复杂度
          score: 2
          reasoning: "虽然简单但问题无法解决"
        - criterion: 效果
          score: 2
          reasoning: "查询依然慢"
          
    - alternative: 引入 Redis
      scores:
        - criterion: 复杂度
          score: 4
          reasoning: "增加运维复杂度，但可控"
        - criterion: 效果
          score: 5
          reasoning: "显著降低查询时间"
          
  recommendation:
    selected_alternative: 引入 Redis
    reasoning: "效果明显，复杂度可接受，业界成熟方案"
```

## Checklists

### 前置检查
- [ ] 决策问题已明确
- [ ] 备选方案已识别
- [ ] 评估维度已定义

### 过程检查
- [ ] 评分有理有据
- [ ] 权重与利益相关者对齐
- [ ] 记录了 tradeoffs

### 后置检查
- [ ] 决策理由清晰
- [ ] 回退计划已定义
- [ ] 监控指标已确定

## Common Failure Modes

| 失败模式 | 表现 | 处理建议 |
|----------|------|----------|
| 预设立场 | 分析前已决定 | 请第三方评审 |
| 维度不全 | 遗漏关键维度 | 使用标准检查清单 |
| 权重偏差 | 权重与实际不符 | 多利益相关者评审 |
| 过度分析 | 分析成本 > 决策价值 | 设置分析时间上限 |
| 忽视风险 | 低估方案风险 | 单独评估风险维度 |

## Notes

### 决策记录价值
- 后期回顾决策质量
- 新成员了解历史决策
- 避免重复讨论
- 责任清晰

### 何时重新评估
- 新约束出现
- 技术环境变化
- 假设被证伪
- 决策效果不佳

### 与 requirement-to-design 的关系
- tradeoff-analysis 帮助选择方案
- requirement-to-design 详细设计选定的方案
- 复杂决策可先 tradeoff-analysis 再 requirement-to-design
