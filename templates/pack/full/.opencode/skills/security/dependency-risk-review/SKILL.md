# Skill: dependency-risk-review

## Purpose

审查依赖安全风险，识别已知漏洞、维护状态问题、许可证合规问题。

解决的核心问题：
- 已知漏洞（CVE）依赖
- 依赖维护状态风险
- 许可证合规问题
- 供应链安全风险
- 过时依赖问题

## When to Use

必须使用时：
- 新增外部依赖
- 定期安全审计（季度/月度）
- CVE 响应（新漏洞披露）
- 升级主要依赖版本
- 标记为高风险的 task

推荐使用时：
- 任何 package.json/package-lock.json 变更
- 任何 requirements.txt/go.mod/pom.xml 变更
- 项目依赖更新
- CI/CD 构建配置变更

## When Not to Use

不适用场景：
- 内部依赖无外部包
- 已通过 dependency-risk-review（短期内）
- 纯测试依赖变更（开发环境）
- 文档依赖变更

## Dependency Security Principles

### 1. 最小化原则
- 只引入必要的依赖
- 避免依赖膨胀
- 定期清理无用依赖

### 2. 可信来源原则
- 只使用官方/可信源
- 验证包签名
- 检查维护者声誉

### 3. 版本固定原则
- 固定具体版本
- 避免版本范围
- 定期更新固定版本

### 4. 审计原则
- 定期扫描漏洞
- 监控依赖变更
- 响应 CVE 通告

## Review Checklist

### 1. 已知漏洞检查 (Known Vulnerabilities)

#### 1.1 CVE 数据库查询
- [ ] 是否查询 NVD 数据库？
- [ ] 是否查询 Snyk 数据库？
- [ ] 是否查询 GitHub Advisory？
- [ ] 是否查询 npm audit？

#### 1.2 漏洞严重性
- [ ] 是否有 Critical 漏洞？
- [ ] 是否有 High 漏洞？
- [ ] 是否有 Medium 漏洞？
- [ ] 漏洞是否可利用？

#### 1.3 漏洞影响
- [ ] 漏洞是否影响生产代码？
- [ ] 漏洞是否影响开发工具？
- [ ] 漏洞是否有缓解措施？

### 2. 维护状态检查 (Maintenance Status)

#### 2.1 包活跃度
- [ ] 包是否仍在维护？
- [ ] 最近更新时间？
- [ ] 维护者活跃度？
- [ ] Issue 响应速度？

#### 2.2 版本状态
- [ ] 使用版本是否是最新？
- [ ] 使用版本是否已弃用？
- [ ] 是否有安全版本可用？
- [ ] 升级是否有破坏性变更？

#### 2.3 社区状态
- [ ] 包是否有足够下载量？
- [ ] 是否有活跃社区？
- [ ] 是否有安全问题响应机制？

### 3. 许可证合规检查 (License Compliance)

#### 3.1 许可证类型
- [ ] 许可证类型是否明确？
- [ ] 许可证是否合规？
- [ ] 是否有许可证冲突？
- [ ] 是否需要声明许可证？

#### 3.2 许可证风险
- [ ] 是否有 GPL 类许可证？
- [ ] 是否有未知许可证？
- [ ] 是否有商业许可证限制？
- [ ] 是否有专利条款？

### 4. 供应链安全检查 (Supply Chain Security)

#### 4.1 来源可信度
- [ ] 是否来自官方 registry？
- [ ] 是否有包签名？
- [ ] 发布者是否可信？
- [ ] 是否有依赖劫持风险？

#### 4.2 依赖树分析
- [ ] 是否有过多间接依赖？
- [ ] 间接依赖是否安全？
- [ ] 是否有循环依赖？
- [ ] 是否有依赖冲突？

#### 4.3 发布历史
- [ ] 是否有异常发布？
- [ ] 是否有版本跳跃？
- [ ] 是否有发布者变更？
- [ ] 是否有名称劫持？

### 5. 安全替代建议 (Secure Alternatives)

#### 5.1 替代评估
- [ ] 是否有更安全的替代？
- [ ] 替代是否功能等效？
- [ ] 替代是否维护更好？
- [ ] 替代迁移成本？

#### 5.2 迁移建议
- [ ] 迁移是否可行？
- [ ] 迁移是否有破坏性？
- [ ] 是否有迁移指南？
- [ ] 迁移时间评估？

## Common Vulnerabilities

| 漏洞类型 | 描述 | 检测方法 | 修复建议 |
|---------|------|----------|----------|
| **已知 CVE** | 有公开漏洞编号 | npm audit/snyk | 升级到安全版本 |
| **弃用包** | 包已不再维护 | 检查维护状态 | 寻找替代 |
| **高危依赖** | 严重漏洞未修复 | CVE 数据库 | 立即升级/替换 |
| **许可证违规** | 许可证不合规 | 许可证扫描 | 替换或获取许可 |
| **供应链攻击** | 依赖被劫持 | 发布历史检查 | 锁定版本验证 |
| **版本过旧** | 版本严重过时 | 版本比对 | 定期更新 |

