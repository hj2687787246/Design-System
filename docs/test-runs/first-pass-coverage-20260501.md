# 首轮测试覆盖矩阵

## 2026-05-01 首轮补测更新

| 范围 | 已补测用例 | 证据 |
| --- | --- | --- |
| 用户管理筛选和弹窗属性 | `USER-002`、`USER-003`、`USER-009`、`USER-012`、`USER-013` | `docs/test-runs/user-management-first-pass-20260501/report.md` |
| 订单筛选 | `ORDER-LIST-004`、`ORDER-LIST-005`、`ORDER-LIST-006`、`ORDER-LIST-007`、`ORDER-LIST-008`、`ORDER-LIST-010`、`ORDER-LIST-012` | `docs/test-runs/order-filter-first-pass-20260501/report.md` |
| 设计师筛选和商家明细 | `DESIGNER-003`、`DESIGNER-004`、`DESIGNER-005`、`DESIGNER-006`、`DESIGNER-007`、`DESIGNER-011` | `docs/test-runs/designer-filter-first-pass-20260501/report.md` |
| 登录页细节 | `AUTH-007`、`AUTH-008`、`AUTH-009`、`AUTH-010`、`AUTH-011` | `docs/test-runs/auth-details-first-pass-20260501/report.md` |
| 个人设置校验细节 | `ACCOUNT-003` | `docs/test-runs/account-password-first-pass-20260501/report.md` |
| 权限直接接口 | `USER-016`、`EXPORT-012` | `docs/test-runs/permission-probes-first-pass-20260501/report.md` |

## 写入测试更新

| 范围 | 已测用例 | 证据 |
| --- | --- | --- |
| 用户管理写入流程 | `USER-005`、`USER-006`、`USER-010`、`USER-011`、`USER-014` | `docs/test-runs/user-write-first-pass-20260501/report.md` |
| 商户管理写入流程 | `MERCHANT-005`、`MERCHANT-006`、`MERCHANT-012`、`MERCHANT-013`、`MERCHANT-014`、`MERCHANT-015` | `docs/test-runs/merchant-write-first-pass-20260501/report.md` |
| 订单完整状态流转 | `ORDER-FORM-009`、`ORDER-FORM-021`、`FLOW-002`、`FLOW-007`、`FLOW-011`、`FLOW-012`、`FLOW-015`、`FLOW-016`、`DESIGNER-010` | `docs/test-runs/order-flow-first-pass-20260501/report.md` |
| 订单编辑与手动状态 | `ORDER-LIST-015`、`ORDER-LIST-016`、`ORDER-FORM-017`、`ORDER-FORM-018`、`ORDER-FORM-021` | `docs/test-runs/order-edit-status-first-pass-20260501/report.md` |
| 个人设置保存 | `ACCOUNT-004`、`ACCOUNT-005` | `docs/test-runs/account-save-first-pass-20260501/report.md` |
| 订单非法流转和设计师隔离 | `FLOW-004`、`FLOW-008`、`FLOW-009`、`FLOW-013`、`FLOW-014` | `docs/test-runs/flow-negative-first-pass-20260501/report.md` |
| 导出文件流 | `EXPORT-005`、`EXPORT-009`、`API-010` | `docs/test-runs/export-first-pass-20260501/report.md` |
| Excel 导入预览 | `ORDER-FORM-013`、`ORDER-FORM-014`、`ORDER-FORM-015`、`ORDER-FORM-016` | `docs/test-runs/import-preview-first-pass-20260501/report.md` |
| 订单 UI 流转与建单表单 | `FLOW-001`、`FLOW-003`、`FLOW-005`、`FLOW-010`、`ORDER-FORM-001`、`ORDER-FORM-002`、`ORDER-FORM-003`、`ORDER-FORM-006` | `docs/test-runs/ui-flow-form-first-pass-20260501/report.md` |
| 订单改派 | `FLOW-006` | `docs/test-runs/reassign-first-pass-20260501/report.md` |
| 订单汇总计算 | `ORDER-SUM-003`、`ORDER-SUM-004`、`ORDER-SUM-006` | `docs/test-runs/summary-calc-first-pass-20260501/report.md` |
| 首轮剩余用例补测 | `AUTH-005`、`AUTH-013`、`AUTH-014`、`AUTH-015`、`AUTH-018`、`API-001`、`API-002`、`API-003`、`API-004`、`API-005`、`API-006`、`API-007`、`API-011`、`API-012`、`USER-004`、`MERCHANT-003`、`MERCHANT-008`、`MERCHANT-009`、`MERCHANT-010`、`MERCHANT-011`、`ORDER-LIST-009`、`ORDER-LIST-011`、`ORDER-LIST-013`、`ORDER-FORM-004`、`ORDER-FORM-005`、`ORDER-FORM-007`、`ORDER-FORM-008`、`ORDER-FORM-010`、`ORDER-FORM-011`、`ORDER-FORM-012`、`ORDER-FORM-019`、`ORDER-FORM-020`、`ORDER-FORM-022`、`ORDER-FORM-023`、`ORDER-SUM-005`、`ORDER-SUM-007`、`EXPORT-001`、`EXPORT-002`、`EXPORT-003`、`EXPORT-004`、`EXPORT-006`、`EXPORT-007`、`EXPORT-008`、`EXPORT-010`、`EXPORT-011`、`DESIGNER-008`、`DESIGNER-009`、`DESIGNER-012`、`NF-001`、`NF-002`、`NF-003`、`NF-005`、`NF-006`、`NF-007`、`NF-008`、`NF-009`、`NF-010` | `docs/test-runs/remaining-first-pass-20260501/report.md` |
| 既有范围显式补登记 | `ORDER-LIST-002`、`ORDER-LIST-003`、`ORDER-LIST-014`、`ORDER-LIST-017`、`ORDER-LIST-018`、`ORDER-SUM-002`、`DESIGNER-002`、`E2E-001`、`E2E-002`、`E2E-003`、`E2E-004`、`E2E-005` | `docs/test-runs/browser-smoke-20260501`、`docs/test-runs/deep-regression-20260501`、`docs/test-runs/order-flow-first-pass-20260501/report.md`、`docs/test-runs/export-first-pass-20260501/report.md`、`docs/test-runs/remaining-first-pass-20260501/report.md` |
| 环境模拟受限项 | `API-008`、`API-009`、`NF-004` | `docs/test-runs/remaining-first-pass-20260501/report.md` |

