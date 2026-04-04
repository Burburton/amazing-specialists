# PowerShell Encoding Pitfalls

本文档记录在 Windows PowerShell 环境下处理 UTF-8 文件时遇到的编码问题及解决方案。

## Problem Summary

| 问题 | 原因 | 表现 |
|------|------|------|
| UTF-8 BOM 问题 | Windows 记事本/PowerShell 默认写入 UTF-8 with BOM | 文件开头有 `\uFEFF` (BOM marker)，可能影响解析 |
| PowerShell 管道编码 | `| Out-File` 默认使用 UTF-16LE 或带 BOM 的 UTF-8 | 中文显示为 `????` 或乱码 |
| Here-Document 转义 | PowerShell heredoc `@"..."@` 会破坏 Markdown 模板语法 | `${styles.xxx}` 被解释为变量 |
| Set-Content 编码 | 默认编码在不同 PowerShell 版本不一致 | PowerShell 5.1 vs 7.x 行为不同 |

## Root Cause Analysis

### 1. UTF-8 BOM vs No BOM

**问题**：Windows 环境下的工具（记事本、PowerShell 5.1）默认写入带 BOM 的 UTF-8。

```
BOM (Byte Order Mark): EF BB BF (UTF-8 signature)
```

**影响**：
- 某些解析器可能将 BOM 视为非法字符
- Git diff 显示文件开头有不可见字符
- 文件比对工具可能误判文件差异

**示例**：

```powershell
# PowerShell 5.1: 写入 UTF-8 with BOM
"中文内容" | Out-File "test.txt" -Encoding UTF8

# 结果文件开头: EF BB BF E4 B8 AD E6 96 87...
#                    ^^^^^^^^ BOM
```

### 2. PowerShell Pipeline Encoding

**问题**：PowerShell 管道操作在处理中文时编码不一致。

```powershell
# ❌ 问题: 管道操作破坏编码
$content = Get-Content "README.md" -Encoding UTF8
$content | Set-Content "README.md" -Encoding UTF8
# 结果: 中文变成 "????"
```

**原因**：
- `Get-Content` 读取时的编码可能与 `Set-Content` 写入时的编码不匹配
- PowerShell 5.1 的 `-Encoding UTF8` 实际写入 UTF-8 with BOM
- 管道传输过程中字符串被重新编码

### 3. Here-Document Variable Interpolation

**问题**：PowerShell heredoc 会解释 `$` 符号为变量。

```powershell
# ❌ 问题: Markdown 模板语法被破坏
$content = @"
```markdown
- `${styles.variable}`  # ${...} 被 PowerShell 解释为变量
```
"@

# 结果: ${styles.variable} 被替换为空或变量值
```

**原因**：
- PowerShell heredoc (`@"..."@`) 默认进行变量插值
- Markdown 和 JavaScript 模板字符串使用 `${}` 语法
- 与 PowerShell 变量语法冲突

### 4. PowerShell Version Differences

| 版本 | `-Encoding UTF8` 行为 | 默认编码 |
|------|----------------------|----------|
| PowerShell 5.1 | UTF-8 with BOM | UTF-16LE |
| PowerShell 7.x | UTF-8 without BOM | UTF-8 without BOM |

**示例**：

```powershell
# PowerShell 5.1
"test" | Out-File "test.txt" -Encoding UTF8
# 结果: EF BB BF 74 65 73 74 (with BOM)

# PowerShell 7.x
"test" | Out-File "test.txt" -Encoding UTF8
# 结果: 74 65 73 74 (without BOM)
```

## Solutions

### Solution 1: Python Script (Recommended)

**适用场景**：大文件修改、需要精确控制编码

```python
import re

# 读取 UTF-8 文件（无 BOM）
with open('README.md', 'r', encoding='utf-8') as f:
    content = f.read()

# 修改内容
content = re.sub(r'old', 'new', content)

# 写入 UTF-8 文件（无 BOM）
with open('README.md', 'w', encoding='utf-8') as f:
    f.write(content)

print('File updated successfully')
```

**优点**：
- 完全控制编码，跨平台一致
- 不引入 BOM
- 支持复杂文本处理（正则、字符串操作）

### Solution 2: Edit Tool (Recommended for Small Changes)

**适用场景**：小范围修改、单行或少量行替换

```
使用 OpenCode 的 Edit 工具：
- 平台无关
- 直接操作文件
- 不破坏编码
```

**注意**：部分平台可能存在 "must read file first" 问题，需要先调用 Read 工具。

### Solution 3: .NET API in PowerShell

**适用场景**：必须在 PowerShell 中操作时