## Steps

### Step 1: 识别依赖变更
1. 读取 changed_files
2. 识别依赖文件变更
3. 解析新增/更新依赖
4. 获取依赖树

### Step 2: 检查已知漏洞
1. 运行漏洞扫描工具
2. 查询 CVE 数据库
3. 分析漏洞严重性
4. 确定影响范围

### Step 3: 检查维护状态
1. 查询包维护状态
2. 检查版本更新频率
3. 检查社区活跃度
4. 评估弃用风险

### Step 4: 检查许可证合规
1. 查询包许可证
2. 分析许可证类型
3. 检查合规性
4. 识别冲突

### Step 5: 检查供应链安全
1. 验证包来源
2. 分析依赖树
3. 检查发布历史
4. 评估劫持风险

### Step 6: 建议安全替代
1. 搜索替代方案
2. 评估替代可行性
3. 提供迁移建议
4. 估算迁移成本

### Step 7: 生成安全报告

## Output Format

```yaml
dependency_risk_review:
  dispatch_id: string
  task_id: string
  
  scope:
    dependencies_reviewed:
      - name: string
        version: string
        type: production | development | peer | optional
        source: npm | pip | maven | go | cargo | other
        
  findings:
    - id: string
      severity: critical | high | medium | low | info
      category: known_vulnerability | maintenance_status | license_compliance |
                supply_chain | version_outdated
      
      dependency:
        name: string
        version: string
        type: string
        
      vulnerability:
        cve: string
        cvss_score: number
        description: string
        affected_versions: string
        fixed_versions: string
        publish_date: string
        
      license:
        type: string
        spdx_id: string
        compliant: boolean
        risk_level: string
        
      maintenance:
        last_update: string
        is_deprecated: boolean
        is_unmaintained: boolean
        maintainer_count: number
        
      impact:
        description: string
        affected_code: string
        exploitability: string
        
      remediation:
        recommendation: string
        secure_version: string
        alternative: string
        migration_effort: quick | moderate | extensive
        priority: immediate | soon | scheduled | later
        
  dependency_summary:
    total_dependencies: number
    vulnerable_count: number
    deprecated_count: number
    license_issues: number
    
  risk_assessment:
    overall_risk: critical | high | medium | low
    
  gate_decision:
    decision: pass | needs-fix | block
    conditions: string[]
    
  recommendations:
    must_fix: string[]
    should_fix: string[]
    consider: string[]
    
  alternatives:
    - current: string
      alternative: string
      reason: string
      migration_notes: string
```

## Examples

### 示例 1：发现高危漏洞

```yaml
dependency_risk_review:
  scope:
    dependencies_reviewed:
      - name: "lodash"
        version: "4.17.15"
        type: "production"
        source: "npm"
      - name: "axios"
        version: "0.21.1"
        type: "production"
        source: "npm"
        
  findings:
    - id: DEP-001
      severity: critical
      category: known_vulnerability
      
      dependency:
        name: "lodash"
        version: "4.17.15"
        type: "production"
        
      vulnerability:
        cve: "CVE-2020-8203"
        cvss_score: 7.4
        description: "Prototype Pollution in lodash"
        affected_versions: "<4.17.19"
        fixed_versions: ">=4.17.19"
        publish_date: "2020-07-16"
        
      impact:
        description: "Attackers can modify Object prototype, leading to RCE or DoS"
        affected_code: "All code using lodash merge/defaultsDeep"
        exploitability: "High - commonly used functions affected"
        
      remediation:
        recommendation: "Upgrade to lodash 4.17.21 or later"
        secure_version: "4.17.21"
        effort: quick
        priority: immediate
        
    - id: DEP-002
      severity: high
      category: known_vulnerability
      
      dependency:
        name: "axios"
        version: "0.21.1"
        type: "production"
        
      vulnerability:
        cve: "CVE-2021-3749"
        cvss_score: 6.5
        description: "SSRF in axios"
        affected_versions: "<0.21.2"
        fixed_versions: ">=0.21.2"
        
      remediation:
        recommendation: "Upgrade to axios 0.21.2 or later"
        secure_version: "0.21.4"
        effort: quick
        priority: immediate
        
  dependency_summary:
    total_dependencies: 45
    vulnerable_count: 2
    deprecated_count: 0
    license_issues: 0
    
  risk_assessment:
    overall_risk: critical
    
  gate_decision:
    decision: block
    conditions:
      - "DEP-001 must be fixed: Upgrade lodash to 4.17.21"
      - "DEP-002 must be fixed: Upgrade axios to 0.21.2"
```