## 当前原则

先补首轮未测项，不再重复跑已覆盖项。当前已按用户确认进入写入测试；写入用例使用唯一 `QA` 前缀数据，执行后清理，只在阻塞或影响后续判断时暂停。

## 已覆盖主范围

| 范围 | 已覆盖示例 | 证据 |
| --- | --- | --- |
| 登录、未登录跳转、管理员/设计师登录 | `AUTH-001`、`AUTH-002`、`AUTH-003`、`AUTH-004`、`AUTH-006` | `browser-smoke-20260501`、`boundary-regression-20260501` |
| Token 失效和会话跳转 | `AUTH-016`、`AUTH-017` | `session-regression-20260501` |
| 个人设置打开和必填校验 | `ACCOUNT-001`、`ACCOUNT-002` | `deep-regression-20260501`、`boundary-regression-20260501` |
| 用户管理列表、必填、密码长度、删除取消、当前用户不显示删除 | `USER-001`、`USER-007`、`USER-008`、`USER-015` | `browser-smoke-20260501`、`boundary-regression-20260501`、`safe-action-regression-20260501` |
| 商户列表、搜索、详情、新增校验、删除取消、价格精度 | `MERCHANT-001`、`MERCHANT-002`、`MERCHANT-004`、`MERCHANT-007`、`MERCHANT-016`、`MERCHANT-018` | `boundary-regression-20260501`、`numeric-input-regression-20260501` |
| 全部订单默认列表、字段、汇总切换、导出、分组、状态下拉、危险操作取消 | `ORDER-LIST-001/002/003/014/017/018`、`ORDER-SUM-001/002`、部分 `EXPORT` | `browser-smoke-20260501`、`deep-regression-20260501`、`safe-action-regression-20260501` |
| Excel 导入预览和非 xlsx 绕过观察项 | 部分导入预览 | `preview-regression-20260501`、`boundary-regression-20260501` |
| 设计师端列表、价格隔离、完工取消、路由隔离、接口权限 | `AUTH-012`、`DESIGNER-001/002/009`、`MERCHANT-017`、`USER-017` | `designer-isolation-regression-20260501` |

## 下一批未覆盖且可在当前环境安全执行

| 范围 | 用例 |
| --- | --- |
| 用户管理筛选和弹窗属性 | `USER-002`、`USER-003`、`USER-009`、`USER-012`、`USER-013` |
| 订单筛选 | `ORDER-LIST-004`、`ORDER-LIST-005`、`ORDER-LIST-006`、`ORDER-LIST-007`、`ORDER-LIST-008`、`ORDER-LIST-010`、`ORDER-LIST-012` |
| 设计师筛选和商家明细 | `DESIGNER-003`、`DESIGNER-004`、`DESIGNER-005`、`DESIGNER-006`、`DESIGNER-007`、`DESIGNER-011` |
| 登录页细节 | `AUTH-007`、`AUTH-008`、`AUTH-009`、`AUTH-010`、`AUTH-011` |
| 个人设置校验细节 | `ACCOUNT-003` |
| 权限直接接口 | `USER-016`、`EXPORT-012` |

## 需要测试环境或明确允许写入后执行

| 范围 | 用例 |
| --- | --- |
| 新增/编辑/删除用户成功与重复账号失败 | `USER-005`、`USER-006`、`USER-010`、`USER-011`、`USER-014` |
| 新增/编辑/删除商户成功 | `MERCHANT-005`、`MERCHANT-006`、`MERCHANT-012`、`MERCHANT-013`、`MERCHANT-014`、`MERCHANT-015` |
| 订单状态真实流转剩余项 | 无 |
