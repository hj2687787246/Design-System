# 设计师端权限隔离回归报告

## 基本信息

| 项目 | 内容 |
| --- | --- |
| 测试日期 | 2026-05-01 |
| 前端地址 | `http://127.0.0.1:5185` |
| 设计师账号 | `shejishi / 123321` |
| 测试方式 | `agent-browser` 浏览器操作 + DOM/网络证据核验 |
| 测试策略 | 非破坏性验证；完工只打开二次确认并取消，不点击确认完工 |

## 结论

通过。设计师端登录、订单列表、价格字段隔离、完工取消、管理端路由隔离和管理端接口权限均符合预期。

## 用例结果

| 用例 | 结果 | 证据 |
| --- | --- | --- |
| 设计师登录后进入 `/designer/orders` | 通过 | `designer-url-after-login.txt`、`screenshots/designer-orders-list.png` |
| 设计师订单列表加载 | 通过 | `designer-list-check.json`，`rowCount` 大于 0 |
| 设计师端不展示价格字段 | 通过 | `designer-list-check.json`，`hasPriceHeaders=false` |
| 完工按钮打开二次确认 | 通过 | `screenshots/designer-complete-confirm.png` |
| 点击取消不提交完工接口 | 通过 | `complete-api-filter.json` 内容为 `[]` |
| 访问 `/orders` 被路由守卫拦截 | 通过 | `route-guard-orders-url.txt` 最终为 `/designer/orders` |
| 访问 `/master-data` 被路由守卫拦截 | 通过 | `route-guard-master-data-url.txt` 最终为 `/designer/orders` |
| 访问 `/user-management` 被路由守卫拦截 | 通过 | `route-guard-user-management-url.txt` 最终为 `/designer/orders` |
| 设计师 Token 访问管理端订单接口 | 通过 | `designer-admin-api-authz.json` 返回 HTTP 403，响应 `无权限` |

## 网络说明

`write-api-filter.json` 中出现的写方法请求包括：

| 接口 | 判定 |
| --- | --- |
| `POST /api/auth/login` | 登录 |
| `POST /api/designer/orders/list` | 设计师订单列表查询 |
| `POST /api/admin/orders/list` 401 | 未手动携带 Authorization 的原生 fetch 探测，符合未登录结果 |
| `POST /api/admin/orders/list` 403 | 携带设计师 Token 的权限探测，符合无权限预期 |

未出现 `/api/designer/orders/complete`，说明完工取消未提交真实写入。

## 自动化备注

第一次使用 `agent-browser click` 点击完工按钮未触发 Element Plus `ElMessageBox`，页面当时残留筛选/日期浮层。关闭浮层后仍未稳定触发，因此使用 DOM `button.click()` 触发同一按钮事件完成验证。该问题按自动化交互不稳定记录，不判定为产品缺陷。

## 构建与日志

| 项目 | 结果 | 证据 |
| --- | --- | --- |
| 页面错误 | 通过 | `designer-errors.txt` 为空 |
| 构建 | 通过 | `build.log` 包含 `✓ built` |

构建仍有 Vite chunk 体积提示，不影响本轮权限隔离验证。

## 证据文件

| 类型 | 文件 |
| --- | --- |
| 截图 | `docs/test-runs/designer-isolation-regression-20260501/screenshots/*.png` |
| 列表字段核验 | `docs/test-runs/designer-isolation-regression-20260501/designer-list-check.json` |
| 完工接口筛选 | `docs/test-runs/designer-isolation-regression-20260501/complete-api-filter.json` |
| 路由守卫 URL | `docs/test-runs/designer-isolation-regression-20260501/route-guard-*-url.txt` |
| 权限接口 | `docs/test-runs/designer-isolation-regression-20260501/designer-admin-api-authz.json` |
| 网络请求 | `docs/test-runs/designer-isolation-regression-20260501/network-final.json` |
| 控制台与错误 | `docs/test-runs/designer-isolation-regression-20260501/designer-console.txt`、`docs/test-runs/designer-isolation-regression-20260501/designer-errors.txt` |
| 构建日志 | `docs/test-runs/designer-isolation-regression-20260501/build.log` |
