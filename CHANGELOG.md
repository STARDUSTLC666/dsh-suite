# Changelog

## 0.1.0（2026-08-27）

- 组合补丁一次注入 18 个组件的默认配置，各行与组件自带 `cordis.patch.yml` 一致；
- 扁平化设计：移除 git 子依赖（pnpm `blockExoticSubdeps`），套件与组件经一条 `dsh plugin add` 命令直装；
- 五条产品线：办公流（含做梦记忆）/ 媒体工坊 / DevOps / 通知 / 预设；
- 一致性测试：补丁结构与 18 组件包名对应、字段约束、README 安装命令与组件清单互验（7 测试）；
- 在 `@deepseek-ai/dsh@0.1.1-rc.2` 上验证：18 组件同载启动，HTTP 200，零报错。
