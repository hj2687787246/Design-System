# 权限接口首轮补测报告

## 基本信息

| 项目 | 内容 |
| --- | --- |
| 测试日期 | 2026-05-01 |
| 前端地址 | `http://127.0.0.1:5187` |
| 已用账号 | `admin / 123321`、`shejishi / 123321`、`diaodu / 123321` |
| 测试方式 | `agent-browser` 浏览器会话内同源接口探测 |
| 测试策略 | 只做权限拒绝探测，不创建账号，不导出真实文件 |

## 结论

通过。本轮补测 `USER-016` 和 `EXPORT-012`，后端均返回 `HTTP 403`、业务码 `403`、消息 `无权限`。

## 用例结果

| 用例 | 结果 | 证据 |
| --- | --- | --- |
| `USER-016` 调度无权访问用户接口 | 通过 | 调度账号 `diaodu` 登录后请求 `GET /api/users?pageNo=1&pageSize=15` 返回 `403 无权限`，见 `USER-016.json` |
| `EXPORT-012` 设计师直接调用导出被拒绝 | 通过 | 设计师账号 `shejishi` 请求 `POST /api/admin/orders/export` 返回 `403 无权限`，见 `EXPORT-012.json` |

## 补充说明

此前因用户列表中未识别到 `DISPATCHER` 账号，曾记录 `USER-016.blocked.json`。用户随后提供调度账号 `diaodu / 123321`，已用该账号完成验证，最终结果以 `USER-016.json` 为准。

## 证据文件

| 类型 | 文件 |
| --- | --- |
| 调度用户接口权限探测 | `docs/test-runs/permission-probes-first-pass-20260501/USER-016.json` |
| 设计师导出权限探测 | `docs/test-runs/permission-probes-first-pass-20260501/EXPORT-012.json` |
| 调度会话网络记录 | `docs/test-runs/permission-probes-first-pass-20260501/dispatcher-network-requests.txt` |
| 调度会话控制台日志 | `docs/test-runs/permission-probes-first-pass-20260501/dispatcher-console.txt` |
| 调度登录后页面截图 | `docs/test-runs/permission-probes-first-pass-20260501/dispatcher-orders.png` |
