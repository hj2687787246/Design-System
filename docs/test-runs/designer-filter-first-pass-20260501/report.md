# 设计师筛选首轮补测报告

## 基本信息

| 项目 | 内容 |
| --- | --- |
| 测试日期 | 2026-05-01 |
| 前端地址 | `http://127.0.0.1:5187` |
| 设计师账号 | `shejishi / 123321` |
| 测试方式 | `agent-browser` 浏览器操作 + 页面同源 `fetch` + DOM 截图验证 |
| 测试策略 | 只覆盖首轮未测的设计师端只读筛选和商家明细，不确认完工、不修改订单 |

## 结论

通过。本轮补测 `DESIGNER-003`、`DESIGNER-004`、`DESIGNER-005`、`DESIGNER-006`、`DESIGNER-007`、`DESIGNER-011`，全部返回 `HTTP 200` 和业务码 `200`，记录字段满足筛选条件。页面实际点击“商家名称”后弹出商家明细分组，分组内容与接口结果一致。

## 用例结果

| 用例 | 结果 | 证据 |
| --- | --- | --- |
| `DESIGNER-003` 设计师商户筛选 | 通过 | `merchants: ["何永杰专卖店"]` 返回 1 条，商户匹配，见 `DESIGNER-003.json` |
| `DESIGNER-004` 设计师照片类型筛选 | 通过 | `photoTypes: ["婚纱"]` 返回 1 条，照片类型匹配，见 `DESIGNER-004.json` |
| `DESIGNER-005` 设计师状态筛选 | 通过 | `statuses: ["未完工"]` 返回 1 条，状态匹配，见 `DESIGNER-005.json` |
| `DESIGNER-006` 设计师时间范围筛选 | 通过 | `2026-05-01 00:00:00` 到 `2026-05-01 23:59:59` 返回 1 条，时间在范围内，见 `DESIGNER-006.json` |
| `DESIGNER-007` 设计师关键词筛选 | 通过 | `keyword: 测试客户2` 返回 1 条，客户信息匹配，见 `DESIGNER-007.json` |
| `DESIGNER-011` 设计师商家明细弹窗 | 通过 | `GET /api/designer/orders/shop-groups` 返回 2 个商家分组；页面弹窗展示 `何永杰专卖店1 单`、`测试商户9571 单`，见 `DESIGNER-011.json`、`screenshots/merchant-groups-dialog.png`、`merchant-groups-dialog-snapshot.txt` |

## 接口与页面验证

| 项目 | 结果 | 证据 |
| --- | --- | --- |
| 登录和基础列表 | 通过 | `default-list.json` 返回 2 条当前设计师可见订单；`screenshots/designer-orders-base.png` |
| 筛选项加载 | 通过 | `filter-options.json` |
| 单条件筛选 | 通过 | `DESIGNER-003.json` 到 `DESIGNER-007.json` |
| 商家明细分组 | 通过 | `DESIGNER-011.json` 和弹窗截图 |
| 价格列隐藏 | 通过 | 基础快照只展示商家、照片类型、状态、设计师、订单号、照片张数、客户、备注、下单时间、操作，无接单价/派单价列 |

## 构建与日志

| 项目 | 结果 | 证据 |
| --- | --- | --- |
| 控制台错误 | 通过 | `console.txt` 仅包含 Vite 连接日志 |
| 网络请求 | 通过 | 目标接口请求均为 `200`，见 `network-requests.txt` |
| 构建 | 通过 | `build.log` 包含 `built in` |

构建仍有 Vite chunk 体积提示，不影响本轮设计师筛选首测结论。

## 证据文件

| 类型 | 文件 |
| --- | --- |
| 汇总结果 | `docs/test-runs/designer-filter-first-pass-20260501/designer-filter-api-results.json` |
| 单用例结果 | `docs/test-runs/designer-filter-first-pass-20260501/DESIGNER-*.json` |
| 页面截图 | `docs/test-runs/designer-filter-first-pass-20260501/screenshots/*.png` |
| DOM 快照 | `docs/test-runs/designer-filter-first-pass-20260501/merchant-groups-dialog-snapshot.txt` |
| 网络记录 | `docs/test-runs/designer-filter-first-pass-20260501/network-requests.txt` |
| 控制台日志 | `docs/test-runs/designer-filter-first-pass-20260501/console.txt` |
| 构建日志 | `docs/test-runs/designer-filter-first-pass-20260501/build.log` |
