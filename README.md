# dsh-suite

[English](README.en.md)

![dsh-suite 鲸鱼娘插件封面](https://raw.githubusercontent.com/STARDUSTLC666/dsh-suite/master/assets/cover-whale-girl.png)

一次安装 18 个独立 DSH 插件，并统一组合它们的默认配置。

[![npm](https://img.shields.io/npm/v/@stardustlc/dsh-suite)](https://www.npmjs.com/package/@stardustlc/dsh-suite) [![downloads](https://raw.githubusercontent.com/STARDUSTLC666/dsh-suite/npm-downloads/assets/dsh-suite-downloads.svg)](https://www.npmjs.com/package/@stardustlc/dsh-suite)

欢迎使用，遇到问题或有改进建议，请提交 [issues](https://github.com/STARDUSTLC666/dsh-suite/issues) 和 [PR](https://github.com/STARDUSTLC666/dsh-suite/pulls)。

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

本版更新九个插件的原生工作台：Dream、邮件、RSS、日历、引文、代码安全、PPT、HyperFrames 与 Remotion。界面跟随 DSH 中英文和深浅色，支持窄屏、未保存保护和真实成品预览。独立插件仍可分别安装；其余九个组件版本保持不变。

支持官方 DSH **0.2.1-rc.3**。设计、维护与实际操作边界见[工作台说明](docs/WORKBENCH_UI.md)和[本轮验收](docs/validation-2026-10-25-workbenches.md)。

详细配置、工具参数与排错见[使用说明](docs/USAGE.md)。从源码独立开发时，Node 要求以 [package.json](package.json) 为准。

## 文档

- [使用与排错](docs/USAGE.md)
- [更新记录](CHANGELOG.md)
- [验证范围与历史记录](docs/VALIDATION.md)
- [问题反馈与功能建议](https://github.com/STARDUSTLC666/dsh-suite/issues)

## License

[MIT](LICENSE)
