# 边界回归测试报告

## 基本信息

| 项目 | 内容 |
| --- | --- |
| 测试日期 | 2026-05-01 |
| 测试方式 | `agent-browser` 浏览器自动化 |
| 前端地址 | `http://127.0.0.1:5179` |
| 后端来源 | Vite 代理 `/api` 到 `http://118.89.133.246` |
| 管理员账号 | `admin / 123321` |
| 设计师账号 | `shejishi / 123321` |
| 测试策略 | 非破坏性边界回归；不确认新增、删除、派单、审核、完工等真实写入动作 |

## 结果概览

| 分类 | 数量 |
| --- | ---: |
| 通过 | 25 |
| 失败 | 0 |
| 阻塞 | 0 |
| 观察项 | 1 |
| 未执行 | 7 |

结论：本轮边界回归覆盖登录校验、用户/商户表单校验、订单新增边界、状态下拉、价格三位小数输入限制、设计师空结果和权限接口，未发现阻断性失败。

## 登录与鉴权

| 用例/范围 | 结果 | 证据 |
| --- | --- | --- |
| 未登录访问 `/orders` 回跳登录 | 通过 | `screenshots/auth-route-guard.png`，URL 为 `/?redirect=/orders` |
| 登录页空表单必填校验 | 通过 | `screenshots/login-required-empty.png` |
| 登录页密码必填校验 | 通过 | `screenshots/login-required-password.png` |
| 管理员登录成功 | 通过 | `screenshots/admin-login-success.png`，最终进入 `/orders` |

## 用户管理

| 用例/范围 | 结果 | 证据 |
| --- | --- | --- |
| 用户列表加载 | 通过 | `screenshots/user-list.png` |
| 账号关键词 `shejishi` 搜索 | 通过 | `screenshots/user-search-shejishi.png`，列表过滤为设计师账号 |
| 新增用户弹窗打开 | 通过 | `screenshots/user-create-dialog.png` |
| 新增用户必填校验 | 通过 | `screenshots/user-create-required-validation.png` |
| 新增用户密码长度校验 | 通过 | `screenshots/user-create-password-length.png` |

说明：本轮未点击“提交”成功创建真实账号。

## 商户管理

| 用例/范围 | 结果 | 证据 |
| --- | --- | --- |
| 商户列表加载 | 通过 | `screenshots/merchant-list.png` |
| 商户名称 `测试商户957` 搜索 | 通过 | `screenshots/merchant-search.png` |
| 商户详情只读展示 | 通过 | `screenshots/merchant-detail.png` |
| 新增商户弹窗打开 | 通过 | `screenshots/merchant-create-dialog.png` |
| 添加照片类型行 | 通过 | `screenshots/merchant-create-add-type.png` |
| 商户默认价格输入最多三位小数 | 通过 | `screenshots/merchant-price-inserttext.png`，输入 `2.3456` 后实际值为 `2.345` |
| 新增商户必填校验 | 通过 | `screenshots/merchant-create-required-validation.png` |

说明：本轮未点击“确定”成功创建真实商户。

## 订单边界

| 用例/范围 | 结果 | 证据 |
| --- | --- | --- |
| 新建订单弹窗打开 | 通过 | `screenshots/order-create-dialog.png` |
| 商户选择后照片类型联动 | 通过 | `screenshots/order-create-photo-selected.png` |
| 选择照片类型后默认价格回填 | 通过 | `screenshots/order-create-photo-selected.png` |
| 订单接单价输入最多三位小数 | 通过 | `screenshots/order-price-input-limit.png`，输入 `9.8765` 后实际值为 `9.876` |
| 订单状态下拉只展示可手动设置项 | 通过 | `screenshots/status-dropdown-options.png`，选项为“问题件”“其他” |

说明：本轮未点击“确认添加”创建真实订单，未选择状态下拉项，因此未触发状态写入。

## 设计师端

| 用例/范围 | 结果 | 证据 |
| --- | --- | --- |
| 设计师登录成功 | 通过 | `screenshots/designer-login-success.png` |
| 设计师订单空结果搜索 | 通过 | `screenshots/designer-empty-search.png`，无匹配订单时表格为空且分页可用 |
| 设计师个人设置弹窗回填 | 通过 | `screenshots/designer-account-dialog.png` |
| 设计师个人设置用户名必填校验 | 通过 | `screenshots/designer-account-required-validation.png` |
| 设计师 Token 访问用户管理接口被拒绝 | 通过 | `designer-users-api-403.json`，`GET /api/users` 返回 403 `无权限` |

## 观察项

| 项目 | 级别 | 说明 |
| --- | --- | --- |
| 程序化上传非 `.xlsx` 文件仍触发导入预览请求 | 低 | `input[type=file]` 设置了 `accept=".xlsx"`，正常文件选择器会限制用户选择；但通过自动化直接上传 `invalid-import.txt` 时仍发起 `/api/admin/orders/import/preview`，请求未返回最终状态。建议在前端 `change` 处理里再校验扩展名，避免绕过浏览器选择器限制。 |

## 日志与风险

| 项目 | 结果 |
| --- | --- |
| 管理端 `agent-browser errors` | 无阻断错误，见 `admin-errors.txt` |
| 设计师端 `agent-browser errors` | 无阻断错误，见 `designer-errors.txt` |
| Vite stderr | 仅包含预期表单校验 warning，见 `vite-5179.err.log` |
| 网络写入风险 | 未触发用户/商户/订单新增成功、删除、派单、审核、完工等真实业务写入 |

## 未执行项

| 用例/范围 | 原因 |
| --- | --- |
| 新增用户成功 | 会创建真实账号，本轮只验证校验 |
| 删除用户成功 | 会删除真实账号，本轮不执行 |
| 新增商户成功 | 会创建真实商户，本轮不执行 |
| 删除商户成功 | 会删除真实商户及关联数据，本轮不执行 |
| 新建订单成功 | 会创建真实订单，本轮不执行 |
| 审核通过/退回 | 会改变真实订单状态，本轮不执行 |
| 确认完工成功 | 会改变真实订单状态，本轮不执行 |

## 证据文件

| 类型 | 文件 |
| --- | --- |
| 截图 | `docs/test-runs/boundary-regression-20260501/screenshots/*.png` |
| 网络证据 | `docs/test-runs/boundary-regression-20260501/admin-network-after-import-invalid-late.json` |
| 权限证据 | `docs/test-runs/boundary-regression-20260501/designer-users-api-403.json` |
| 控制台与错误日志 | `docs/test-runs/boundary-regression-20260501/admin-console.txt`、`docs/test-runs/boundary-regression-20260501/designer-console.txt`、`docs/test-runs/boundary-regression-20260501/vite-5179.err.log` |
