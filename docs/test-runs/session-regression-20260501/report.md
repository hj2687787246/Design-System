# 会话与 Token 回归测试报告

## 基本信息

| 项目 | 内容 |
| --- | --- |
| 测试日期 | 2026-05-01 |
| 测试方式 | `agent-browser` 浏览器自动化 + 本地 token 状态注入 |
| 前端地址 | `http://127.0.0.1:5181` |
| 后端来源 | Vite 代理 `/api` 到 `http://118.89.133.246` |
| 测试策略 | 仅测试认证与会话，不写入业务数据 |

## 结果概览

| 分类 | 数量 |
| --- | ---: |
| 通过 | 8 |
| 失败后已修复 | 1 |
| 阻塞 | 0 |
| 观察项 | 1 |

结论：会话与 token 回归最终通过。测试过程中发现 refresh token 失效后只清理登录态但不跳转登录页的问题，已修复并复测通过。

## 通过项

| 用例/范围 | 结果 | 证据 |
| --- | --- | --- |
| 登录页加载 | 通过 | `screenshots/login-initial.png` |
| 密码显隐切换 | 通过 | `login-password-before-toggle.json`、`login-password-after-toggle.json`、`screenshots/password-visible-toggle.png` |
| 记住账号默认勾选 | 通过 | `login-password-before-toggle.json` 中 checkbox 为 `checked=true` |
| 管理员登录写入 token/user | 通过 | `localstorage-after-login.json`，access/refresh/user 存在 |
| 退出登录清理 token/user | 通过 | `localstorage-after-logout.json`，access/refresh 不存在 |
| 退出登录后账号回填 | 通过 | `screenshots/logout-return-login.png`，账号框回填 `admin` |
| access token 失效自动刷新 | 通过 | `access-refresh-network-retry.json`，业务请求 401 后 `/api/auth/refresh` 返回 200 |
| refresh 成功后重试原请求 | 通过 | `access-refresh-network-retry.json`，刷新后 `/api/admin/orders/list` 返回 200 |

## 发现并修复的问题

| 问题 | 修复前结果 | 修复后结果 |
| --- | --- | --- |
| refresh token 失效后未跳回登录页 | `refresh-fail-storage.json` 显示 token 已清空，但 URL 仍为 `/orders`；`screenshots/refresh-fail-state-after-401.png` 仍显示旧订单页面 | `refresh-fail-fixed-storage.json` 显示 token/user 已清空且 URL 为 `/`；`screenshots/refresh-fail-redirect-login-fixed.png` 显示登录页 |

修复文件：

| 文件 | 说明 |
| --- | --- |
| `src/libs/request/index.ts` | refresh 失败和普通 HTTP 401 分支统一调用 `redirectToLogin()`，避免只清理本地登录态但仍停留在业务页 |

## 接口证据

| 场景 | 接口链路 | 结果 |
| --- | --- | --- |
| access token 失效 | `/api/admin/orders/list` -> 401，`/api/auth/refresh` -> 200，重试 `/api/admin/orders/list` -> 200 | 通过 |
| refresh token 失效 | `/api/admin/orders/list` -> 401，`/api/auth/refresh` -> 401 | 已跳转登录页 |

## 验证

| 项目 | 结果 |
| --- | --- |
| 构建验证 | `npm run build` 通过 |
| 控制台错误 | `session-*-errors.txt` 无阻断错误 |
| 凭证脱敏 | JSON 证据中的 JWT 和密码已脱敏 |

## 观察项

| 项目 | 级别 | 说明 |
| --- | --- | --- |
| 构建 chunk 体积警告 | 低 | 仍存在超过 500 kB 的构建警告，与前一轮一致，不影响本轮会话功能 |

## 证据文件

| 类型 | 文件 |
| --- | --- |
| 截图 | `docs/test-runs/session-regression-20260501/screenshots/*.png` |
| access refresh 网络证据 | `docs/test-runs/session-regression-20260501/access-refresh-network-retry.json` |
| refresh 失效网络证据 | `docs/test-runs/session-regression-20260501/refresh-fail-fixed-network.json` |
| 本地存储证据 | `docs/test-runs/session-regression-20260501/localstorage-after-login.json`、`docs/test-runs/session-regression-20260501/localstorage-after-logout.json`、`docs/test-runs/session-regression-20260501/refresh-fail-fixed-storage.json` |
