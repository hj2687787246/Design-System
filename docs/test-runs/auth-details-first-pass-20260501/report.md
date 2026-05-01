# 登录页细节首轮补测报告

## 基本信息

| 项目 | 内容 |
| --- | --- |
| 测试日期 | 2026-05-01 |
| 前端地址 | `http://127.0.0.1:5187` |
| 测试账号 | `admin / 123321` |
| 测试方式 | `agent-browser` 浏览器操作 + localStorage/DOM 取证 |
| 测试策略 | 只验证登录页交互、登录态和本地记住账号行为，不修改业务数据 |

## 结论

通过。本轮补测 `AUTH-007`、`AUTH-008`、`AUTH-009`、`AUTH-010`、`AUTH-011`，登录失败提示、记住账号、取消记住账号、密码显隐切换和已登录访问登录页跳转均符合预期。

## 用例结果

| 用例 | 结果 | 证据 |
| --- | --- | --- |
| `AUTH-007` 登录失败提示后端错误 | 通过 | 错误密码返回并展示 `账号或密码错误`，`accessToken/refreshToken/user` 均未写入，见 `AUTH-007.json`、`screenshots/login-failed.png` |
| `AUTH-008` 记住账号 | 通过 | 勾选记住账号登录成功后 `design_dispatch_remember_account=admin`；清理登录态回到登录页后账号输入框回填 `admin`，见 `AUTH-008.json`、`screenshots/remember-account-prefill.png` |
| `AUTH-009` 取消记住账号 | 通过 | 取消勾选后登录成功，`design_dispatch_remember_account` 为 `null`，见 `AUTH-009.json` |
| `AUTH-010` 密码显隐切换 | 通过 | 点击眼睛图标后密码输入框从 `password` 切为 `text`，`aria-pressed` 从 `false` 变为 `true`，见 `AUTH-010.json`、`screenshots/password-visible.png` |
| `AUTH-011` 已登录访问登录页自动回首页 | 通过 | 已登录管理员访问 `/` 自动跳转 `/orders`，页面标题 `全部订单`，见 `AUTH-011.json`、`screenshots/logged-in-root-redirect.png` |

## 构建与日志

| 项目 | 结果 | 证据 |
| --- | --- | --- |
| 控制台错误 | 通过 | `console.txt` 仅包含 Vite 连接日志 |
| 网络请求 | 通过 | `network-requests.txt` 包含预期的错误登录失败请求和成功登录请求 |
| 构建 | 通过 | `build.log` 包含 `built in` |

构建仍有 Vite chunk 体积提示，不影响本轮登录页细节首测结论。

## 证据文件

| 类型 | 文件 |
| --- | --- |
| 单用例结果 | `docs/test-runs/auth-details-first-pass-20260501/AUTH-*.json` |
| 页面截图 | `docs/test-runs/auth-details-first-pass-20260501/screenshots/*.png` |
| DOM 快照 | `docs/test-runs/auth-details-first-pass-20260501/final-orders-snapshot.txt` |
| 网络记录 | `docs/test-runs/auth-details-first-pass-20260501/network-requests.txt` |
| 控制台日志 | `docs/test-runs/auth-details-first-pass-20260501/console.txt` |
| 构建日志 | `docs/test-runs/auth-details-first-pass-20260501/build.log` |
