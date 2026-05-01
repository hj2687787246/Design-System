# 首轮剩余用例补测报告

## 结论

本轮继续执行首轮未显式覆盖用例，覆盖登录鉴权、接口异常、分页、商户校验、订单建单边界、明细/汇总选择导出、设计师分页、XSS 和日期/金额展示。临时创建的 `QA_PAGE_*`、`QA_FULL_*` 用户、商户和订单均已清理。

本轮新增未修复问题已记录到 `docs/errer.md`：`BUG-003` 至 `BUG-008`。`API-008` 请求超时由于当前 `agent-browser network route` 不支持延迟响应，未做 15 秒超时精确模拟；`API-009` 做了请求中断尝试，但未形成稳定可复现结论。

## 覆盖用例

| 范围 | 用例 | 结果 |
| --- | --- | --- |
| 鉴权和路由 | `AUTH-005`、`AUTH-014`、`AUTH-018` | 通过 |
| 鉴权和路由 | `AUTH-013` | 失败，调度可进入用户管理页，见 `BUG-001` 补充 |
| Token 刷新 | `AUTH-015`、`API-011` | 失败，失效 accessToken + 有效 refreshToken 未自动刷新，见 `BUG-003` |
| API 通用 | `API-001`、`API-002`、`API-003`、`API-004`、`API-005`、`API-006`、`API-007`、`API-012` | 通过 |
| 用户管理 | `USER-004` | 通过，临时创建 7 个用户使总数超过 15，翻到第 2 页后清理 |
| 商户管理 | `MERCHANT-003`、`MERCHANT-009`、`MERCHANT-010`、`MERCHANT-011` | 通过 |
| 商户管理 | `MERCHANT-008` | 失败，照片类型为空未出现预期校验提示，见 `BUG-004` |
| 订单列表 | `ORDER-LIST-009`、`ORDER-LIST-011`、`ORDER-LIST-013` | 通过 |
| 建单表单 | `ORDER-FORM-007`、`ORDER-FORM-008`、`ORDER-FORM-010`、`ORDER-FORM-012`、`ORDER-FORM-020` | 通过 |
| 建单表单 | `ORDER-FORM-004`、`ORDER-FORM-005`、`ORDER-FORM-019`、`ORDER-FORM-023` | 失败，见 `BUG-006`、`BUG-007`、`BUG-008` |
| 建单表单 | `ORDER-FORM-011` | 未形成有效切换覆盖确认，需在照片类型多选商户数据下回归 |
| 建单表单 | `ORDER-FORM-022` | 已由既有安全操作报告覆盖，补充显式记录 |
| 汇总表 | `ORDER-SUM-005`、`ORDER-SUM-007` | 分页通过；切回明细后选择清空但统计条仍显示 0，见 `BUG-005` |
| 导出 | `EXPORT-001`、`EXPORT-002`、`EXPORT-003`、`EXPORT-006`、`EXPORT-007`、`EXPORT-008`、`EXPORT-010`、`EXPORT-011` | 通过 |
| 导出 | `EXPORT-004` | 失败，清空后统计条仍显示 0，见 `BUG-005` |
| 设计师页 | `DESIGNER-008` | 通过 |
| 设计师页 | `DESIGNER-009`、`DESIGNER-012` | 既有报告已覆盖，本轮补充显式记录 |
| 非功能 | `NF-001`、`NF-002`、`NF-003`、`NF-005`、`NF-007`、`NF-008`、`NF-009`、`NF-010` | 已覆盖或形成问题记录 |
| 非功能 | `NF-004` | 当前 CLI `viewport` 命令不可用，未完成移动宽度精确验证 |
| 非功能 | `NF-006` | 常规加载可用；接口延迟 loading 未做精确延迟模拟 |

## 关键证据

| 项目 | 实际结果 |
| --- | --- |
| 调度登录首页 | `diaodu / 123321` 登录后进入 `/orders` |
| 调度访问用户管理 | 直接访问 `/user-management` 后仍显示用户管理页面 |
| 管理员访问用户管理 | `admin / 123321` 可正常显示用户列表 |
| 退出登录 | 点击账户菜单退出后回到 `/`，`accessToken`、`refreshToken`、`user` 均清空，记住账号保留 |
| API 成功格式 | `/api/auth/me` 返回 `{ code: 200, message, data }` |
| API 分页格式 | `/api/users?pageNo=1&pageSize=2` 返回 `records`、`total`、`pageNo`、`pageSize` |
| 未登录请求 | `/api/users` 不带 token 返回 HTTP `401`、业务 `code=301` |
| 无权限请求 | 设计师 token 请求 `/api/users` 返回 `403` |
| 不存在数据 | `GET /api/merchant-master/merchants/999999999` 返回 `404` |
| 重复数据 | 新增用户名 `admin` 返回 `409`；重复订单号返回 `400` 且字段错误为 `orderNo` |
| 非法建单参数 | 照片张数 `0`、负接单价/派单价均返回 `400` |
| 非 xlsx 导入 | `.txt` 文件调用导入预览返回 `400`，提示只支持 `.xlsx` |
| 明细导出表头 | `订单号、商户、客户、照片类型、照片数、状态、设计师、接单价、接单合计、派单价、派单合计、备注、下单时间、完工时间` |
| 汇总导出表头 | `商户、订单数、照片数、接单合计、派单合计、利润、月份` |
| XSS 文本安全 | 备注 `<img src=x onerror="window.__qaXssFired=1">` 以文本显示，`window.__qaXssFired=false` |
| 设计师分页 | 16 条分配给 `shejishi` 的订单在设计师页可翻到第 2 页 |
| 临时数据清理 | `QA_FULL_*` 16 条订单和 16 个商户清理后剩余数均为 `0` |

## 清理记录

| 数据 | 创建数量 | 清理结果 |
| --- | --- | --- |
| `QA_PAGE_USER_*` | 7 个用户 | 删除成功，剩余 `0` |
| `QA_PAGE_MERCHANT_*` | 12 个商户 | 删除成功，剩余 `0` |
| `QA_FULL_*` | 16 个商户、16 条订单 | 删除成功，剩余 `0` |

## 构建验证

`npm run build` 执行成功，退出码 `0`。仍存在 Vite chunk 大小超过 500 kB 的警告，已归入既有 `OBS-001`。
