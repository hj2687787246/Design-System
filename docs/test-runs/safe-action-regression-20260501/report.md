# 危险操作取消安全回归测试报告

## 基本信息

| 项目 | 内容 |
| --- | --- |
| 测试日期 | 2026-05-01 |
| 测试方式 | `agent-browser` 浏览器自动化 |
| 前端地址 | `http://127.0.0.1:5182` |
| 管理员账号 | `admin / 123321` |
| 测试策略 | 只打开删除、改派、编辑等写入口并取消；不点击任何确认、提交、改派、删除、保存按钮 |

## 结论

本轮“危险操作取消不写入”回归通过：订单、商户、用户的删除确认框和编辑/改派弹窗均可取消，取消后未触发破坏性写接口。

补充说明：本报告初版把 `agent-browser snapshot` 中 Element Plus `spinbutton` 的可访问性树值误判为页面可见浮点长尾。后续已由 `docs/test-runs/precision-regression-20260501/report.md` 使用真实 DOM input value 和截图复核，价格输入框实际显示与输入均限制在三位小数。

## 结果概览

| 分类 | 数量 |
| --- | ---: |
| 通过 | 9 |
| 失败 | 0 |
| 阻塞 | 0 |
| 未确认提交的破坏性动作 | 7 |

## 用例结果

| 用例 | 结果 | 证据 |
| --- | --- | --- |
| 管理员登录并进入全部订单 | 通过 | `screenshots/admin-orders-initial.png` |
| 订单删除确认框打开后点击取消 | 通过 | `screenshots/order-delete-popconfirm.png` |
| 订单改派弹窗打开后点击取消 | 通过 | `screenshots/order-reassign-dialog.png` |
| 订单编辑弹窗打开后点击取消 | 通过 | `screenshots/order-edit-dialog-float-tail.png` |
| 商户删除确认框打开后点击取消 | 通过 | `screenshots/merchant-delete-popconfirm.png` |
| 商户编辑弹窗打开后点击取消 | 通过 | `screenshots/merchant-edit-dialog-float-tail.png` |
| 用户删除确认框打开后点击取消 | 通过 | `screenshots/user-delete-popconfirm.png` |
| 用户编辑弹窗打开后点击取消 | 通过 | `screenshots/user-edit-dialog.png` |
| 取消路径不触发破坏性写接口 | 通过 | `destructive-api-filter.json` 内容为 `[]` |
| 价格字段三位小数复核 | 通过 | 后续复核见 `docs/test-runs/precision-regression-20260501/report.md` |

## 网络验证

`safe-actions-network.json` 记录了本轮浏览器网络请求。

`write-api-filter.json` 中出现的写方法请求只有登录、列表查询和商户编辑数据读取：

| 方法 | 接口 | 判定 |
| --- | --- | --- |
| `POST` | `/api/auth/login` | 登录接口，非本轮破坏性动作 |
| `POST` | `/api/admin/orders/list` | 订单列表查询 |
| `POST` | `/api/merchant-master/merchants/list` | 商户列表查询 |
| `POST` | `/api/merchant-master/merchants/edit-data` | 打开商户编辑弹窗时读取编辑数据 |

重点筛选的破坏性接口结果为 `[]`，未出现订单删除/修改/改派、商户删除/修改、用户删除/修改接口请求。

## 控制台与构建

| 项目 | 结果 | 证据 |
| --- | --- | --- |
| 页面错误 | 通过 | `admin-errors.txt` 为空 |
| 控制台 | 通过 | `admin-console.txt` 仅包含 Vite 连接日志 |
| 构建 | 通过 | `build.log` 显示 `✓ built` |

构建存在 Vite chunk 体积提示：`auth-*.js` 超过 500 kB。这不是本轮功能阻断，但后续可考虑代码拆分。

## 缺陷记录

无新增阻断缺陷。价格字段长尾项已由后续精度回归复核为自动化 snapshot 取值误判，真实 DOM input value 与截图均未复现页面可见长尾。

## 证据文件

| 类型 | 文件 |
| --- | --- |
| 截图 | `docs/test-runs/safe-action-regression-20260501/screenshots/*.png` |
| 网络全量 | `docs/test-runs/safe-action-regression-20260501/safe-actions-network.json` |
| 写接口筛选 | `docs/test-runs/safe-action-regression-20260501/write-api-filter.json` |
| 破坏性接口筛选 | `docs/test-runs/safe-action-regression-20260501/destructive-api-filter.json` |
| 控制台 | `docs/test-runs/safe-action-regression-20260501/admin-console.txt` |
| 页面错误 | `docs/test-runs/safe-action-regression-20260501/admin-errors.txt` |
| 构建日志 | `docs/test-runs/safe-action-regression-20260501/build.log` |