### 示例 2：许可证合规问题

```yaml
dependency_risk_review:
  findings:
    - id: DEP-003
      severity: medium
      category: license_compliance
      
      dependency:
        name: "some-gpl-package"
        version: "1.0.0"
        type: "production"
        
      license:
        type: "GPL-3.0"
        spdx_id: "GPL-3.0"
        compliant: false
        risk_level: "high"
        
      impact:
        description: "GPL-3.0 requires derivative works to be GPL-3.0"
        
      remediation:
        recommendation: "Replace with MIT-licensed alternative"
        alternative: "some-mit-package"
        migration_effort: moderate
        priority: scheduled
        
  risk_assessment:
    overall_risk: medium
    
  gate_decision:
    decision: needs-fix
    conditions:
      - "DEP-003 should be addressed: Review GPL license implications"
```

### 示例 3：弃用依赖

```yaml
dependency_risk_review:
  findings:
    - id: DEP-004
      severity: medium
      category: maintenance_status
      
      dependency:
        name: "request"
        version: "2.88.2"
        type: "production"
        
      maintenance:
        last_update: "2019-02-12"
        is_deprecated: true
        is_unmaintained: true
        maintainer_count: 0
        
      impact:
        description: "Package is deprecated and unmaintained, may have unfixed vulnerabilities"
        
      remediation:
        recommendation: "Replace with axios or node-fetch"
        alternative: "axios"
        migration_notes: "See migration guide at https://github.com/request/request/issues/3143"
        migration_effort: moderate
        priority: soon
        
  alternatives:
    - current: "request"
      alternative: "axios"
      reason: "Active maintenance, modern API"
      migration_notes: "API differences in redirect handling and streaming"
```

## Anti-Patterns

### AP-001: Vague Vulnerability Report (模糊漏洞报告)
**Definition**: 发现没有 CVE 编号或具体漏洞描述。
**Example**: "This package has security issues."
**Prevention**: 要求每个 finding 包含 CVE 编号或漏洞描述。

### AP-002: Missing CVSS Score (缺少 CVSS 分数)
**Definition**: 漏洞发现没有 CVSS 分数。
**Example**: "CVE-2020-XXXX in dependency" 无分数。
**Prevention**: 要求 vulnerability.cvss_score 字段。

### AP-003: No Secure Version (无安全版本)
**Definition**: 发现没有推荐的安全版本。
**Example**: "Package has vulnerability" 无修复版本。
**Prevention**: 要求 remediation.secure_version 字段。

### AP-004: Missing License Check (缺少许可证检查)
**Definition**: 报告没有检查许可证合规。
**Example**: 只检查漏洞，忽略许可证。
**Prevention**: 要求 license 检查作为标准流程。

### AP-005: No Alternative Suggestion (无替代建议)
**Definition**: 发现弃用依赖但没有替代建议。
**Example**: "Package deprecated" 无替代。
**Prevention**: 要求 alternatives 部分。

### AP-006: Gate Decision Omission (缺少 Gate 决策)
**Definition**: 报告没有 pass/needs-fix/block 决策。
**Example**: 报告结束没有 gate_decision。
**Prevention**: 要求 gate_decision 字段。

## Role Boundaries

### Security Does NOT
- **修改依赖文件**: Security 只提供发现，developer 执行升级
- **执行升级操作**: Security 不直接修改 package.json
- **声明功能验收**: 接受决策是 reviewer 角色的职责

### Parallel Execution with Reviewer
- Security 与 reviewer 并行执行高风险任务
- Security gate decision 告知 reviewer
- Critical CVE 通常导致 block 直到修复

### Escalation Rules
当以下情况必须升级：
- **Critical CVE 发现**: 立即通知 developer
- **供应链攻击迹象**: 需要 management 决策
- **许可证违规**: 需要 legal 团队决策
- **无安全版本**: 需要 architect 评估替代方案

## Input/Output Specifications

### Required Inputs
| Input | Source | Purpose |
|-------|--------|---------|
| `changed_files` | developer | 确定依赖文件变更 |
| `package-lock.json` 或等效 | repository | 获取依赖树 |
| `implementation-summary` | developer | 理解依赖用途 |

### Output Artifact
| Artifact | Contract | Purpose |
|----------|----------|---------|
| `dependency-risk-review-report` | Security review contract | 依赖风险发现报告 |

## Tool Recommendations

### Vulnerability Scanning
- **npm**: `npm audit`
- **Snyk**: `snyk test`
- **OWASP Dependency-Check**: Java ecosystem
- **pip-audit**: Python ecosystem
- **Go**: `go list -m all` + vuln databases

### License Scanning
- **license-checker**: npm
- **pip-licenses**: Python
- **licensee**: General

### Maintenance Status
- **npm**: `npm outdated`
- **libraries.io**: API queries
- **GitHub**: Repository activity