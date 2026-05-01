# 订单筛选首轮补测报告

## 基本信息

| 项目 | 内容 |
| --- | --- |
| 测试日期 | 2026-05-01 |
| 前端地址 | `http://127.0.0.1:5187` |
| 管理员账号 | `admin / 123321` |
| 测试方式 | `agent-browser` 浏览器会话 + 页面同源 `fetch` + DOM 截图验证 |
| 测试策略 | 只覆盖首轮未测的订单筛选只读项，不触发新增、编辑、删除、派单、审核、导出等真实写接口 |

## 结论

通过。本轮补测 `ORDER-LIST-004`、`ORDER-LIST-005`、`ORDER-LIST-006`、`ORDER-LIST-007`、`ORDER-LIST-008`、`ORDER-LIST-010`、`ORDER-LIST-012`，全部返回 `HTTP 200` 和业务码 `200`，响应记录满足筛选字段约束。

## 用例结果

| 用例 | 结果 | 证据 |
| --- | --- | --- |
| `ORDER-LIST-004` 商户多选筛选 | 通过 | `shopIds: [10]` 返回 2 条，商户均为 `何永杰专卖店`，见 `ORDER-LIST-004.json` |
| `ORDER-LIST-005` 照片种类多选筛选 | 通过 | `productTypeNames: ["婚纱"]` 返回 2 条，照片类型均为 `婚纱`，见 `ORDER-LIST-005.json` |
| `ORDER-LIST-006` 订单状态多选筛选 | 通过 | `statuses: ["UNCOMPLETED"]` 返回 2 条，状态均为 `未完工`，见 `ORDER-LIST-006.json` |
| `ORDER-LIST-007` 设计师多选筛选 | 通过 | `designerIds: [28]` 返回 2 条，设计师均为 `设计师强sir`，见 `ORDER-LIST-007.json` |
| `ORDER-LIST-008` 下单时间范围筛选 | 通过 | `2026-05-01 00:00:00` 到 `2026-05-01 23:59:59` 返回 2 条，时间均在范围内，见 `ORDER-LIST-008.json` |
| `ORDER-LIST-010` 组合条件筛选 | 通过 | 商户、照片类型、状态、设计师组合返回 1 条且字段全部匹配，见 `ORDER-LIST-010.json` |
| `ORDER-LIST-012` 无匹配结果展示 | 通过 | `keyword: NO_MATCH_ORDER_20260501` 返回 `total=0`；页面真实输入并点击查询后无数据行，见 `ORDER-LIST-012.json`、`screenshots/empty-keyword-result.png`、`final-empty-snapshot.txt` |

## 接口验证

| 项目 | 结果 | 证据 |
| --- | --- | --- |
| 筛选项加载 | 通过 | `filter-options.json` 包含商户、照片类型、状态、设计师选项 |
| 默认订单列表 | 通过 | `debug-base-order-list.json` 返回 4 条基础记录 |
| 单条件筛选 | 通过 | `ORDER-LIST-004.json` 到 `ORDER-LIST-008.json` |
| 组合筛选 | 通过 | `ORDER-LIST-010.json` |
| 空结果 | 通过 | `ORDER-LIST-012.json` |

说明：`network-requests.txt` 是整个浏览器会话的请求记录，包含早前探索阶段的历史请求；本报告判定以 `order-filter-api-results.json` 和拆分后的 `ORDER-LIST-*.json` 为准。

## 构建与日志

| 项目 | 结果 | 证据 |
| --- | --- | --- |
| 控制台错误 | 通过 | `console.txt` 仅包含 Vite 连接日志 |
| 构建 | 通过 | `build.log` 包含 `built in` |

构建仍有 Vite chunk 体积提示，不影响本轮订单筛选首测结论。

## 证据文件

| 类型 | 文件 |
| --- | --- |
| 汇总结果 | `docs/test-runs/order-filter-first-pass-20260501/order-filter-api-results.json` |
| 单用例结果 | `docs/test-runs/order-filter-first-pass-20260501/ORDER-LIST-*.json` |
| 页面截图 | `docs/test-runs/order-filter-first-pass-20260501/screenshots/empty-keyword-result.png` |
| DOM 快照 | `docs/test-runs/order-filter-first-pass-20260501/final-empty-snapshot.txt` |
| 网络记录 | `docs/test-runs/order-filter-first-pass-20260501/network-requests.txt` |
| 控制台日志 | `docs/test-runs/order-filter-first-pass-20260501/console.txt` |
| 构建日志 | `docs/test-runs/order-filter-first-pass-20260501/build.log` |
