# 生产预览回归测试报告

## 基本信息

| 项目 | 内容 |
| --- | --- |
| 测试日期 | 2026-05-01 |
| 测试方式 | `npm run build` + `npm run preview` + `agent-browser` |
| 预览地址 | `http://127.0.0.1:5180` |
| 测试策略 | 非破坏性生产包验证；不确认新增、删除、派单、审核、完工等写入动作 |

## 结果概览

| 分类 | 数量 |
| --- | ---: |
| 通过 | 15 |
| 失败 | 0 |
| 阻塞 | 0 |
| 观察项 | 1 |

结论：生产构建产物可正常加载，预览环境 API 可用，管理员和设计师主路径、深层路由刷新、权限隔离均通过。

## 构建与服务

| 用例/范围 | 结果 | 证据 |
| --- | --- | --- |
| 生产构建 | 通过 | `npm run build` 成功，`dist/` 产物生成 |
| 生产预览服务启动 | 通过 | `preview-5180.out.log`，监听 `http://127.0.0.1:5180/` |
| 登录页静态资源加载 | 通过 | `screenshots/login-page.png` |

## 路由验证

| 用例/范围 | 结果 | 证据 |
| --- | --- | --- |
| 未登录直接访问 `/orders` | 通过 | `screenshots/direct-orders-route.png`，回跳 `/?redirect=/orders` |
| 未登录直接访问 `/designer/orders` | 通过 | `screenshots/direct-designer-route.png`，回跳 `/?redirect=/designer/orders` |
| 管理员已登录后直接访问 `/user-management` | 通过 | `screenshots/user-management-direct-auth-preview.png` |
| 管理员已登录后直接访问 `/orders` | 通过 | `screenshots/orders-direct-auth-preview.png` |

## 管理端生产包验证

| 用例/范围 | 结果 | 证据 |
| --- | --- | --- |
| 管理员登录成功 | 通过 | `screenshots/admin-login-attempt-preview.png` |
| 全部订单明细加载 | 通过 | `screenshots/admin-login-attempt-preview.png` |
| 汇总表切换和汇总接口 | 通过 | `screenshots/admin-summary-preview.png`，`POST /api/admin/orders/summary/list` 返回 200 |
| 商户管理懒加载页面 | 通过 | `screenshots/master-data-preview.png`，`POST /api/merchant-master/merchants/list` 返回 200 |
| 用户管理懒加载页面 | 通过 | `screenshots/user-management-preview.png`，`GET /api/users?pageNo=1&pageSize=15` 返回 200 |

说明：`agent-browser click` 对“详情 / 汇总”按钮仍有偶发不触发，已用 DOM click 复核真实功能，产品功能正常。

## 设计师端生产包验证

| 用例/范围 | 结果 | 证据 |
| --- | --- | --- |
| 设计师登录成功 | 通过 | `screenshots/designer-orders-preview.png` |
| 设计师订单列表加载 | 通过 | `screenshots/designer-orders-preview.png` |
| 设计师访问管理端路由隔离 | 通过 | `screenshots/designer-route-guard-preview.png`，访问 `/user-management` 后回到 `/designer/orders` |
| 设计师 Token 请求管理端订单接口 | 通过 | `designer-admin-api-403.json`，`POST /api/admin/orders/list` 返回 403 `无权限` |

## API 证据

| 接口 | 方法 | 结果 |
| --- | --- | --- |
| `/api/auth/login` | `POST` | 200 |
| `/api/orders/filter-options` | `GET` | 200 |
| `/api/admin/orders/list` | `POST` | 200 |
| `/api/admin/orders/summary/list` | `POST` | 200 |
| `/api/merchant-master/merchants/list` | `POST` | 200 |
| `/api/users?pageNo=1&pageSize=15` | `GET` | 200 |
| `/api/admin/orders/list` with designer token | `POST` | 403 |

## 观察项

| 项目 | 级别 | 说明 |
| --- | --- | --- |
| 构建 chunk 体积警告 | 低 | `npm run build` 提示 `auth-Bg3Agqg-.js` 超过 500 kB。当前不影响功能，后续上线前可考虑按路由或 Element Plus 组件做更细粒度拆包。 |

## 日志

| 项目 | 结果 |
| --- | --- |
| 管理端 `agent-browser errors` | 无错误，见 `admin-errors.txt` |
| 设计师端 `agent-browser errors` | 无错误，见 `designer-errors.txt` |
| 预览服务 stderr | 无错误，见 `preview-5180.err.log` |

## 证据文件

| 类型 | 文件 |
| --- | --- |
| 截图 | `docs/test-runs/preview-regression-20260501/screenshots/*.png` |
| 管理端网络证据 | `docs/test-runs/preview-regression-20260501/admin-preview-network.json` |
| 设计师网络证据 | `docs/test-runs/preview-regression-20260501/designer-preview-network.json` |
| 权限证据 | `docs/test-runs/preview-regression-20260501/designer-admin-api-403.json` |
| 控制台与错误日志 | `docs/test-runs/preview-regression-20260501/admin-console.txt`、`docs/test-runs/preview-regression-20260501/designer-console.txt`、`docs/test-runs/preview-regression-20260501/preview-5180.err.log` |
