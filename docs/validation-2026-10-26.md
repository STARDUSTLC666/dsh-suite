# 0.3.1 验证范围

本版同步八个组件的问题修复，18 组件保持不变。Review 独立发布，不自动加入组合包。

- `@stardustlc/dsh-docker@0.4.3`
- `dsh-slack@0.3.5`
- `dsh-dingtalk@0.2.3`
- `dsh-minimal-ptc@0.5.7`
- `dsh-cite@0.6.1`
- `dsh-code-security@0.6.1`
- `dsh-ffmpeg@0.5.1`
- `dsh-codex-port@0.3.1`

独立插件的 Windows 回归、官方 DSH 0.2.1-rc.3 实际工具调用和 Cite 浏览器操作已验证；具体跳过及边界见各组件的版本验证记录。Docker 引擎、真实 Slack 与钉钉账号未配置，不能把模拟连接当作线上收发通过。

组合包测试、公开 tarball 完整性、官方 CLI 全新安装与启动由对应发布工作流和本次交付回执记录。未评测真实模型自主操作质量或 Electron 专属接口。
