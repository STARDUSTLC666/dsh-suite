# 2026-10-15 Code Security 适配与增强

Suite 0.2.25 固定 dsh-code-security 0.4.1；其他 17 个组件保持 0.2.24 的公开版本。核心改变在独立安全插件，组合包负责同步安装版本。

## 独立插件

- Windows、Node 24.16.0：79 项测试通过，无跳过，包括 Betterleaks 1.9.0、Semgrep CE 1.181.0 和 OSV-Scanner 2.7.0 的真实原生程序。
- 官方 npm DSH 0.2.1-alpha.3：实际网页设置操作覆盖中文/英文、空项目、增强扫描、依赖审计、脱敏证据、缺程序、取消、复查、导出和 390px 布局；页面/控制台错误为 0。
- 自动模式：通过界面启用，在真实 DSH 中用合成 turn/start、turn/end 记录重放事件，检查独立状态以及 systemPrompt.context 中的高风险提醒；没有调用用户模型或生成新一轮任务。
- 官方 CLI 将本地发布 tarball 安装到全新隔离 profile，核对客户端、规则、十个工具、PEP 621、脱敏与 SARIF。公开 registry、CI tarball 和最终组合安装另外核验。

源代码和详细边界见 [Code Security 验证记录](https://github.com/STARDUSTLC666/dsh-code-security/blob/master/docs/VALIDATION.md)。

## 发布前的组合验证

Suite 的 12 项检查及官方 alpha.3 的 18 插件契约通过。使用官方 CLI 将最终本地 Suite tarball 与全部公开组件安装到新 profile 后，18 个插件共同启动，111 个工具、36 个技能、极简 PTC 预设挂载和调度工具清单检查通过。网页入口 200、验证链接换取会话 303、未认证入口 401，进程正常退出。

Code Security 0.4.1 已发布并独立核验：公开 npm 元数据、下载文件与 CI 发布产物摘要/字节一致；通过官方 CLI 再次从公开 registry 安装后，交叉规则脱敏、Python 依赖与报告导出检查通过。见 [六项 CI](https://github.com/STARDUSTLC666/dsh-code-security/actions/runs/38709848013) 和[发布工作流](https://github.com/STARDUSTLC666/dsh-code-security/actions/runs/38710120277)。Suite 自身的公开发布与最终安装由对应发布工作流及发布后检查分别记录。

## 边界

原生桌面窗口未操作，网页结果不算桌面操作通过。活动聊天中的文件预览跳转未做端到端验收；未打开对应聊天时的提示已验证。OSV 离线测试使用合成公告库，联网程序检查过真实公开样例依赖；这些不是全量规则准确率或漏洞库完整性评测。

自动检查默认关闭；只运行本地内置规则，不调用模型、不执行修复、不修改基线。增强工具由用户安装，OSV 联网审计需要明确选择。各引擎未安装、失败、超时和不完整状态不会混为通过。
