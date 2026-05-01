# 深度回归测试报告

## 基本信息

| 项目 | 内容 |
| --- | --- |
| 测试日期 | 2026-05-01 |
| 测试方式 | `agent-browser` 浏览器自动化 + 页面内接口探测 |
| 前端地址 | `http://127.0.0.1:5178` |
| 后端来源 | Vite 代理 `/api` 到 `http://118.89.133.246` |
| 管理员账号 | `admin / 123321` |
| 设计师账号 | `shejishi / 123321` |
| 测试策略 | 非破坏性回归；不确认新增、删除、派单、审核、完工等真实写入动作 |

## 结果概览

| 分类 | 数量 |
| --- | ---: |
| 通过 | 28 |
| 失败 | 0 |
| 阻塞 | 0 |
| 未执行 | 7 |
| 风险/观察项 | 1 |

结论：本轮覆盖的非破坏性管理端和设计师端测试全部通过，可以进入下一测试环节。唯一观察项为 Vite 开发环境 stderr 中出现 `ResizeObserver loop completed with undelivered notifications`，未复现为页面功能失败。

## 管理端结果

| 用例/范围 | 结果 | 证据 |
| --- | --- | --- |
| 管理员登录后进入全部订单 | 通过 | `screenshots/admin-orders.png` |
| 全部订单明细列表加载和字段展示 | 通过 | 表格包含商家、照片类型、状态、设计师、订单号、张数、接单价、接单合计、派单价、派单合计、客户、时间、备注、操作 |
| 商家名称表头分组弹窗 | 通过 | `screenshots/admin-shop-group-popup.png` |
| 商家分组展开明细 | 通过 | `screenshots/admin-shop-group-expanded.png` |
| 设计师表头分组弹窗 | 通过 | `screenshots/admin-designer-group-popup.png` |
| 设计师分组展开明细 | 通过 | `screenshots/admin-designer-group-expanded.png` |
| 关键词 `12211` 查询 | 通过 | `screenshots/admin-keyword-filter-12211.png`，列表过滤为订单号 `12211` |
| 未选择时导出按钮禁用 | 通过 | `screenshots/admin-orders.png` |
| 勾选订单后导出按钮启用 | 通过 | `screenshots/admin-selection-export-enabled.png` |
| 导出接口请求 | 通过 | `admin-network-after-export-domclick2.json`，`POST /api/admin/orders/export` 返回 200，payload 为 `{"tableType":"DETAIL","ids":[18]}` |
| 个人设置菜单和弹窗 | 通过 | `screenshots/admin-account-menu.png`、`screenshots/admin-account-dialog.png` |
| 个人设置用户名必填校验 | 通过 | `screenshots/admin-account-required-validation.png`，未提交保存接口 |
| 管理端核心接口带 Token 访问 | 通过 | `/api/orders/filter-options`、`/api/admin/orders/list`、`/api/admin/orders/shop-groups`、`/api/admin/orders/designer-groups` 均返回 200 |
| 管理端核心接口无 Token 访问 | 通过 | 返回 401，响应 `{code:301,message:"未登录或登录已过期"}` |

说明：`agent-browser click` 对部分 Element Plus 按钮存在不稳定情况。导出按钮通过 DOM 点击复核，已确认页面真实调用导出接口并返回 200，因此不计为产品失败。

## 设计师端结果

| 用例/范围 | 结果 | 证据 |
| --- | --- | --- |
| 设计师登录后进入 `/designer/orders` | 通过 | `screenshots/designer-orders.png` |
| 设计师订单列表加载 | 通过 | `screenshots/designer-orders.png` |
| 设计师端不展示价格字段 | 通过 | 表头不含接单价、接单合计、派单价、派单合计 |
| 设计师端商家分组弹窗和展开明细 | 通过 | `screenshots/designer-shop-group-popup.png` |
| 关键词 `123321` 查询 | 通过 | `screenshots/designer-keyword-filter-123321.png`，列表过滤为匹配订单 |
| 完工二次确认弹窗 | 通过 | `screenshots/designer-complete-confirm.png` |
| 取消完工不提交接口 | 通过 | `screenshots/designer-complete-cancelled.png`，`designer-network-after-complete-cancel.json` 未出现 `/api/designer/orders/complete` |
| 设计师访问 `/orders` 路由隔离 | 通过 | `screenshots/designer-route-guard-orders.png`，最终回到 `/designer/orders` |
| 设计师访问 `/user-management` 路由隔离 | 通过 | `screenshots/designer-route-guard-user-management.png`，最终回到 `/designer/orders` |
| 设计师 Token 访问管理端订单接口 | 通过 | `designer-admin-api-403.json`，`POST /api/admin/orders/list` 返回 403 `无权限` |

## 未执行项

| 用例/范围 | 原因 |
| --- | --- |
| 新增用户成功 | 会创建真实账号，本轮只验证表单校验 |
| 删除用户成功 | 会删除真实账号，本轮不执行 |
| 新增商户成功 | 会创建真实商户，本轮不执行 |
| 删除商户成功 | 会删除真实商户及关联数据，本轮不执行 |
| 新建订单成功 | 会创建真实订单，本轮不保存 |
| 审核通过/退回 | 会改变真实订单状态，本轮不执行 |
| 确认完工成功 | 会改变真实订单状态，本轮只验证二次确认和取消 |

## 风险与观察

| 项目 | 级别 | 说明 |
| --- | --- | --- |
| Vite stderr 出现 ResizeObserver 开发环境错误 | 低 | `vite-5178.err.log` 出现两次 `ResizeObserver loop completed with undelivered notifications`。页面功能未受影响，`agent-browser errors` 未捕获到阻断性页面错误，建议后续若生产环境仍出现再处理。 |

## 证据文件

| 类型 | 文件 |
| --- | --- |
| 管理端截图 | `docs/test-runs/deep-regression-20260501/screenshots/admin-*.png` |
| 设计师端截图 | `docs/test-runs/deep-regression-20260501/screenshots/designer-*.png` |
| 管理端网络证据 | `docs/test-runs/deep-regression-20260501/admin-network-after-export-domclick2.json` |
| 设计师权限证据 | `docs/test-runs/deep-regression-20260501/designer-admin-api-403.json` |
| 控制台与错误日志 | `docs/test-runs/deep-regression-20260501/admin-console.txt`、`docs/test-runs/deep-regression-20260501/designer-console.txt`、`docs/test-runs/deep-regression-20260501/vite-5178.err.log` |
