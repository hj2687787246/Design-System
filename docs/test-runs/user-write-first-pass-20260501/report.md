# 用户管理写入首轮测试报告

## 基本信息

| 项目 | 内容 |
| --- | --- |
| 测试日期 | 2026-05-01 |
| 前端地址 | `http://127.0.0.1:5187` |
| 管理员账号 | `admin / 123321` |
| 测试方式 | `agent-browser` 浏览器操作 + 同源接口验证 |
| 测试策略 | 使用唯一前缀测试账号，删除仅针对本轮创建的数据 |

## 结论

通过。本轮覆盖 `USER-005`、`USER-006`、`USER-010`、`USER-011`、`USER-014`，新增调度、增设计师、重复账号拒绝、编辑用户、删除普通用户均符合预期。测试账号已清理。

## 测试数据

| 类型 | 登录账号 | 处理结果 |
| --- | --- | --- |
| 调度账号 | `qa_dispatcher_20260501053041` | 创建成功，编辑成功，删除成功 |
| 设计师账号 | `qa_designer_20260501053041` | 创建成功，重复创建被拒绝，清理删除成功 |

## 用例结果

| 用例 | 结果 | 证据 |
| --- | --- | --- |
| `USER-005` 新增调度账号成功 | 通过 | 通过新增弹窗创建 `qa_dispatcher_20260501053041`，页面列表刷新展示，见 `screenshots/dispatcher-created.png`、`network-users-filter.txt` |
| `USER-006` 新增设计师账号成功 | 通过 | `POST /api/users` 返回 `200 创建账号成功`，角色为 `DESIGNER`，见 `api-create-duplicate-results.json` |
| `USER-010` 后端拒绝重复登录账号 | 通过 | 重复创建 `qa_designer_20260501053041` 返回 `409 用户名已存在`，见 `api-create-duplicate-results.json` |
| `USER-011` 编辑用户成功 | 通过 | 编辑调度账号名称为 `QA调度写入测试-已编辑`，`PUT /api/users/30?user_id=30` 返回 `200`，见 `screenshots/dispatcher-edited.png`、`network-users-filter.txt` |
| `USER-014` 删除普通用户成功 | 通过 | 页面确认删除调度账号成功；接口清理设计师账号成功；最终按账号搜索均为 0 条，见 `screenshots/dispatcher-deleted.png`、`cleanup-results.json` |

## 清理验证

| 项目 | 结果 | 证据 |
| --- | --- | --- |
| 调度测试账号清理 | 通过 | `cleanup-results.json` 中 `dispatcherTotal=0` |
| 设计师测试账号清理 | 通过 | `cleanup-results.json` 中 `designerTotal=0` |

## 构建与日志

| 项目 | 结果 | 证据 |
| --- | --- | --- |
| 控制台错误 | 通过 | `console.txt` 未出现业务错误 |
| 网络请求 | 通过 | `network-users-filter.txt` 包含预期 `POST/PUT/DELETE /api/users` |
| 构建 | 通过 | `build.log` 包含 `built in` |

构建仍有 Vite chunk 体积提示，已作为观察项记录在 `docs/errer.md`，不影响本轮功能测试结论。

## 证据文件

| 类型 | 文件 |
| --- | --- |
| 测试数据 | `docs/test-runs/user-write-first-pass-20260501/test-data.json` |
| 新增/重复结果 | `docs/test-runs/user-write-first-pass-20260501/api-create-duplicate-results.json` |
| 清理结果 | `docs/test-runs/user-write-first-pass-20260501/cleanup-results.json` |
| 页面截图 | `docs/test-runs/user-write-first-pass-20260501/screenshots/*.png` |
| 网络记录 | `docs/test-runs/user-write-first-pass-20260501/network-requests.txt`、`docs/test-runs/user-write-first-pass-20260501/network-users-filter.txt` |
| 控制台日志 | `docs/test-runs/user-write-first-pass-20260501/console.txt` |
| 构建日志 | `docs/test-runs/user-write-first-pass-20260501/build.log` |
