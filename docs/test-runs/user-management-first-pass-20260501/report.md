# 用户管理首轮补测报告

## 基本信息

| 项目 | 内容 |
| --- | --- |
| 测试日期 | 2026-05-01 |
| 前端地址 | `http://127.0.0.1:5186` |
| 管理员账号 | `admin / 123321` |
| 测试方式 | `agent-browser` 浏览器操作 + DOM/网络证据核验 |
| 测试策略 | 只测首轮未覆盖的用户管理只读/校验项，不提交新增、编辑、删除 |

## 结论

通过。本轮补测 `USER-002`、`USER-003`、`USER-009`、`USER-012`、`USER-013`，未触发用户新增、编辑或删除接口。

## 用例结果

| 用例 | 结果 | 证据 |
| --- | --- | --- |
| `USER-002` 用户关键词筛选 | 通过 | 输入 `shejishi` 后结果仅 1 行，见 `keyword-filter-result.json`、`screenshots/user-keyword-filter.png` |
| `USER-003` 用户角色筛选 | 通过 | 选择“设计师”后结果均为设计师，见 `role-filter-designer-result.json`、`screenshots/user-role-filter-designer.png` |
| `USER-009` 新增用户不允许管理员角色 | 通过 | 新增弹窗角色下拉仅含“调度”“设计师”，无管理员，见 `create-role-options.json`、`screenshots/user-create-role-options.png` |
| `USER-012` 编辑用户时登录账号不可修改 | 通过 | 编辑 `shejishi` 时登录账号输入框 `disabled=true`，见 `edit-user-dialog-fields.json`、`screenshots/user-edit-designer-dialog.png` |
| `USER-013` 编辑当前管理员时角色锁定 | 通过 | 编辑当前 `admin` 时角色下拉 `disabled=true`，见 `edit-current-admin-dialog-fields.json`、`screenshots/user-edit-current-admin-dialog.png` |

补充：编辑另一个超级管理员账号时角色也为禁用状态，见 `edit-admin-role-disabled-fields.json`。

## 网络验证

| 项目 | 结果 | 证据 |
| --- | --- | --- |
| 用户列表默认加载 | 通过 | `GET /api/users?pageNo=1&pageSize=15` |
| 关键词筛选请求 | 通过 | `GET /api/users?pageNo=1&pageSize=15&keyword=shejishi` |
| 角色筛选请求 | 通过 | `GET /api/users?pageNo=1&pageSize=15&role=DESIGNER` |
| 用户写接口 | 通过 | 未出现 `POST /api/users`、`PUT /api/users/{id}`、`DELETE /api/users/{id}` |

网络证据见 `users-api-filter.json` 和 `write-api-filter.json`。

## 构建与日志

| 项目 | 结果 | 证据 |
| --- | --- | --- |
| 页面错误 | 通过 | `admin-errors.txt` 为空 |
| 构建 | 通过 | `build.log` 包含 `✓ built` |

构建仍有 Vite chunk 体积提示，不影响本轮用户管理首轮补测。

## 证据文件

| 类型 | 文件 |
| --- | --- |
| 覆盖矩阵 | `docs/test-runs/first-pass-coverage-20260501.md` |
| 截图 | `docs/test-runs/user-management-first-pass-20260501/screenshots/*.png` |
| DOM/结果 JSON | `docs/test-runs/user-management-first-pass-20260501/*result.json`、`docs/test-runs/user-management-first-pass-20260501/*fields.json`、`docs/test-runs/user-management-first-pass-20260501/create-role-options.json` |
| 用户接口筛选 | `docs/test-runs/user-management-first-pass-20260501/users-api-filter.json` |
| 写接口筛选 | `docs/test-runs/user-management-first-pass-20260501/write-api-filter.json` |
| 控制台与错误 | `docs/test-runs/user-management-first-pass-20260501/admin-console.txt`、`docs/test-runs/user-management-first-pass-20260501/admin-errors.txt` |
| 构建日志 | `docs/test-runs/user-management-first-pass-20260501/build.log` |