```powershell
# ✅ 正确: 使用 .NET API 精确控制编码
$content = [System.IO.File]::ReadAllText("README.md", [System.Text.Encoding]::UTF8)

# 修改内容
$newContent = $content -replace "old", "new"

# 写入 UTF-8 without BOM
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText("README.md", $newContent, $utf8NoBom)
```

**关键**：
- `UTF8Encoding($false)` 构造函数参数 `encoderShouldEmitUTF8Identifier = false` 表示不写入 BOM
- 完全绕过 PowerShell 的编码层

### Solution 4: cmd /c type (Append Only)

**适用场景**：追加纯 ASCII 内容

```powershell
# ✅ 适用: 追加纯 ASCII 内容
cmd /c "type additions.txt >> README.md"

# ❌ 不适用: 追加中文内容（编码问题依然存在）
```

### Solution 5: Escape Here-Document

**适用场景**：必须使用 heredoc 时

```powershell
# 方法 1: 使用单引号 heredoc（不进行变量插值）
$content = @'
```markdown
- `${styles.variable}`  # ${...} 保持原样
```
'@

# 方法 2: 转义 $ 符号
$content = @"
```markdown
- ```${styles.variable}```  # 使用反引号转义
```
"@
```

## Best Practices

### 1. 文件修改策略

| 场景 | 推荐方法 | 原因 |
|------|----------|------|
| 大文件修改 | Python 脚本 | 完全控制编码，支持复杂操作 |
| 小范围修改 | Edit 工具 | 平台无关，简单直接 |
| 必须用 PowerShell | .NET API | 精确控制，避免 BOM |
| 追加 ASCII 内容 | cmd /c type | 简单可靠 |

### 2. 避免的模式

```powershell
# ❌ 避免: PowerShell 管道处理中文文件
Get-Content $file | Set-Content $file

# ❌ 避免: 使用 PowerShell heredoc 处理含 ${} 的内容
@"
${styles.variable}
"@

# ❌ 避免: 在 PowerShell 5.1 中使用 -Encoding UTF8
"content" | Out-File $file -Encoding UTF8  # 写入 BOM

# ❌ 避免: 直接使用 Out-File 处理中文
"中文" | Out-File $file
```

### 3. 验证编码

```powershell
# 检查文件是否有 BOM
$bytes = [System.IO.File]::ReadAllBytes("README.md")
if ($bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
    Write-Host "File has UTF-8 BOM"
} else {
    Write-Host "File has no BOM"
}

# 检查文件编码（需要 PowerShell 7.x 或第三方工具）
# 推荐使用 Python:
# python -c "import sys; print(sys.stdin.encoding)"
```

### 4. 工作流程建议

```
1. 修改前: 用 Read 工具确认文件编码
2. 选择方法:
   - 大文件 → Python 脚本
   - 小修改 → Edit 工具
   - 必须用 PS → .NET API
3. 修改后: 用 Read 工具验证编码未被破坏
4. Git commit: 检查 diff，确认无意外编码变化
```

## Platform-Specific Notes

### Windows

- PowerShell 5.1 (默认): 避免用于文件编码操作
- PowerShell 7.x: 更好的 UTF-8 支持，但仍需注意 BOM
- Git Bash: 推荐用于文件操作，UTF-8 默认无 BOM

### macOS / Linux

- Bash: 默认 UTF-8 without BOM，推荐使用
- Python: 跨平台一致，推荐使用

## Common Errors

### Error 1: 中文变成 "????"

```
原因: 编码不匹配
解决: 使用 Python 或 .NET API 明确指定 UTF-8
```

### Error 2: Git Diff 显示文件开头有变化但看不到内容

```
原因: BOM 被添加或移除
解决: 使用 UTF-8 without BOM 重新保存文件
```

### Error 3: 模板字符串 `${...}` 被替换为空

```
原因: PowerShell heredoc 变量插值
解决: 使用单引号 heredoc (@'...'@) 或转义
```

### Error 4: Edit 工具报 "must read file first"

```
原因: 平台特定问题
解决: 先调用 Read 工具，或使用 Python 脚本替代
```

## Related Documents

- [docs/platform-adapter-guide.md](platform-adapter-guide.md) - 平台适配指南
- [AGENTS.md](../AGENTS.md) - OpenCode 执行规则
- [UTF-8 BOM FAQ](https://stackoverflow.com/questions/2223882/whats-the-difference-between-utf-8-and-utf-8-without-bom)

## Changelog

| Date | Change |
|------|--------|
| 2026-04-04 | Initial creation based on feature 037 experience |