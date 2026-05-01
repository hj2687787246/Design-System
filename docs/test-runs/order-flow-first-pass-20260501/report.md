# 订单流程首轮写入测试报告

## 结论

本轮订单完整流转写入测试通过，未发现新的阻塞缺陷。已覆盖新建测试商户、新建订单、派单、设计师完工、超管驳回、设计师再次完工、超管审核通过、删除订单和删除商户清理。

## 测试范围

| 用例 | 结果 | 证据 |
| --- | --- | --- |
| `ORDER-FORM-009` 批量建单成功 | 通过 | `admin-create-dispatch.json` |
| `ORDER-FORM-021` 删除订单成功 | 通过 | `cleanup-results.json` |
| `FLOW-002` 派单成功 | 通过 | `admin-create-dispatch.json` |
| `FLOW-007` / `DESIGNER-010` 设计师提交完工 | 通过 | `designer-complete-1.json`、`designer-complete-2.json` |
| `FLOW-011` 审核通过 | 通过 | `admin-approve.json` |
| `FLOW-012` 审核退回 | 通过 | `admin-reject.json` |
| `FLOW-015` 完整流程闭环 | 通过 | `admin-create-dispatch.json`、`designer-complete-1.json`、`admin-approve.json` |
| `FLOW-016` 退回后再次完工再通过 | 通过 | `admin-reject.json`、`designer-complete-2.json`、`admin-approve.json` |

## 测试数据

| 项目 | 值 |
| --- | --- |
| 测试商户 | `QA流程商户_20260501053604` |
| 照片类型 | `QA流程类型_20260501053604` |
| 订单号 | `QA_FLOW_20260501053604` |
| 客户信息 | `QA流程客户_20260501053604` |
| 设计师 | `设计师强sir` / `shejishi` |
| 订单 ID | `19` |
| 商户 ID | `13` |

## 状态流转

| 步骤 | 预期状态 | 实际结果 |
| --- | --- | --- |
| 新建订单 | `未派单` | 通过 |
| 派单给设计师 | `未完工` | 通过 |
| 设计师首次完工 | `待审核` | 通过 |
| 超管驳回 | `未完工` | 通过 |
| 设计师再次完工 | `待审核` | 通过 |
| 超管审核通过 | `已完工` | 通过，`completedAt=2026-05-01 05:39:17` |
| 删除订单和商户 | 搜索无残留 | 通过 |

## 观察项

设计师会话在执行前已过期，直接请求返回 `401 / code=301`。已重新登录 `shejishi / 123321` 后继续测试，不计入业务缺陷。

构建命令 `npm run build` 执行成功，退出码 `0`。仍有 Vite chunk 体积提示，该观察项已在 `docs/errer.md` 的 `OBS-001` 记录。

本轮未新增未修复缺陷。商户价格三位小数保存后回显两位小数的问题仍归入既有 `BUG-002`。

## 清理结果

`cleanup-results.json` 校验均为 `true`：

| 校验项 | 结果 |
| --- | --- |
| 订单删除前存在 | 通过 |
| 订单删除接口成功 | 通过 |
| 订单搜索无残留 | 通过 |
| 商户删除前存在 | 通过 |
| 商户删除接口成功 | 通过 |
| 商户搜索无残留 | 通过 |
