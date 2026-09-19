# Changelog

## 0.1.5（2026-09-19）

- 跟随 dsh-email 0.13.1：该版本内置一份社区公共客户端注册（贡献者 [gurio-wine](https://github.com/gurio-wine) 注册并授权项目内置使用），Outlook / Exchange Online 的 OAuth2 登录开箱即用，不再要求每个用户自己注册 Azure 应用；用户仍可在设置页卡片里填自己的 `clientId` 覆盖，卡片会显示当前生效的应用 ID。
- 依赖 pin 与 `minimumReleaseAgeExclude` 放行名单同步为 dsh-email@0.13.1；其余 17 个组件线上仍是最新，版本未变。
- 双语文档表格补上「OAuth2 开箱即用」；组合补丁 `cordis.patch.yml` 配置未变，本版仅依赖、锁文件与文档更新。

## 0.1.4（2026-09-19）

- 依赖对齐 npm latest（2026-09-19 用 `npm view <pkg> version --registry https://registry.npmjs.org/` 逐个核对 18 个组件）：dsh-email 0.10.7 → 0.13.0、dsh-voice 0.3.3 → 0.3.4、dsh-ppt 0.4.2 → 0.4.3、dsh-ffmpeg 0.4.2 → 0.4.3、dsh-calendar 0.5.3 → 0.5.4、dsh-minimal-ptc 0.4.5 → 0.4.7；其余 12 个组件线上即已是最新，版本未变。
- 同步 pnpm-lock.yaml 与 `minimumReleaseAgeExclude` 放行名单（含今天新发布的 5 个版本与 dsh-minimal-ptc 0.4.7）。
- 组合补丁 `cordis.patch.yml` 的配置内容未变，本版仅依赖与锁文件更新。

## 0.1.3（2026-09-11）

- 适配并验证官方 Harness 0.1.5-rc.1：整套同载、工具/技能契约与 Web 鉴权检查通过。
- Node 要求与宿主统一为 `^22.19.0 || >=24.0.0`；更新中英文兼容性说明。
- 修复套件与组件同时作为 profile 层启用时的重复 id 启动失败：套件使用 npm 依赖自动安装已验证的 18 个组件，用户只需安装套件；补充旧安装方式的迁移命令。
- 启动验收实际挂载极简 PTC agent，校验 `run_code` 入口与插件工具继承；支持通过官方 CLI 安装真实发布 tarball，覆盖依赖解析与组合层启用。

## 0.1.2（2026-09-08）

- 在官方 `@deepseek-ai/dsh@0.1.3-alpha.2` 上复验：18 个组件同载，96 个工具、34 个技能；隔离 Web 启动、token 鉴权（303/401/200）与进程退出全部通过；
- 同步更新中英文 README 的兼容性说明；
- 本次为文档与兼容性声明补丁，组合补丁内容未变。

## 0.1.0（2026-08-27）

- 组合补丁一次注入 18 个组件的默认配置，各行与组件自带 `cordis.patch.yml` 一致；
- 扁平化设计：移除 git 子依赖（pnpm `blockExoticSubdeps`），套件与组件经一条 `dsh plugin add` 命令直装；
- 五条产品线：办公流（含做梦记忆）/ 媒体工坊 / DevOps / 通知 / 预设；
- 一致性测试：补丁结构与 18 组件包名对应、字段约束、README 安装命令与组件清单互验（7 测试）；
- 在 `@deepseek-ai/dsh@0.1.1-rc.2` 上验证：18 组件同载启动，HTTP 200，零报错。
- 2026-08-31：在 `@deepseek-ai/dsh@0.1.2-alpha.2` 上复验：18 组件同载启动，token 鉴权正常，零报错；补丁无需改动。
