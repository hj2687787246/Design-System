# 浏览器冒烟测试报告

## 基本信息

| 项目 | 内容 |
| --- | --- |
| 测试时间 | 2026-05-01 |
| 测试方式 | `agent-browser` 浏览器自动化 |
| 前端地址 | `http://127.0.0.1:5173` |
| 后端来源 | Vite 代理 `/api` 到 `http://118.89.133.246` |
| 测试账号 | 管理员：`admin / 123321`；设计师：`shejishi / 123321` |
| 测试范围 | P0/P1 冒烟：登录、权限、全部订单、汇总、导出、商户管理、用户管理、设计师订单 |
| 未执行范围 | 会改变真实业务数据的新增、删除、审核通过、提交完工操作 |

## 结果概览

| 分类 | 数量 |
| --- | ---: |
| 通过 | 24 |
| 失败 | 1 |
| 阻塞 | 0 |
| 未执行 | 6 |

## 通过项

| 用例 | 结果 | 证据 |
| --- | --- | --- |
| AUTH-001 未登录访问业务页跳转登录 | 通过 | `screenshots/auth-001-login-redirect.png` |
| AUTH-002 登录页必填校验 | 通过 | `screenshots/auth-002-empty-account-retry.png`、`screenshots/auth-002-empty-password.png` |
| AUTH-003 管理员登录成功 | 通过 | `screenshots/real-admin-login-success.png` |
| AUTH-004/012 设计师登录并只能进入设计师页 | 通过 | `screenshots/real-designer-login-attempt.png`、`screenshots/designer-route-guard-orders.png` |
| ORDER-LIST-001 筛选项接口加载 | 通过 | `admin-orders-network.json` |
| ORDER-LIST-002 全部订单明细加载 | 通过 | `screenshots/real-admin-login-success.png` |
| ORDER-LIST-003 明细表字段展示 | 通过 | `screenshots/real-admin-login-success.png` |
| ORDER-SUM-001 切换到汇总表 | 通过 | `screenshots/order-summary-switch-eval.png`，接口 `/api/admin/orders/summary/list` 返回 200 |
| ORDER-SUM-002 汇总表字段展示 | 通过 | `screenshots/order-summary-switch-eval.png` |
| EXPORT-001 未勾选时导出禁用 | 通过 | `screenshots/real-admin-login-success.png` |
| EXPORT-008 汇总表已选统计正确 | 通过 | `screenshots/summary-selection-bar.png` |
| EXPORT-009 汇总表导出已选 | 通过 | 请求体 `{"tableType":"SUMMARY","ids":["summary-10-2026-05"]}`，响应 `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |
| MERCHANT-001 商户列表加载 | 通过 | `screenshots/merchant-list.png` |
| MERCHANT-004 商户详情加载 | 通过 | `screenshots/merchant-detail-dialog.png`，接口 `/api/merchant-master/merchants/10` 返回 200 |
| MERCHANT-007 商户名称必填校验 | 通过 | `screenshots/merchant-create-required-validation.png` |
| USER-001 用户管理列表加载 | 通过 | `screenshots/user-management-list.png`，接口 `/api/users?pageNo=1&pageSize=15` 返回 200 |
| USER-007 新增用户必填校验 | 通过 | `screenshots/user-create-required-validation.png` |
| USER-008 新增用户密码长度校验 | 通过 | `screenshots/user-create-password-validation.png` |
| USER-015 当前登录用户不显示删除按钮 | 通过 | `screenshots/user-management-list.png`，`admin` 行仅显示“编辑” |
| DESIGNER-001 设计师订单列表加载 | 通过 | `screenshots/designer-route-guard-orders.png`，接口 `/api/designer/orders/list` 返回 200 |
| DESIGNER-002 设计师订单不展示价格字段 | 通过 | `screenshots/designer-route-guard-orders.png` |
| DESIGNER-009 完工二次确认弹窗 | 通过 | `screenshots/designer-complete-confirm-retry.png`、`screenshots/designer-complete-cancelled.png` |
| API-005 低权限角色请求高权限接口被拒绝 | 通过 | 设计师直接请求 `/api/admin/orders/list` 返回 `403 {"code":403,"message":"无权限","data":null}` |
| API-010 Blob 导出接口 | 通过 | `/api/admin/orders/export` 返回 xlsx 文件流 |

## 发现的问题

### ISSUE-001 商户详情价格字段显示浮点长尾

| 字段 | 内容 |
| --- | --- |
| 严重级别 | P2 |
| 影响范围 | 商户详情、价格展示准确性 |
| 页面 | `/master-data` |
| 证据 | `screenshots/merchant-detail-dialog.png` |

复现步骤：

1. 使用管理员账号 `admin / 123321` 登录。
2. 进入“商户管理”。
3. 点击第一条商户“详情”。
4. 查看照片类型默认价格。

实际结果：

- 默认派单价显示为 `1.2000000476837158`。
- 默认接单价显示为 `12.880000114440918`。
- 默认派单价显示为 `12.100000381469728`。

预期结果：

- 价格字段应按最多三位小数展示，例如 `1.2`、`12.88`、`12.1`，输入框可显示为 `1.200`、`12.880`、`12.100`。

建议：

- 前端回填 `el-input-number` 前统一将价格转为最多三位小数的 number。
- 或后端返回字符串金额时，前端展示层使用格式化函数，避免二进制浮点长尾暴露给用户。

### ISSUE-001 回归验证

| 字段 | 内容 |
| --- | --- |
| 验证时间 | 2026-05-01 |
| 前端地址 | `http://127.0.0.1:5175` |
| 验证结果 | 通过 |

验证结论：

- 全部订单明细表中原派单价显示为 `1.2`，未显示 `1.2000000476837158`。
- 商家分组明细弹窗中派单价显示为 `1.2`，未显示浮点长尾。
- 商户编辑弹窗中默认价格输入框实际值为 `1.200`、`12.880`、`12.100`。
- 订单编辑弹窗中派单价逐键输入 `2.3456` 时，输入框停在 `2.345`，第 4 位小数未进入。
- 订单编辑弹窗中全选替换后逐键输入 `9.8765` 时，输入框停在 `9.876`，第 4 位小数未进入。
- 验证过程中未点击“确定”或“确认修改”，未保存测试输入。

## 未执行项

| 用例 | 原因 |
| --- | --- |
| USER-005 新增用户成功 | 会创建真实账号，本轮只验证校验，不写入数据 |
| USER-014 删除普通用户成功 | 会删除真实账号，本轮不执行破坏性操作 |
| MERCHANT-005 新增商户成功 | 会创建真实商户，本轮只验证校验，不写入数据 |
| MERCHANT-015 删除商户成功 | 会级联删除真实数据，本轮不执行 |
| FLOW-011 审核通过 | 会改变真实订单状态，本轮不执行 |
| DESIGNER-010 提交完工成功 | 会改变真实订单状态，本轮仅验证确认弹窗并取消 |

## 备注

- 最初使用 `admin / 23321` 登录返回 401，后续按用户更正使用 `admin / 123321` 登录成功。
- 测试过程中没有确认任何删除、提交完工、审核通过或新增保存动作。
- 浏览器自动化输出和截图保存在 `docs/test-runs/browser-smoke-20260501/`。
