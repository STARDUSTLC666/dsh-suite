# dsh-suite

[English](README.en.md)

![dsh-suite 鲸鱼娘插件封面](https://raw.githubusercontent.com/STARDUSTLC666/dsh-suite/master/assets/cover-whale-girl.png)

一次安装 18 个独立 DSH 插件，并统一组合它们的默认配置。

[![npm](https://img.shields.io/npm/v/@stardustlc/dsh-suite)](https://www.npmjs.com/package/@stardustlc/dsh-suite) [![downloads](https://img.shields.io/npm/dm/@stardustlc/dsh-suite)](https://www.npmjs.com/package/@stardustlc/dsh-suite)

## 功能

- 覆盖邮件、日历、记忆、媒体创作、开发运维与消息通知。
- 固定组件版本，便于复现安装与共同加载检查。
- 各组件也可以单独安装与配置。

## 安装

桌面版可在「插件」面板按包名 `@stardustlc/dsh-suite` 安装。已配置 dsh 命令时也可使用：

```bash
dsh plugin --profile desktop add @stardustlc/dsh-suite
```

网页版把命令中的 `desktop` 改为 `web`。安装后重启 DSH。

## 开始使用

需要整套功能时安装本包，随后配置所需组件的账号和工具。只需少数功能时，可直接安装对应独立插件。组件列表见使用说明。

## 依赖与配置

profile 只启用 Suite 这一层，由它加载组件。组件的账号、外部程序与网络要求仍各自适用。

本版同步 Dream 的自动候选整理与已采纳经验回用，提供独立开关和模型预算；其余组件保留既有版本。实际操作与验收边界见[本次记录](docs/validation-2026-10-04-dream-auto.md)。各工作台跟随宿主语言，用户正文保留原文。

详细配置、工具参数与排错见[使用说明](docs/USAGE.md)。从源码独立开发时，Node 要求以 [package.json](package.json) 为准。

## 文档

- [使用与排错](docs/USAGE.md)
- [更新记录](CHANGELOG.md)
- [验证范围与历史记录](docs/VALIDATION.md)
- [问题反馈与功能建议](https://github.com/STARDUSTLC666/dsh-suite/issues)

## License

[MIT](LICENSE)
