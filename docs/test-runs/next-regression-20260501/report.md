# 下一轮回归测试报告

## 基本信息

| 项目 | 内容 |
| --- | --- |
| 测试时间 | 2026-05-01 |
| 测试方式 | `agent-browser` 浏览器自动化 |
| 前端地址 | `http://127.0.0.1:5177` |
| 后端来源 | Vite 代理 `/api` 到 `http://118.89.133.246` |
| 测试账号 | 管理员：`admin / 123321`；设计师：`shejishi / 123321` |
| 测试策略 | 非破坏性回归；不确认新增、删除、审核通过、提交完工等真实写入动作 |

## 结果概览

| 分类 | 数量 |
| --- | ---: |
| 通过 | 19 |
| 失败 | 0 |
| 阻塞 | 0 |
| 未执行 | 7 |

## 通过项

| 用例 | 结果 | 证据 |
| --- | --- | --- |
| AUTH-003 管理员登录成功 | 通过 | `screenshots/admin-5177-orders.png` |
| ORDER-LIST-002 全部订单明细加载 | 通过 | `screenshots/admin-5177-orders.png` |
| ORDER-LIST-003 明细表字段展示 | 通过 | 明细表包含商家、照片类型、状态、设计师、订单号、张数、价格、客户、时间、备注、操作 |
| ORDER-LIST-014 状态下拉只允许问题件和其他 | 通过 | 本轮沿用前序 `screenshots/status-dropdown.png` 验证，无状态提交 |
| ORDER-SUM-001 切换到汇总表 | 通过 | `screenshots/admin-5177-summary.png` |
| ORDER-SUM-002 汇总表字段展示 | 通过 | `screenshots/admin-5177-summary.png` |
| EXPORT-001 未勾选时导出禁用 | 通过 | `screenshots/admin-5177-orders.png` |
| MERCHANT-001 商户列表加载 | 通过 | `screenshots/admin-5177-merchant-list.png` |
| MERCHANT-004 商户详情加载且只读 | 通过 | `screenshots/admin-5177-merchant-detail.png` |
| MERCHANT-007 商户名称必填校验 | 通过 | `screenshots/admin-5177-merchant-validation.png` |
| MERCHANT-018 默认价格最多三位小数 | 通过 | 详情输入框显示 `3.500`、`1.200`、`12.880`、`12.100` |
| USER-001 用户管理列表加载 | 通过 | `screenshots/admin-5177-user-list.png` |
| USER-007 新增用户必填校验 | 通过 | `screenshots/admin-5177-user-validation.png` |
| USER-008 新增用户密码长度校验 | 通过 | `screenshots/admin-5177-user-password-validation.png` |
| USER-015 当前登录用户不显示删除按钮 | 通过 | `admin` 行仅显示“编辑” |
| ORDER-FORM-001 打开新建订单弹窗 | 通过 | `screenshots/admin-5177-create-order.png` |
| ORDER-FORM-023 订单价格最多三位小数 | 通过 | `screenshots/admin-5177-price-input-limit.png`，逐键输入 `2.3456` 后值为 `2.345` |
| DESIGNER-001 设计师订单列表加载 | 通过 | `screenshots/designer-5177-orders.png` |
| DESIGNER-002 设计师订单不展示价格字段 | 通过 | 表头不包含接单价、接单合计、派单价、派单合计 |

## 权限验证

| 用例 | 结果 | 证据 |
| --- | --- | --- |
| AUTH-012 设计师禁止访问管理端路由 | 通过 | 访问 `/orders` 和 `/user-management` 均跳回 `/designer/orders` |
| API-005 低权限角色请求高权限接口被拒绝 | 通过 | 设计师 Token 请求 `/api/admin/orders/list` 返回 `403 {"code":403,"message":"无权限","data":null}` |
| DESIGNER-009 完工二次确认弹窗 | 通过 | `screenshots/designer-5177-complete-confirm.png`，点击取消后未提交完工 |

## 未执行项

| 用例 | 原因 |
| --- | --- |
| USER-005 新增用户成功 | 会创建真实账号，本轮只验证表单校验 |
| USER-014 删除普通用户成功 | 会删除真实账号，本轮不执行破坏性操作 |
| MERCHANT-005 新增商户成功 | 会创建真实商户，本轮只验证校验 |
| MERCHANT-015 删除商户成功 | 会级联删除真实数据，本轮不执行 |
| ORDER-FORM-009 批量建单成功 | 会创建真实订单，本轮不保存 |
| FLOW-011 审核通过 | 会改变真实订单状态，本轮不执行 |
| DESIGNER-010 提交完工成功 | 会改变真实订单状态，本轮只验证确认弹窗并取消 |

## 备注

- 本轮未发现新的失败项。
- `agent-browser click` 对“详情 / 汇总”按钮偶发未触发，已使用 DOM click 完成页面切换验证；页面实际切换功能正常。
- 价格输入限制按用户要求验证为输入阶段限制：第 4 位小数不进入输入框，而非失焦后截断。
- 测试过程中未点击任何保存、确认删除、确认完工、审核通过或审核退回。
