# 商户管理写入首轮测试报告

## 基本信息

| 项目 | 内容 |
| --- | --- |
| 测试日期 | 2026-05-01 |
| 前端地址 | `http://127.0.0.1:5187` |
| 管理员账号 | `admin / 123321` |
| 测试方式 | `agent-browser` 浏览器会话 + 同源接口验证 |
| 测试策略 | 使用唯一测试商户，删除仅针对本轮创建的数据 |

## 结论

通过，但发现 1 个非阻塞精度问题，已记录到 `docs/errer.md` 的 `BUG-002`。

本轮覆盖 `MERCHANT-005`、`MERCHANT-006`、`MERCHANT-012`、`MERCHANT-013`、`MERCHANT-014`、`MERCHANT-015`。新增空照片类型商户、新增带照片类型商户、编辑新增照片类型、编辑改价、编辑删除照片类型、删除商户均执行成功。测试商户已清理。

## 测试数据

| 类型 | 名称 | 处理结果 |
| --- | --- | --- |
| 空类型商户 | `QA空类型商户_20260501053349` | 创建成功，删除成功 |
| 带类型商户 | `QA带类型商户_20260501053349` | 创建成功，编辑成功，删除成功 |
| 照片类型 A | `QA类型A_20260501053349` | 创建、改价后保留 |
| 照片类型 B | `QA类型B_20260501053349` | 编辑新增后删除 |

## 用例结果

| 用例 | 结果 | 证据 |
| --- | --- | --- |
| `MERCHANT-005` 新增空照片类型商户 | 通过 | `POST /api/merchant-master/merchants` 返回 `200 新增商户成功`，`photoTypes=[]`，见 `merchant-api-results.json` |
| `MERCHANT-006` 新增带照片类型商户 | 通过 | 创建后列表可查询到照片类型 `QA类型A_20260501053349`，见 `merchant-api-results.json` |
| `MERCHANT-012` 编辑商户新增照片类型 | 通过 | `PUT /api/merchant-master/merchants` 保存后包含 `QA类型B_20260501053349`，见 `merchant-api-results.json` |
| `MERCHANT-013` 编辑商户修改照片类型价格 | 通过 | `PUT /api/merchant-master/merchants` 保存成功，价格字段发生更新；三位小数回显两位的问题另见 `BUG-002` |
| `MERCHANT-014` 编辑商户删除照片类型 | 通过 | 保存后 `QA类型B_20260501053349` 不再存在，见 `merchant-api-results.json` |
| `MERCHANT-015` 删除商户成功 | 通过 | 两个测试商户删除均返回 `200 删除商户成功`，清理后搜索均为 0 条，见 `cleanup-results.json` |

## 发现问题

| 编号 | 状态 | 说明 |
| --- | --- | --- |
| `BUG-002` | 已记录 | 三位小数价格保存后回显为两位小数，例如 `5.555` 回显 `5.56`，不阻塞本轮流程 |

## 清理验证

| 项目 | 结果 | 证据 |
| --- | --- | --- |
| 空类型商户清理 | 通过 | `cleanup-results.json` 中 `emptyTotal=0` |
| 带类型商户清理 | 通过 | `cleanup-results.json` 中 `fullTotal=0` |

## 构建与日志

| 项目 | 结果 | 证据 |
| --- | --- | --- |
| 控制台错误 | 通过 | `console.txt` 未出现业务错误 |
| 网络请求 | 通过 | `network-merchant-filter.txt` 包含预期 `POST/PUT/DELETE /api/merchant-master` 请求 |
| 构建 | 通过 | `build.log` 包含 `built in` |

构建仍有 Vite chunk 体积提示，已作为观察项记录在 `docs/errer.md`，不影响本轮功能测试结论。

## 证据文件

| 类型 | 文件 |
| --- | --- |
| 测试数据 | `docs/test-runs/merchant-write-first-pass-20260501/test-data.json` |
| 写入与编辑结果 | `docs/test-runs/merchant-write-first-pass-20260501/merchant-api-results.json` |
| 清理结果 | `docs/test-runs/merchant-write-first-pass-20260501/cleanup-results.json` |
| 页面截图 | `docs/test-runs/merchant-write-first-pass-20260501/screenshots/*.png` |
| 网络记录 | `docs/test-runs/merchant-write-first-pass-20260501/network-requests.txt`、`docs/test-runs/merchant-write-first-pass-20260501/network-merchant-filter.txt` |
| 控制台日志 | `docs/test-runs/merchant-write-first-pass-20260501/console.txt` |
| 构建日志 | `docs/test-runs/merchant-write-first-pass-20260501/build.log` |
