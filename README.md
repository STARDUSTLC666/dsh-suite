# 下载统计 / Download statistics

- **统计来源**：合并同一日期窗口内的 **npm 官方源**（`api.npmjs.org`）与 **淘宝镜像 npmmirror**（`registry.npmmirror.com`）下载次数。
- **月下载量**：最近 30 个完整 UTC 日的双源下载次数之和。
- **累计下载量**：从 npm 记录的包首次发布日期到最近一个完整 UTC 日，覆盖该包的全部版本（双源按无重叠年度区间分别查询后相加）。
- GitHub Actions 每天安排两次检查，统一对齐到 npm 最新已发布的完整 UTC 日，避免把未出账或未结束的日期计入。
- 这不是独立用户数。每个仓库只展示对应包自身的下载量；Suite 的下载量与独立组件分开，不手动合并相加。
- 统计起止日期、总计与各源拆分明细（`sources.npm`、`sources.npmmirror`）见 [downloads.json](https://github.com/STARDUSTLC666/dsh-suite/blob/npm-downloads/downloads.json)，徽章 SVG 的 `<title>` 也附有双源明细。任一上游暂不可用时保留近期已核验的数据；初次查询失败不会生成假的零值或“限流”图片。

English: monthly and lifetime badges combine verified download counts from the **official npm registry** (`api.npmjs.org`) and **npmmirror** (`registry.npmmirror.com`) over the same bounded date window. Monthly badges cover 30 complete UTC days; lifetime badges cover every version of that package from its recorded npm creation date through the latest complete UTC day published by npm, summed across non-overlapping yearly windows. GitHub Actions checks twice daily. Counts represent downloads rather than unique users, and Suite counts remain separate from individual plugin counts. Exact date windows and per-source breakdowns (`sources.npm` and `sources.npmmirror`) are recorded in [downloads.json](https://github.com/STARDUSTLC666/dsh-suite/blob/npm-downloads/downloads.json) and in each badge's SVG `<title>`; temporary upstream outages retain recent verified data instead of inventing zero.

- [npm statistics API documentation](https://github.com/npm/registry/blob/main/docs/download-counts.md)
- [npmmirror registry API](https://registry.npmmirror.com)
