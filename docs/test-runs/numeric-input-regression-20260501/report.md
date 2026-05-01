# 数字输入框精度全覆盖回归报告

## 基本信息

| 项目 | 内容 |
| --- | --- |
| 测试日期 | 2026-05-01 |
| 前端地址 | `http://127.0.0.1:5184` |
| 管理员账号 | `admin / 123321` |
| 测试方式 | `agent-browser` 浏览器操作 + DOM input value 核验 |
| 测试策略 | 只在弹窗中输入并取消，不点击确认添加、确认修改、确定等保存按钮 |

## 结论

通过。本轮覆盖订单编辑、批量新建订单、商户编辑中的所有 `el-input-number` 场景：

| 类型 | 预期 | 结果 |
| --- | --- | --- |
| 价格类数字框 | 最多三位小数 | 通过 |
| 照片张数数字框 | 整数，`precision=0` | 通过 |
| 弹窗取消后不保存 | 不触发保存/修改接口 | 通过 |

## 用例结果

| 用例 | 输入 | 实际 DOM input value | 结果 | 证据 |
| --- | --- | --- | --- | --- |
| 订单编辑回填价格 | 后端回填 | 接单价 `3.500`，派单价 `1.200` | 通过 | `order-edit-initial-values.json`、`screenshots/order-edit-initial.png` |
| 订单编辑接单价 | `9.8765` | `9.876` | 通过 | `order-edit-typed-values.json`、`screenshots/order-edit-typed.png` |
| 订单编辑派单价 | `8.7654` | `8.765` | 通过 | `order-edit-typed-values.json`、`screenshots/order-edit-typed.png` |
| 批量新建订单照片张数 | `12.345` | `12` | 通过 | `batch-create-typed-values.json`、`screenshots/batch-create-typed.png` |
| 批量新建订单接单价 | `7.6543` | `7.654` | 通过 | `batch-create-typed-values.json`、`screenshots/batch-create-typed.png` |
| 批量新建订单派单价 | `6.5432` | `6.543` | 通过 | `batch-create-typed-values.json`、`screenshots/batch-create-typed.png` |
| 商户编辑回填价格 | 后端回填 | `3.500`、`1.200`、`12.880`、`12.100` | 通过 | `merchant-edit-initial-values.json`、`screenshots/merchant-edit-initial.png` |
| 商户编辑默认接单价 | `5.4321` | `5.432` | 通过 | `merchant-edit-typed-values.json`、`screenshots/merchant-edit-typed.png` |
| 商户编辑默认派单价 | `4.3210` | `4.321` | 通过 | `merchant-edit-typed-values.json`、`screenshots/merchant-edit-typed.png` |

## 网络与构建

| 项目 | 结果 | 证据 |
| --- | --- | --- |
| 页面错误 | 通过 | `admin-errors.txt` 为空 |
| 构建 | 通过 | `build.log` 包含 `✓ built` |
| 保存/修改写接口 | 通过 | `write-api-filter.json` 只包含登录、列表查询和商户编辑数据读取 |

`write-api-filter.json` 未出现订单新增、订单修改、商户修改等保存接口。本轮没有提交真实数据。

构建仍有 Vite chunk 体积提示，不影响本轮输入精度验证。

## 证据文件

| 类型 | 文件 |
| --- | --- |
| 截图 | `docs/test-runs/numeric-input-regression-20260501/screenshots/*.png` |
| DOM 输入值 | `docs/test-runs/numeric-input-regression-20260501/*-values.json` |
| 网络请求 | `docs/test-runs/numeric-input-regression-20260501/network.json` |
| 写接口筛选 | `docs/test-runs/numeric-input-regression-20260501/write-api-filter.json` |
| 控制台 | `docs/test-runs/numeric-input-regression-20260501/admin-console.txt` |
| 页面错误 | `docs/test-runs/numeric-input-regression-20260501/admin-errors.txt` |
| 构建日志 | `docs/test-runs/numeric-input-regression-20260501/build.log` |
