# 下载统计 / Download statistics

- **月下载量**：最近 30 个完整 UTC 日的 npm 下载次数。
- **累计下载量**：从 npm 记录的包首次发布日期到最近一个完整 UTC 日，覆盖该包的全部版本。
- 数据每天由 GitHub Actions 从 npm 官方统计 API 更新。长区间分段请求后求和，不使用月下载量推算累计值。
- 这不是独立用户数。每个仓库只展示对应 npm 包；Suite 的下载量与独立组件分开，不合并相加。
- 统计起止日期与原始数值见 [downloads.json](https://github.com/STARDUSTLC666/dsh-suite/blob/npm-downloads/downloads.json)。上游暂不可用时只保留近期已核验的数据；初次查询失败不会生成假的零值或“限流”图片。

English: monthly badges cover 30 complete UTC days. Lifetime badges cover every version of that npm package from its recorded creation date through the last complete UTC day. Daily GitHub Actions updates use the official npm API and sum non-overlapping bounded windows when needed. Counts are downloads, not unique users. Suite and component counts are separate. Source values and dates are in downloads.json; temporary upstream failures retain recent verified data instead of inventing zero.

[npm statistics API documentation](https://github.com/npm/registry/blob/main/docs/download-counts.md)
