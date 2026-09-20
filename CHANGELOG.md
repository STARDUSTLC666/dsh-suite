# Changelog

## 0.1.10（2026-09-20）

- 跟随 dsh-calendar 0.8.2：修**主题色误用**（宿主遮罩 token `--dsw-alias-bg-mask-3` 在 DSH 0.1.6-alpha.2 里实测是 48% 黑，之前被当淡色 hover/底纹用，导致周视图「今天」列、月视图格子 hover、骨架屏、详情 tag 发深灰）与 **Esc 关错层**（打开详情/表单时按 Esc 会连整个日历浮层面板一起关；现在只关最上面一层，并处理宿主 Modal 让行、输入法组合、多面板层序）。
- 依赖 pin 与 `minimumReleaseAgeExclude` 放行名单同步为 dsh-calendar@0.8.2；其余 17 个组件线上仍是最新，版本未变。
- 组合补丁 `cordis.patch.yml` 配置未变，本版仅依赖、锁文件与文档更新。

## 0.1.9（2026-09-20）

- 跟随 dsh-calendar 0.8.1：新增**真 DOM 行为测试层**（jsdom + 真 React，7 条），并修它抓到的三个问题 —— ①同一批次内拖动不提交（提交前的落点判断读了过期的 React state）；②`requestAnimationFrame` 显式走 `window.*`；③四处 React key 警告。功能上无行为变化（拖拽改期仍是 0.8.0 的能力）。
- 依赖 pin 与 `minimumReleaseAgeExclude` 放行名单同步为 dsh-calendar@0.8.1；其余 17 个组件线上仍是最新，版本未变。
- 组合补丁 `cordis.patch.yml` 配置未变，本版仅依赖、锁文件与文档更新。

## 0.1.8（2026-09-19）

- 跟随 dsh-calendar 0.8.0：周视图**拖拽改期**（上下改时间、左右换天、15 分钟吸附、拖底部改时长、rAF 边缘自动滚动、键盘微调、乐观更新 + 失败回滚 + 5 秒撤销）。该版经过**两轮独立评审**：修掉「面板渲染即崩（TDZ）」「点事件同时弹新建」「浮层面板里横向换天失效」「卸载后残留监听器可能替用户提交改期」等硬伤；**重复日程与超过 24 小时的日程暂不支持拖动改期**（CalDAV 里整个系列是一个对象，拖动会重锚系列起点）。
- 依赖 pin 与 `minimumReleaseAgeExclude` 放行名单同步为 dsh-calendar@0.8.0；其余 17 个组件线上仍是最新，版本未变。
- 组合补丁 `cordis.patch.yml` 配置未变，本版仅依赖、锁文件与文档更新。

## 0.1.7（2026-09-19）

- 跟随 dsh-calendar 0.7.0：面板**记住上次用的视图**（月/周/议程）、周视图**默认落在 07:00**（不裁剪事件，仍可上滚）、**窄容器适配**（设置页那种窄面板里芯片显示标题而非只剩「10:00 …」）；另修月视图格子 `button` → `div role=button`（按钮不能嵌套按钮）。
- 依赖 pin 与 `minimumReleaseAgeExclude` 放行名单同步为 dsh-calendar@0.7.0；其余 17 个组件线上仍是最新，版本未变。
- 组合补丁 `cordis.patch.yml` 配置未变，本版仅依赖、锁文件与文档更新。

## 0.1.6（2026-09-19）

- 跟随 dsh-calendar 0.6.0：设置页新增**月 / 周 / 议程**日历面板（点日程开详情、可直接增删改、保存前冲突检测），以及**面板内连接配置**（Google / iCloud / Nextcloud / 自建，先「测试连接」再保存，密钥不回填前端）；另新增 `scripts/google-oauth.mjs`，一条命令换 Google refresh token。
- 依赖 pin 与 `minimumReleaseAgeExclude` 放行名单同步为 dsh-calendar@0.6.0；其余 17 个组件线上仍是最新，版本未变。
- 双语文档表格补上面板与面板内配置说明；组合补丁 `cordis.patch.yml` 配置未变，本版仅依赖、锁文件与文档更新。

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
