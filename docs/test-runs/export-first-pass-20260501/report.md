# 导出首轮测试报告

## 结论

明细表和汇总表已选导出接口通过，返回有效 `.xlsx` 文件流。测试订单和商户已清理，未发现新增缺陷。

## 覆盖用例

| 用例 | 结果 | 证据 |
| --- | --- | --- |
| `EXPORT-005` 明细表导出已选 | 通过 | `export-results.json` |
| `EXPORT-009` 汇总表导出已选 | 通过 | `export-results.json` |
| `API-010` Blob 导出不走 JSON 解包 | 通过 | `export-results.json` |

## 测试数据

| 项目 | 值 |
| --- | --- |
| 商户 | `QA导出商户_20260501054814` |
| 照片类型 | `QA导出类型_20260501054814` |
| 订单号 | `QA_EXPORT_20260501054814` |
| 订单 ID | `22` |
| 汇总 ID | `summary-16-2026-05` |

## 验证结果

| 校验项 | 实际结果 |
| --- | --- |
| 明细列表能查到测试订单 | 通过 |
| 汇总列表能查到测试汇总行 | 通过 |
| 明细导出 HTTP 状态 | `200` |
| 明细导出 Content-Type | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |
| 明细导出文件头 | `PK` |
| 汇总导出 HTTP 状态 | `200` |
| 汇总导出 Content-Type | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |
| 汇总导出文件头 | `PK` |
| 清理订单和商户 | 通过 |

## 备注

本轮验证文件流类型、大小和 xlsx 文件头，未解析工作簿内部表头。`EXPORT-006` 和 `EXPORT-010` 可在后续回归中增加 xlsx 内容解析校验。
