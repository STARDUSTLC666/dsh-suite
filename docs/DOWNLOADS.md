# 下载统计 / Download statistics

- **月下载量**：最近 30 个完整 UTC 日的 npm 下载次数。
- **累计下载量**：从 npm 记录的包首次发布日期到最近一个完整 UTC 日，覆盖该包的全部版本。
- GitHub Actions 每天安排两次检查，使用 npm 最新已发布的 UTC 日。累计量由 npm 官方统计 API 的多个区间相加得出。
- 这不是独立用户数。每个仓库只展示对应 npm 包；Suite 的下载量与独立组件分开，不合并相加。
- 统计起止日期与原始数值见 [downloads.json](https://github.com/STARDUSTLC666/dsh-suite/blob/npm-downloads/downloads.json)。上游暂不可用时只保留近期已核验的数据；初次查询失败不会生成假的零值或“限流”图片。

English: monthly badges cover 30 complete UTC days. Lifetime badges cover every version of that npm package from its recorded creation date through the latest available UTC day. GitHub Actions checks twice daily and uses the most recent day published by npm. The workflow uses the official npm API and sums non-overlapping bounded windows when needed. Counts are downloads, not unique users. Suite and component counts are separate. Source values and dates are in downloads.json; temporary upstream failures retain recent verified data instead of inventing zero.

[npm statistics API documentation](https://github.com/npm/registry/blob/main/docs/download-counts.md)
