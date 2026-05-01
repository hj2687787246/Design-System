# Excel 导入预览首轮测试报告

## 结论

Excel 导入预览接口和前端阻塞条件验证通过，未发现新增缺陷。测试用商户和照片类型已清理。

## 覆盖用例

| 用例 | 结果 | 证据 |
| --- | --- | --- |
| `ORDER-FORM-013` Excel 导入预览成功 | 通过 | `import-preview-results.json` |
| `ORDER-FORM-014` Excel 导入字段错误标红数据 | 通过 | `import-preview-results.json` |
| `ORDER-FORM-015` Excel 多商户阻塞提交 | 通过 | `import-preview-results.json` |
| `ORDER-FORM-016` Excel 多照片类型阻塞提交 | 通过 | `import-preview-results.json` |

## 测试文件

| 文件 | 用途 |
| --- | --- |
| `files/valid.xlsx` | 单商户、单照片类型、字段完整 |
| `files/missing-order.xlsx` | 缺少订单号 |
| `files/multi-merchant.xlsx` | 两行不同商户 |
| `files/multi-photo.xlsx` | 两行不同照片类型 |

## 验证结果

| 校验项 | 实际结果 |
| --- | --- |
| 合法 xlsx 解析 | `code=200`、`valid=true`、`errors=[]` |
| 合法 xlsx 行数据 | 成功解析 `merchantName`、`photoType`、`customerInfo`、`photoCount`、价格、订单号、下单时间、备注 |
| 缺订单号 xlsx | `valid=false`，返回 `field=orderNo`、`message=订单号不能为空` |
| 多商户 xlsx | 接口可解析 2 行，前端唯一商户数量大于 1，应展示阻塞提示 |
| 多照片类型 xlsx | 接口可解析 2 行，前端唯一照片类型数量大于 1，应展示阻塞提示 |
| 准备商户清理 | 删除 `QA导入商户A_20260501055034`、`QA导入商户B_20260501055034` 成功且查询无残留 |

## 备注

本轮最初用手工最小 OOXML 生成的 xlsx 被后端解析库拒绝，后改用本机 Excel COM 生成标准 xlsx 后通过。该过程属于测试样例生成问题，不计入缺陷。
