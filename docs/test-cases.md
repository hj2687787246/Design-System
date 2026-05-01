# 设计派单管理系统测试用例

## 1. 文档说明

本文档根据当前前端实现和现有接口文档整理，用于功能验收、前后端联调、接口回归和上线前冒烟测试。

主要依据：

- `docs/server/backend-api-current.md`
- `docs/server/页面交互适配接口文档.md`
- `src/router/routes.js`
- `src/views/login.vue`
- `src/views/AllOrders.vue`
- `src/views/DesignerOrders.vue`
- `src/views/MasterData.vue`
- `src/views/UserManagement.vue`
- `src/components/CreateOrder.vue`
- `src/components/AllOrdersDetailTable.vue`
- `src/components/AllOrdersSummaryTable.vue`
- `src/api/*.ts`

适用范围：

- 登录鉴权与路由权限
- 个人设置与退出登录
- 用户管理
- 商户管理
- 全部订单明细表
- 全部订单汇总表
- 批量建单与 Excel 导入预览
- 派单、改派、完工、审核、退回、问题件和其他状态
- 设计师订单页
- 勾选统计与导出
- 接口响应、异常、权限和非功能测试

说明：

- 本文以最新页面适配接口和当前代码为准。
- 商户删除功能当前前端已实现，并调用 `/api/merchant-master/merchants/delete`，因此纳入测试范围。
- 若后端仍沿用“不允许删除商户”的旧业务规则，应在联调前统一规则。

## 2. 测试环境与前置条件

| 项目 | 要求 |
| --- | --- |
| 前端启动 | `npm run dev` |
| 构建验证 | `npm run build` |
| API 基础地址 | 默认 `/api`，或通过 `VITE_API_BASE_URL` 配置 |
| 浏览器 | Chrome / Edge 最新稳定版 |
| 数据库 | 准备管理员、调度、设计师账号及基础业务数据 |
| 时间格式 | `YYYY-MM-DD HH:mm:ss` |
| 文件导入 | 仅测试 `.xlsx` |
| 文件导出 | 仅校验 `.xlsx` 文件流 |

## 3. 测试账号

| 账号类型 | 角色编码 | 权限范围 |
| --- | --- | --- |
| 超级管理员 | `ADMIN` | 全部订单、商户管理、用户管理、个人设置、导出 |
| 调度 | `DISPATCHER` | 全部订单、商户管理、个人设置、导出 |
| 设计师 A | `DESIGNER` | 设计师订单、本人订单完工、个人设置 |
| 设计师 B | `DESIGNER` | 用于验证设计师数据隔离 |

建议测试账号：

| 用户名 | 密码 | 角色 |
| --- | --- | --- |
| `admin` | `123456` | `ADMIN` |
| `dispatcher01` | `123456` | `DISPATCHER` |
| `designer01` | `123456` | `DESIGNER` |
| `designer02` | `123456` | `DESIGNER` |

## 4. 基础测试数据

| 数据类型 | 建议数据 |
| --- | --- |
| 商户 | 云帆摄影、星河影像 |
| 照片类型 | 精修、调色、证件照 |
| 默认价格 | 精修接单价 12.000，派单价 8.000；调色接单价 10.500，派单价 7.125 |
| 订单状态 | 未派单、未完工、待审核、已完工、问题件、其他 |
| 订单号 | `DD202604250001`、`DD202604250002`、`DD202604250003` |
| 客户信息 | 李小姐、王先生、企业客户 A |
| 下单时间 | `2026-04-25 10:00:00`、`2026-04-26 11:30:00` |

订单流转准备：

| 场景 | 初始状态 | 设计师 | 用途 |
| --- | --- | --- | --- |
| 未派单订单 | `UNASSIGNED` | 空 | 验证派单 |
| 未完工订单 | `UNCOMPLETED` | 设计师 A | 验证设计师完工、改派 |
| 待审核订单 | `PENDING_REVIEW` | 设计师 A | 验证审核通过和退回 |
| 已完工订单 | `COMPLETED` | 设计师 A | 验证编辑、汇总、导出 |
| 问题件订单 | `PROBLEM` | 设计师 A 或空 | 验证手动状态和筛选 |
| 其他订单 | `OTHER` | 设计师 A 或空 | 验证手动状态和筛选 |

## 5. 接口清单核对

### 5.1 登录与鉴权

| 功能 | 方法 | 接口 |
| --- | --- | --- |
| 登录 | `POST` | `/api/auth/login` |
| 刷新 Token | `POST` | `/api/auth/refresh` |
| 退出登录 | `POST` | `/api/auth/logout` |
| 当前用户 | `GET` | `/api/auth/me` |
| 个人设置 / 编辑账号 | `PUT` | `/api/users/{id}` |

### 5.2 用户管理

| 功能 | 方法 | 接口 |
| --- | --- | --- |
| 用户列表 | `GET` | `/api/users` |
| 新增用户 | `POST` | `/api/users` |
| 编辑用户 | `PUT` | `/api/users/{id}` |
| 删除用户 | `DELETE` | `/api/users/{id}` |

### 5.3 商户管理

| 功能 | 方法 | 接口 |
| --- | --- | --- |
| 商户列表 | `POST` | `/api/merchant-master/merchants/list` |
| 商户详情 | `GET` | `/api/merchant-master/merchants/{id}` |
| 新增商户 | `POST` | `/api/merchant-master/merchants` |
| 编辑前取数 | `POST` | `/api/merchant-master/merchants/edit-data` |
| 保存商户 | `PUT` | `/api/merchant-master/merchants` |
| 删除商户 | `POST` | `/api/merchant-master/merchants/delete` |

### 5.4 全部订单

| 功能 | 方法 | 接口 |
| --- | --- | --- |
| 筛选项 | `GET` | `/api/orders/filter-options` |
| 明细列表 | `POST` | `/api/admin/orders/list` |
| 汇总列表 | `POST` | `/api/admin/orders/summary/list` |
| 批量建单 | `POST` | `/api/admin/orders/batch` |
| Excel 导入预览 | `POST` | `/api/admin/orders/import/preview` |
| 编辑订单 | `PUT` | `/api/admin/orders` |
| 删除订单 | `DELETE` | `/api/admin/orders/{id}` |
| 派单 | `POST` | `/api/admin/orders/dispatch` |
| 改派 | `PUT` | `/api/orders/{id}/assign` |
| 审核通过 | `POST` | `/api/admin/orders/approve` |
| 审核退回 | `POST` | `/api/admin/orders/reject` |
| 商家分组 | `GET` | `/api/admin/orders/shop-groups` |
| 设计师分组 | `GET` | `/api/admin/orders/designer-groups` |
| 导出已选 | `POST` | `/api/admin/orders/export` |

### 5.5 设计师订单

| 功能 | 方法 | 接口 |
| --- | --- | --- |
| 订单列表 | `POST` | `/api/designer/orders/list` |
| 提交完工 | `POST` | `/api/designer/orders/complete` |
| 商家分组 | `GET` | `/api/designer/orders/shop-groups` |

## 6. 测试用例

### 6.1 登录、鉴权和路由

| 用例 ID | 优先级 | 用例名称 | 角色 | 前置条件 | 操作与接口 | 预期结果 |
| --- | --- | --- | --- | --- | --- | --- |
| AUTH-001 | P0 | 未登录访问业务页面跳转登录 | 未登录 | 清空 localStorage | 访问 `/orders`、`/master-data`、`/user-management`、`/designer/orders` | 跳转 `/`，URL 带 `redirect` 查询参数 |
| AUTH-002 | P0 | 登录页必填校验 | 未登录 | 位于 `/` | 账号为空点击登录；密码为空点击登录 | 分别提示“请输入账号”“请输入密码”，不调用登录接口 |
| AUTH-003 | P0 | 登录成功保存 Token 和用户信息 | 任意账号 | 后端账号可用 | `POST /api/auth/login` 返回 `accessToken`、`refreshToken`、`user` | localStorage 保存 Token 和用户信息，提示登录成功 |
| AUTH-004 | P0 | 设计师登录跳转设计师主页 | `DESIGNER` | 登录接口成功 | 登录后根据 `getHomePath()` 跳转 | 跳转 `/designer/orders` |
| AUTH-005 | P0 | 调度登录跳转全部订单 | `DISPATCHER` | 登录接口成功 | 登录后根据 `getHomePath()` 跳转 | 跳转 `/orders` |
| AUTH-006 | P0 | 管理员登录跳转全部订单 | `ADMIN` | 登录接口成功 | 登录后根据 `getHomePath()` 跳转 | 跳转 `/orders` |
| AUTH-007 | P1 | 登录失败提示后端错误 | 未登录 | 使用错误密码 | `POST /api/auth/login` 返回非 200 或 401 | 页面展示后端 `message`，不保存 Token |
| AUTH-008 | P1 | 记住账号 | 未登录 | 勾选“记住账号” | 登录成功后退出再回到登录页 | 账号输入框自动回填上次账号 |
| AUTH-009 | P1 | 取消记住账号 | 未登录 | 取消勾选“记住账号”并登录 | 登录成功后检查 localStorage | 不保存 `design_dispatch_remember_account` |
| AUTH-010 | P2 | 密码显隐切换 | 未登录 | 密码输入框有值 | 点击密码眼睛图标 | 输入框在 `password` 和 `text` 类型间切换 |
| AUTH-011 | P0 | 已登录访问登录页自动回首页 | 任意登录用户 | localStorage 有有效 Token | 访问 `/` | 根据角色跳转 `/orders` 或 `/designer/orders` |
| AUTH-012 | P0 | 设计师禁止访问管理端路由 | `DESIGNER` | 已登录 | 访问 `/orders`、`/master-data`、`/user-management` | 跳转 `/designer/orders` |
| AUTH-013 | P0 | 调度禁止访问用户管理 | `DISPATCHER` | 已登录 | 访问 `/user-management` | 跳转 `/orders` |
| AUTH-014 | P0 | 管理员可访问用户管理 | `ADMIN` | 已登录 | 访问 `/user-management` | 正常展示用户管理页 |
| AUTH-015 | P0 | 401 自动刷新 Token 成功 | 任意登录用户 | accessToken 失效，refreshToken 有效 | 业务接口返回 HTTP 401 后调用 `POST /api/auth/refresh` | 自动重试原请求，页面不跳登录 |
| AUTH-016 | P0 | 刷新 Token 失败清理登录态 | 任意登录用户 | accessToken 与 refreshToken 均失效 | 业务接口触发刷新失败 | 清空 Token 和用户信息，跳转登录页 |
| AUTH-017 | P1 | 业务响应 code=301 跳转登录 | 任意登录用户 | 后端返回 `{ code: 301 }` | 任意业务接口响应 301 | 清空登录态并跳转 `/` |
| AUTH-018 | P0 | 退出登录 | 任意登录用户 | 已登录 | 点击账户菜单“退出登录”，调用 `POST /api/auth/logout` | 无论接口成功或失败都清空本地登录态并跳转 `/` |

### 6.2 个人设置

| 用例 ID | 优先级 | 用例名称 | 角色 | 前置条件 | 操作与接口 | 预期结果 |
| --- | --- | --- | --- | --- | --- | --- |
| ACCOUNT-001 | P0 | 打开个人设置回填信息 | 任意登录用户 | 已登录 | 点击右上角账户菜单“修改账户” | 弹窗展示用户名、当前角色、登录账号，密码为空 |
| ACCOUNT-002 | P0 | 个人设置必填校验 | 任意登录用户 | 打开个人设置 | 清空用户名或密码后提交 | 展示字段校验错误，不调用接口 |
| ACCOUNT-003 | P0 | 密码长度校验 | 任意登录用户 | 打开个人设置 | 输入少于 6 位密码并提交 | 展示“登录密码不能少于6位字符” |
| ACCOUNT-004 | P0 | 保存个人设置成功 | 任意登录用户 | 填写合法用户名和新密码 | `PUT /api/users/{id}`，提交本人 `realName`、`username`、`role`、`status`、`newPassword` | 弹窗关闭，顶部用户名更新，提示保存成功 |
| ACCOUNT-005 | P1 | 保存个人设置失败 | 任意登录用户 | 后端返回 400/403/500 | 提交个人设置 | 展示后端错误，弹窗不关闭 |

### 6.3 用户管理

| 用例 ID | 优先级 | 用例名称 | 角色 | 前置条件 | 操作与接口 | 预期结果 |
| --- | --- | --- | --- | --- | --- | --- |
| USER-001 | P0 | 管理员进入用户管理加载列表 | `ADMIN` | 已登录 | 访问 `/user-management`，调用 `GET /api/users?pageNo=1&pageSize=15` | 表格展示用户名、登录账号、角色、创建时间、操作 |
| USER-002 | P0 | 用户关键词筛选 | `ADMIN` | 存在多个账号 | 输入用户名或账号关键词，点击查询 | 请求带 `keyword`，列表只展示匹配用户，页码回到 1 |
| USER-003 | P0 | 用户角色筛选 | `ADMIN` | 存在调度和设计师 | 选择“调度”或“设计师”查询 | 请求带 `role=DISPATCHER` 或 `role=DESIGNER`，结果匹配 |
| USER-004 | P1 | 用户分页切换 | `ADMIN` | 用户总数大于 15 | 切换页码和 pageSize | 请求带新 `pageNo`、`pageSize`，表格刷新 |
| USER-005 | P0 | 新增调度账号成功 | `ADMIN` | 用户名未占用 | 点击新增用户，填写调度信息，调用 `POST /api/users` | 新增成功，弹窗关闭，列表刷新 |
| USER-006 | P0 | 新增设计师账号成功 | `ADMIN` | 用户名未占用 | 点击新增用户，角色选择设计师，提交 | 新增成功，后续可用于派单 |
| USER-007 | P0 | 新增用户必填校验 | `ADMIN` | 打开新增弹窗 | 清空用户名、角色、登录账号或密码后提交 | 展示对应字段错误，不调用接口 |
| USER-008 | P0 | 新增用户密码长度校验 | `ADMIN` | 打开新增弹窗 | 输入少于 6 位密码 | 展示密码长度错误 |
| USER-009 | P0 | 前端不允许新增管理员 | `ADMIN` | 打开新增弹窗 | 检查角色下拉 | 只能选择调度或设计师 |
| USER-010 | P0 | 后端拒绝重复登录账号 | `ADMIN` | 用户名已存在 | 调用 `POST /api/users` | 返回 409 或 400，页面展示错误 |
| USER-011 | P0 | 编辑用户成功 | `ADMIN` | 已有普通账号 | 点击编辑，修改用户名和密码，调用 `PUT /api/users/{id}` | 编辑成功，列表刷新 |
| USER-012 | P0 | 编辑时登录账号不可修改 | `ADMIN` | 打开编辑弹窗 | 查看登录账号输入框 | 输入框禁用，提交仍传原账号 |
| USER-013 | P1 | 编辑当前管理员时角色锁定 | `ADMIN` | 编辑当前登录账号 | 查看角色下拉 | 角色不可修改 |
| USER-014 | P0 | 删除普通用户成功 | `ADMIN` | 存在非当前用户账号 | 点击删除并确认，调用 `DELETE /api/users/{id}` | 删除成功，列表刷新 |
| USER-015 | P0 | 当前登录用户不显示删除按钮 | `ADMIN` | 用户列表包含当前账号 | 查看当前账号操作列 | 不显示删除按钮 |
| USER-016 | P0 | 调度无权访问用户接口 | `DISPATCHER` | 使用调度 Token | 直接请求 `GET /api/users` | 后端返回 403 |
| USER-017 | P0 | 设计师无权访问用户接口 | `DESIGNER` | 使用设计师 Token | 直接请求 `GET /api/users` | 后端返回 403 |

### 6.4 商户管理

| 用例 ID | 优先级 | 用例名称 | 角色 | 前置条件 | 操作与接口 | 预期结果 |
| --- | --- | --- | --- | --- | --- | --- |
| MERCHANT-001 | P0 | 加载商户列表 | `ADMIN`/`DISPATCHER` | 已登录 | 访问 `/master-data`，调用 `POST /api/merchant-master/merchants/list` | 展示商户名称、照片类型、创建时间、详情、编辑、删除 |
| MERCHANT-002 | P0 | 商户名称搜索 | `ADMIN`/`DISPATCHER` | 存在多商户 | 输入关键词点击搜索 | 请求带 `merchantName`，页码回到 1，结果匹配 |
| MERCHANT-003 | P1 | 商户分页切换 | `ADMIN`/`DISPATCHER` | 商户总数大于 15 | 切换页码或 pageSize | 请求参数正确，列表刷新 |
| MERCHANT-004 | P0 | 查看商户详情 | `ADMIN`/`DISPATCHER` | 商户存在 | 点击详情，调用 `GET /api/merchant-master/merchants/{id}` | 详情弹窗打开，表单只读 |
| MERCHANT-005 | P0 | 新增空照片类型商户 | `ADMIN`/`DISPATCHER` | 商户名称未占用 | 点击新增商户，只填商户名称，调用 `POST /api/merchant-master/merchants` | 新增成功，`photoTypes` 可为空数组 |
| MERCHANT-006 | P0 | 新增带照片类型商户 | `ADMIN`/`DISPATCHER` | 商户名称未占用 | 新增商户，添加照片类型和默认价格 | 新增成功，列表展示照片类型标签 |
| MERCHANT-007 | P0 | 商户名称必填校验 | `ADMIN`/`DISPATCHER` | 打开新增或编辑弹窗 | 清空商户名称提交 | 展示“请输入商户名称”，不调用接口 |
| MERCHANT-008 | P0 | 照片类型名称必填校验 | `ADMIN`/`DISPATCHER` | 添加照片类型卡片 | 清空照片类型提交 | 展示“请输入照片类型” |
| MERCHANT-009 | P0 | 默认接单价必填和最小值 | `ADMIN`/`DISPATCHER` | 添加照片类型卡片 | 默认接单价为空或小于 0 | 前端阻止非法值，后端也应拒绝非法参数 |
| MERCHANT-010 | P0 | 默认派单价必填和最小值 | `ADMIN`/`DISPATCHER` | 添加照片类型卡片 | 默认派单价为空或小于 0 | 前端阻止非法值，后端也应拒绝非法参数 |
| MERCHANT-011 | P0 | 编辑商户前取数 | `ADMIN`/`DISPATCHER` | 商户存在 | 点击编辑，调用 `POST /api/merchant-master/merchants/edit-data` | 弹窗回填商户名称和照片类型 |
| MERCHANT-012 | P0 | 编辑商户新增照片类型 | `ADMIN`/`DISPATCHER` | 商户存在 | 编辑时添加照片类型并保存，调用 `PUT /api/merchant-master/merchants` | 保存成功，列表和建单照片类型可见新增项 |
| MERCHANT-013 | P0 | 编辑商户修改照片类型价格 | `ADMIN`/`DISPATCHER` | 商户存在 | 修改默认接单价和派单价保存 | 保存成功，建单选择该类型自动带出新价格 |
| MERCHANT-014 | P0 | 编辑商户删除照片类型 | `ADMIN`/`DISPATCHER` | 商户存在多个照片类型 | 点击照片类型卡片删除并确认保存 | 删除成功，对应默认价格同步删除 |
| MERCHANT-015 | P0 | 删除商户成功 | `ADMIN`/`DISPATCHER` | 商户可删除 | 点击删除并确认，调用 `POST /api/merchant-master/merchants/delete` | 删除成功，列表刷新；按接口文档后端级联删除关联数据 |
| MERCHANT-016 | P1 | 删除商户取消 | `ADMIN`/`DISPATCHER` | 商户存在 | 点击删除后取消 | 不调用删除接口，列表不变 |
| MERCHANT-017 | P0 | 设计师无权访问商户页面 | `DESIGNER` | 已登录 | 访问 `/master-data` 或请求商户接口 | 路由跳回 `/designer/orders`，接口返回 403 |
| MERCHANT-018 | P1 | 默认价格最多三位小数 | `ADMIN`/`DISPATCHER` | 打开新增或编辑商户弹窗 | 默认接单价或默认派单价逐键输入超过 3 位小数，如 `1.23456` | 输入第 4 位小数时不进入输入框；保存接口价格参数不携带浮点长尾 |

### 6.5 全部订单筛选与明细表

| 用例 ID | 优先级 | 用例名称 | 角色 | 前置条件 | 操作与接口 | 预期结果 |
| --- | --- | --- | --- | --- | --- | --- |
| ORDER-LIST-001 | P0 | 加载筛选项 | `ADMIN`/`DISPATCHER` | 已登录 | 进入 `/orders`，调用 `GET /api/orders/filter-options` | 商户、照片类型、状态、设计师下拉数据正确 |
| ORDER-LIST-002 | P0 | 默认加载明细列表 | `ADMIN`/`DISPATCHER` | 已登录 | 调用 `POST /api/admin/orders/list` | 默认展示明细表，pageNo=1，pageSize=15 |
| ORDER-LIST-003 | P0 | 明细表字段展示 | `ADMIN`/`DISPATCHER` | 接口返回完整订单 | 查看表格 | 展示序号、商家、照片类型、状态、设计师、订单号、照片张数、价格、客户、时间、备注、操作 |
| ORDER-LIST-004 | P0 | 商户多选筛选 | `ADMIN`/`DISPATCHER` | 存在多个商户订单 | 选择商户后查询 | 请求带 `shopIds`，结果只含选中商户 |
| ORDER-LIST-005 | P0 | 照片类型多选筛选 | `ADMIN`/`DISPATCHER` | 存在多个照片类型 | 选择照片类型后查询 | 请求带 `productTypeNames`，结果匹配 |
| ORDER-LIST-006 | P0 | 状态多选筛选 | `ADMIN`/`DISPATCHER` | 存在多状态订单 | 选择状态后查询 | 请求带 `statuses`，结果匹配 |
| ORDER-LIST-007 | P0 | 设计师多选筛选 | `ADMIN`/`DISPATCHER` | 存在多个设计师订单 | 选择设计师后查询 | 请求带 `designerIds`，结果匹配 |
| ORDER-LIST-008 | P0 | 时间范围筛选 | `ADMIN`/`DISPATCHER` | 存在跨日期订单 | 选择下单时间范围查询 | 请求带 `startTime`、`endTime`，结果在范围内 |
| ORDER-LIST-009 | P0 | 关键词筛选 | `ADMIN`/`DISPATCHER` | 存在订单号、客户、备注 | 输入关键词查询 | 请求带 `keyword`，匹配订单号、客户信息或备注 |
| ORDER-LIST-010 | P0 | 组合筛选 | `ADMIN`/`DISPATCHER` | 准备多维数据 | 同时选择商户、照片类型、状态、设计师、时间和关键词 | 请求参数完整，结果满足所有条件 |
| ORDER-LIST-011 | P1 | 分页切换 | `ADMIN`/`DISPATCHER` | 订单总数大于 15 | 切换页码和 pageSize | 请求带新分页参数，序号连续或符合后端定义 |
| ORDER-LIST-012 | P1 | 空结果展示 | `ADMIN`/`DISPATCHER` | 使用无匹配筛选 | 查询列表 | 表格为空态，分页 total=0，无前端报错 |
| ORDER-LIST-013 | P0 | 状态标签样式 | `ADMIN`/`DISPATCHER` | 各状态订单存在 | 查看状态列 | 未派单、未完工、待审核、已完工、问题件、其他样式可区分 |
| ORDER-LIST-014 | P0 | 状态下拉只允许问题件和其他 | `ADMIN`/`DISPATCHER` | 明细表有订单 | 点击状态标签下拉 | 下拉仅有“问题件”“其他” |
| ORDER-LIST-015 | P0 | 手动标记问题件 | `ADMIN`/`DISPATCHER` | 任意订单存在 | 状态下拉选择问题件，调用 `PUT /api/admin/orders`，status=`PROBLEM` | 保存成功，列表状态更新为问题件 |
| ORDER-LIST-016 | P0 | 手动标记其他 | `ADMIN`/`DISPATCHER` | 任意订单存在 | 状态下拉选择其他，调用 `PUT /api/admin/orders`，status=`OTHER` | 保存成功，列表状态更新为其他 |
| ORDER-LIST-017 | P1 | 商家分组弹窗 | `ADMIN`/`DISPATCHER` | 有订单数据 | 点击表头“商家名称”，调用 `GET /api/admin/orders/shop-groups` | 弹窗按商家分组，展示订单明细 |
| ORDER-LIST-018 | P1 | 设计师分组弹窗 | `ADMIN`/`DISPATCHER` | 有派单订单 | 点击表头“设计师”，调用 `GET /api/admin/orders/designer-groups` | 弹窗按设计师分组，展示订单明细 |

### 6.6 全部订单汇总表

| 用例 ID | 优先级 | 用例名称 | 角色 | 前置条件 | 操作与接口 | 预期结果 |
| --- | --- | --- | --- | --- | --- | --- |
| ORDER-SUM-001 | P0 | 切换到汇总表 | `ADMIN`/`DISPATCHER` | 位于全部订单页 | 点击“详情 / 汇总”切换按钮，调用 `POST /api/admin/orders/summary/list` | 显示汇总表，页码回到 1，关键词清空，勾选清空 |
| ORDER-SUM-002 | P0 | 汇总表字段展示 | `ADMIN`/`DISPATCHER` | 接口返回汇总数据 | 查看表格 | 展示商家名称、订单数量、照片张数、接单总价、派单总价、利润、订单时间 |
| ORDER-SUM-003 | P0 | 汇总计算正确 | `ADMIN`/`DISPATCHER` | 准备同商户多订单 | 查看汇总数据 | `orderCount`、`photoCount`、`acceptTotalAmount`、`dispatchTotalAmount`、`profitAmount` 与后端计算一致 |
| ORDER-SUM-004 | P0 | 汇总受筛选条件影响 | `ADMIN`/`DISPATCHER` | 设置筛选条件 | 切换汇总表查询 | 汇总仅统计当前筛选范围内订单 |
| ORDER-SUM-005 | P1 | 汇总分页 | `ADMIN`/`DISPATCHER` | 汇总记录大于 15 | 切换页码和 pageSize | 请求分页参数正确，表格刷新 |
| ORDER-SUM-006 | P1 | 汇总空结果展示 | `ADMIN`/`DISPATCHER` | 使用无匹配筛选 | 查询汇总 | 表格为空态，total=0 |
| ORDER-SUM-007 | P1 | 汇总切回明细 | `ADMIN`/`DISPATCHER` | 当前为汇总表 | 再次点击切换按钮 | 明细表重新加载，页码回到 1，关键词和选择清空 |

### 6.7 批量建单、导入和编辑订单

| 用例 ID | 优先级 | 用例名称 | 角色 | 前置条件 | 操作与接口 | 预期结果 |
| --- | --- | --- | --- | --- | --- | --- |
| ORDER-FORM-001 | P0 | 打开新建订单弹窗 | `ADMIN`/`DISPATCHER` | 筛选项已加载 | 点击“新建订单” | 打开批量建单弹窗，提交按钮初始禁用 |
| ORDER-FORM-002 | P0 | 选择商户加载照片类型 | `ADMIN`/`DISPATCHER` | 商户有照片类型 | 选择商户，调用 `GET /api/merchant-master/merchants/{id}` | 照片类型下拉加载该商户下类型 |
| ORDER-FORM-003 | P0 | 选择照片类型自动新增明细行 | `ADMIN`/`DISPATCHER` | 已选择商户 | 选择照片类型 | 自动新增一行明细，接单价和派单价带出默认值 |
| ORDER-FORM-004 | P0 | 新增明细行 | `ADMIN`/`DISPATCHER` | 已选择商户和照片类型 | 点击“新增明细” | 新增一行，价格自动填默认值 |
| ORDER-FORM-005 | P0 | 删除明细行 | `ADMIN`/`DISPATCHER` | 已有多行明细 | 点击行删除并确认 | 行被删除；若无明细，提交按钮禁用 |
| ORDER-FORM-006 | P0 | 批量建单必填校验 | `ADMIN`/`DISPATCHER` | 有明细行 | 清空客户信息、张数、价格、订单号、下单时间后提交 | 展示字段错误，不调用保存接口 |
| ORDER-FORM-007 | P0 | 照片张数最小值 | `ADMIN`/`DISPATCHER` | 有明细行 | 输入照片张数小于 1 | 前端阻止或校验失败，后端也应拒绝 |
| ORDER-FORM-008 | P0 | 价格最小值 | `ADMIN`/`DISPATCHER` | 有明细行 | 输入接单价或派单价小于 0 | 前端阻止或校验失败，后端也应拒绝 |
| ORDER-FORM-009 | P0 | 批量建单成功 | `ADMIN`/`DISPATCHER` | 明细数据合法 | 调用 `POST /api/admin/orders/batch` | 返回成功，弹窗关闭，列表刷新，新订单状态为未派单 |
| ORDER-FORM-010 | P0 | 后端校验重复订单号 | `ADMIN`/`DISPATCHER` | 订单号已存在 | 提交批量建单 | 返回 409 或 `code=400`，页面展示错误 |
| ORDER-FORM-011 | P1 | 切换照片类型覆盖价格确认 | `ADMIN`/`DISPATCHER` | 已有多行明细 | 切换照片类型，弹出覆盖确认 | 点击覆盖则所有行价格更新；点击不覆盖则保留原价格 |
| ORDER-FORM-012 | P0 | Excel 导入仅接受 xlsx | `ADMIN`/`DISPATCHER` | 位于全部订单页 | 点击导入并选择非 `.xlsx` 文件 | 浏览器文件选择受限，后端也应拒绝非法文件 |
| ORDER-FORM-013 | P0 | Excel 导入预览成功 | `ADMIN`/`DISPATCHER` | 准备合法 `.xlsx` | 调用 `POST /api/admin/orders/import/preview` | 打开建单弹窗并展示预览行，提交按钮可用 |
| ORDER-FORM-014 | P0 | Excel 导入字段错误标红 | `ADMIN`/`DISPATCHER` | 准备缺必填字段的 `.xlsx` | 导入预览返回 `errors` | 对应行和字段显示错误，提交按钮禁用 |
| ORDER-FORM-015 | P0 | Excel 多商户阻塞提交 | `ADMIN`/`DISPATCHER` | `.xlsx` 包含多个商户 | 导入预览成功但存在多个商户 | 显示“导入文件中只能包含同一个商户和同一种照片类型”，提交禁用 |
| ORDER-FORM-016 | P0 | Excel 多照片类型阻塞提交 | `ADMIN`/`DISPATCHER` | `.xlsx` 包含多个照片类型 | 导入预览成功但存在多个照片类型 | 显示阻塞提示，提交禁用 |
| ORDER-FORM-017 | P0 | 编辑订单回填 | `ADMIN`/`DISPATCHER` | 明细表有订单 | 点击编辑 | 打开编辑弹窗，回填商户、客户、照片类型、张数、价格、订单号、时间、备注 |
| ORDER-FORM-018 | P0 | 编辑订单保存成功 | `ADMIN`/`DISPATCHER` | 打开编辑弹窗 | 修改可编辑字段，调用 `PUT /api/admin/orders` | 保存成功，弹窗关闭，列表展示最新数据 |
| ORDER-FORM-019 | P0 | 已完工订单编辑保持状态 | `ADMIN`/`DISPATCHER` | 已完工订单存在 | 编辑并保存 | 后端保持 `COMPLETED` 状态，不因编辑回退状态 |
| ORDER-FORM-020 | P0 | 后端禁止非法修改锁定字段 | `ADMIN`/`DISPATCHER` | 已派单或已完工订单 | 直接调用接口修改商户、照片类型或设计师 | 后端按业务规则拒绝或忽略非法修改 |
| ORDER-FORM-021 | P0 | 删除订单成功 | `ADMIN`/`DISPATCHER` | 订单存在 | 点击删除并确认，调用 `DELETE /api/admin/orders/{id}` | 删除成功，列表刷新 |
| ORDER-FORM-022 | P1 | 删除订单取消 | `ADMIN`/`DISPATCHER` | 订单存在 | 点击删除后取消 | 不调用删除接口，列表不变 |
| ORDER-FORM-023 | P1 | 订单价格最多三位小数 | `ADMIN`/`DISPATCHER` | 打开批量建单或编辑订单弹窗 | 接单价或派单价逐键输入超过 3 位小数，如 `2.34567` | 输入第 4 位小数时不进入输入框；列表、分组弹窗和汇总展示不出现 `1.200000047...` 等浮点长尾 |

### 6.8 订单状态流转

| 用例 ID | 优先级 | 用例名称 | 角色 | 前置条件 | 操作与接口 | 预期结果 |
| --- | --- | --- | --- | --- | --- | --- |
| FLOW-001 | P0 | 未派单订单显示派单按钮 | `ADMIN`/`DISPATCHER` | 订单状态 `UNASSIGNED` | 查看操作列 | 显示“派单、编辑、删除” |
| FLOW-002 | P0 | 派单成功 | `ADMIN`/`DISPATCHER` | 未派单订单、启用设计师存在 | 点击派单选择设计师，调用 `POST /api/admin/orders/dispatch` | 状态变为未完工，设计师列显示所选设计师 |
| FLOW-003 | P0 | 派单必须选择设计师 | `ADMIN`/`DISPATCHER` | 打开派单弹窗 | 不选择设计师 | 确认按钮禁用 |
| FLOW-004 | P0 | 非未派单订单不能走首次派单接口 | `ADMIN`/`DISPATCHER` | 订单状态非 `UNASSIGNED` | 直接请求 `/api/admin/orders/dispatch` | 后端返回 400 或业务错误 |
| FLOW-005 | P1 | 未完工订单显示改派按钮 | `ADMIN`/`DISPATCHER` | 订单状态 `UNCOMPLETED` | 查看操作列 | 显示“改派、编辑、删除” |
| FLOW-006 | P1 | 改派成功 | `ADMIN`/`DISPATCHER` | 未完工订单已有设计师 | 点击改派选择新设计师，调用 `PUT /api/orders/{id}/assign` | 设计师更新，状态仍为未完工 |
| FLOW-007 | P0 | 设计师提交完工 | `DESIGNER` | 设计师本人未完工订单 | 点击完工并确认，调用 `POST /api/designer/orders/complete` | 状态变为待审核，设计师页刷新 |
| FLOW-008 | P0 | 设计师不能完工他人订单 | `DESIGNER` | 使用设计师 A Token，订单属于设计师 B | 直接请求 `POST /api/designer/orders/complete` | 后端返回 403 或业务错误 |
| FLOW-009 | P0 | 非未完工订单不显示完工按钮 | `DESIGNER` | 订单状态待审核或已完工 | 查看操作列 | 不显示“完工”按钮 |
| FLOW-010 | P0 | 待审核订单显示通过和退回 | `ADMIN`/`DISPATCHER` | 订单状态 `PENDING_REVIEW` | 查看操作列 | 显示“通过、退回、编辑、删除” |
| FLOW-011 | P0 | 审核通过 | `ADMIN`/`DISPATCHER` | 待审核订单存在 | 点击通过，调用 `POST /api/admin/orders/approve` | 状态变为已完工，记录完工时间 |
| FLOW-012 | P0 | 审核退回 | `ADMIN`/`DISPATCHER` | 待审核订单存在 | 点击退回，调用 `POST /api/admin/orders/reject` | 状态变为未完工，重新回到设计师未完工列表 |
| FLOW-013 | P0 | 非待审核订单不能审核通过 | `ADMIN`/`DISPATCHER` | 非待审核订单 | 直接调用 `POST /api/admin/orders/approve` | 后端返回 400 或业务错误 |
| FLOW-014 | P0 | 非待审核订单不能审核退回 | `ADMIN`/`DISPATCHER` | 非待审核订单 | 直接调用 `POST /api/admin/orders/reject` | 后端返回 400 或业务错误 |
| FLOW-015 | P0 | 完整流程闭环 | `ADMIN`/`DISPATCHER`/`DESIGNER` | 新建未派单订单 | 新建订单、派单、设计师完工、调度审核通过 | 状态依次为未派单、未完工、待审核、已完工 |
| FLOW-016 | P0 | 退回后再次完工再通过 | `ADMIN`/`DISPATCHER`/`DESIGNER` | 待审核订单 | 调度退回，设计师再次完工，调度通过 | 状态按未完工、待审核、已完工流转 |

### 6.9 勾选、统计和导出

| 用例 ID | 优先级 | 用例名称 | 角色 | 前置条件 | 操作与接口 | 预期结果 |
| --- | --- | --- | --- | --- | --- | --- |
| EXPORT-001 | P0 | 无勾选时导出禁用 | `ADMIN`/`DISPATCHER` | 位于全部订单页 | 不勾选任何行 | “导出数据”按钮禁用 |
| EXPORT-002 | P0 | 明细表跨页勾选保留 | `ADMIN`/`DISPATCHER` | 明细订单大于一页 | 第 1 页勾选若干行，切到第 2 页继续勾选 | 已选数据跨页保留 |
| EXPORT-003 | P0 | 明细表已选统计正确 | `ADMIN`/`DISPATCHER` | 已勾选明细行 | 查看底部统计条 | 已选条数、照片张数、接单合计、派单合计正确 |
| EXPORT-004 | P1 | 明细表清空选择 | `ADMIN`/`DISPATCHER` | 已勾选明细行 | 点击“清空选择” | 勾选清空，统计条隐藏，导出禁用 |
| EXPORT-005 | P0 | 明细表导出已选 | `ADMIN`/`DISPATCHER` | 已勾选明细行 | 点击导出，调用 `POST /api/admin/orders/export`，`tableType=DETAIL` | 下载 `.xlsx`，请求只包含已选行 ID |
| EXPORT-006 | P0 | 明细导出表头正确 | `ADMIN`/`DISPATCHER` | 完成明细导出 | 打开导出文件 | 表头按订单明细定义输出 |
| EXPORT-007 | P0 | 汇总表跨页勾选保留 | `ADMIN`/`DISPATCHER` | 汇总记录大于一页 | 汇总模式跨页勾选 | 已选汇总行跨页保留 |
| EXPORT-008 | P0 | 汇总表已选统计正确 | `ADMIN`/`DISPATCHER` | 已勾选汇总行 | 查看底部统计条 | 已选条数、订单数量、照片张数、接单总价、派单总价、利润正确 |
| EXPORT-009 | P0 | 汇总表导出已选 | `ADMIN`/`DISPATCHER` | 已勾选汇总行 | 点击导出，`tableType=SUMMARY` | 下载 `.xlsx`，请求只包含已选汇总行 ID |
| EXPORT-010 | P0 | 汇总导出表头正确 | `ADMIN`/`DISPATCHER` | 完成汇总导出 | 打开导出文件 | 表头按汇总表定义输出 |
| EXPORT-011 | P0 | 设计师无导出入口 | `DESIGNER` | 已登录设计师 | 访问设计师订单页 | 页面不显示导出按钮 |
| EXPORT-012 | P0 | 设计师直接调用导出被拒绝 | `DESIGNER` | 使用设计师 Token | 请求 `POST /api/admin/orders/export` | 后端返回 403 |

### 6.10 设计师订单页

| 用例 ID | 优先级 | 用例名称 | 角色 | 前置条件 | 操作与接口 | 预期结果 |
| --- | --- | --- | --- | --- | --- | --- |
| DESIGNER-001 | P0 | 加载设计师订单列表 | `DESIGNER` | 已登录 | 访问 `/designer/orders`，调用 `POST /api/designer/orders/list` | 只展示当前设计师订单 |
| DESIGNER-002 | P0 | 设计师订单不展示价格字段 | `DESIGNER` | 设计师订单存在 | 查看表格 | 不展示接单价、接单合计、派单价、派单合计 |
| DESIGNER-003 | P0 | 设计师商户筛选 | `DESIGNER` | 有多个商户订单 | 选择商户查询 | 请求带 `merchants` 或按接口约定参数，结果匹配 |
| DESIGNER-004 | P0 | 设计师照片类型筛选 | `DESIGNER` | 有多个照片类型 | 选择照片类型查询 | 结果匹配 |
| DESIGNER-005 | P0 | 设计师状态筛选 | `DESIGNER` | 有未完工、待审核、已完工 | 选择状态查询 | 结果匹配 |
| DESIGNER-006 | P0 | 设计师时间范围筛选 | `DESIGNER` | 有跨日期订单 | 选择时间范围查询 | 结果在范围内 |
| DESIGNER-007 | P0 | 设计师关键词筛选 | `DESIGNER` | 有订单号、客户、备注 | 输入关键词查询 | 结果匹配 |
| DESIGNER-008 | P1 | 设计师分页 | `DESIGNER` | 订单大于 15 | 切换页码和 pageSize | 请求参数正确，列表刷新 |
| DESIGNER-009 | P0 | 设计师提交完工二次确认 | `DESIGNER` | 未完工订单存在 | 点击完工 | 弹出确认框，取消则不调用接口 |
| DESIGNER-010 | P0 | 设计师提交完工成功 | `DESIGNER` | 未完工订单存在 | 确认完工，调用 `POST /api/designer/orders/complete` | 状态变为待审核，完工按钮消失 |
| DESIGNER-011 | P0 | 设计师商家明细弹窗 | `DESIGNER` | 有本人订单 | 点击表头“商家名称”，调用 `GET /api/designer/orders/shop-groups` | 弹窗按商家分组，仅含本人可见订单 |
| DESIGNER-012 | P0 | 设计师数据隔离 | `DESIGNER` | 设计师 A、B 均有订单 | 使用设计师 A 登录 | 列表和分组均不展示设计师 B 订单 |

### 6.11 接口通用响应和异常

| 用例 ID | 优先级 | 用例名称 | 角色 | 前置条件 | 操作与接口 | 预期结果 |
| --- | --- | --- | --- | --- | --- | --- |
| API-001 | P0 | 成功响应格式 | 任意 | 业务接口成功 | 任意 JSON 接口 | 返回 `{ code: 200, message, data }`，前端使用 `data` |
| API-002 | P0 | 分页响应格式 | 任意 | 分页接口成功 | 列表接口 | 返回 `records`、`total`、`pageNo`、`pageSize` |
| API-003 | P0 | 业务错误格式 | 任意 | 参数非法 | 任意业务接口返回非 200 code | 前端展示 `message` |
| API-004 | P0 | 未登录错误 | 未登录 | 不带 Authorization | 请求业务接口 | 返回 301 或 401，前端跳登录 |
| API-005 | P0 | 无权限错误 | 低权限角色 | 请求高权限接口 | 例如设计师请求 `/api/users` | 返回 403 |
| API-006 | P0 | 数据不存在 | 任意 | 使用不存在 ID | 查询、编辑或删除不存在数据 | 返回 404，前端展示错误 |
| API-007 | P0 | 数据冲突 | `ADMIN`/`DISPATCHER` | 使用重复订单号或用户名 | 新增数据 | 返回 409 或业务错误，前端展示错误 |
| API-008 | P1 | 请求超时提示 | 任意 | 模拟接口超时 | 任意接口超过 15 秒 | 前端提示“请求超时，请稍后重试” |
| API-009 | P1 | 网络异常提示 | 任意 | 后端服务不可用 | 任意接口失败无响应 | 前端提示“网络异常，请检查后端服务或代理配置” |
| API-010 | P0 | Blob 导出不走 JSON 解包 | `ADMIN`/`DISPATCHER` | 勾选数据 | 调用导出接口，`rawResponse=true` | 前端拿到 `AxiosResponse<Blob>` 并下载文件 |
| API-011 | P1 | 并发 401 只刷新一次 | 任意 | 多个接口同时 401，refreshToken 有效 | 并发触发刷新 | 前端复用同一个 refreshTask，刷新成功后重试请求 |
| API-012 | P1 | 刷新接口本身 401 不循环重试 | 任意 | refreshToken 失效 | `POST /api/auth/refresh` 返回 401 | 清空登录态，不再继续刷新 |

### 6.12 非功能和兼容性

| 用例 ID | 优先级 | 用例名称 | 角色 | 前置条件 | 操作与接口 | 预期结果 |
| --- | --- | --- | --- | --- | --- | --- |
| NF-001 | P1 | 首屏加载性能 | 任意 | 正常网络 | 登录后进入首页 | 主要接口在可接受时间内返回，页面无长时间白屏 |
| NF-002 | P1 | 表格分页性能 | `ADMIN`/`DISPATCHER` | 大量订单数据 | 翻页、筛选、切换表格模式 | 页面无明显卡顿，后端分页返回 |
| NF-003 | P1 | 弹窗滚动体验 | `ADMIN`/`DISPATCHER` | 照片类型或订单明细较多 | 打开商户编辑、分组、建单弹窗 | 弹窗内容可滚动，底部按钮可操作 |
| NF-004 | P1 | 移动端布局 | 任意 | 浏览器宽度小于 900px | 访问登录页和业务页 | 页面不横向溢出关键操作，表单布局可用 |
| NF-005 | P1 | 空数据展示 | 任意 | 后端返回空列表 | 访问各列表页 | 页面不报错，表格空态正常 |
| NF-006 | P1 | 加载态展示 | 任意 | 接口延迟返回 | 触发列表、分组、导入、导出等操作 | 显示 loading，重复提交受到限制 |
| NF-007 | P0 | 前端隐藏不等于权限 | 低权限角色 | 使用接口工具直接请求 | 设计师请求管理端接口，调度请求用户管理接口 | 后端必须返回 403 |
| NF-008 | P1 | XSS 文本安全 | 任意 | 输入 `<script>alert(1)</script>` 作为客户或备注 | 保存并查看列表和弹窗 | 文本按普通内容展示，不执行脚本 |
| NF-009 | P1 | 金额精度 | `ADMIN`/`DISPATCHER` | 输入小数价格 | 建单、汇总、导出 | 金额按最多三位小数计算和展示，汇总不丢精度且不显示浮点长尾 |
| NF-010 | P1 | 日期格式一致性 | 任意 | 创建或筛选订单 | 查看列表、详情、导出 | 时间格式统一为 `YYYY-MM-DD HH:mm:ss` |

## 7. 端到端验收场景

| 场景 ID | 优先级 | 场景名称 | 执行步骤 | 预期结果 |
| --- | --- | --- | --- | --- |
| E2E-001 | P0 | 管理员完整建单到完工 | 管理员登录；新增设计师；新增商户和照片类型；批量建单；派单给设计师；设计师登录提交完工；管理员审核通过；导出明细 | 订单完整流转到已完工，设计师和调度页面状态一致，导出文件包含该订单 |
| E2E-002 | P0 | 调度建单并退回重做 | 调度登录；批量建单；派单；设计师提交完工；调度退回；设计师再次提交；调度审核通过 | 订单状态按未派单、未完工、待审核、未完工、待审核、已完工流转 |
| E2E-003 | P0 | 商户价格变更影响新订单 | 调度编辑商户照片类型默认价格；新建订单选择该商户和照片类型 | 新订单自动带出最新默认接单价和派单价，历史订单不被自动改价 |
| E2E-004 | P0 | 汇总和导出一致 | 准备多商户多订单；按商户、状态、时间筛选；切换汇总；勾选导出 | 页面汇总数据与导出文件一致 |
| E2E-005 | P0 | 权限隔离 | 使用管理员、调度、设计师分别登录；访问各自允许和不允许的页面；直接请求高权限接口 | 页面路由和接口权限均符合角色范围 |

## 8. 冒烟测试清单

上线前至少执行以下 P0 用例：

| 模块 | 必测用例 |
| --- | --- |
| 登录鉴权 | AUTH-001、AUTH-003、AUTH-004、AUTH-005、AUTH-012、AUTH-015、AUTH-018 |
| 个人设置 | ACCOUNT-004 |
| 用户管理 | USER-001、USER-005、USER-011、USER-014、USER-016 |
| 商户管理 | MERCHANT-001、MERCHANT-005、MERCHANT-012、MERCHANT-015、MERCHANT-017 |
| 全部订单 | ORDER-LIST-001、ORDER-LIST-002、ORDER-LIST-010、ORDER-SUM-001、ORDER-SUM-003 |
| 建单导入 | ORDER-FORM-003、ORDER-FORM-009、ORDER-FORM-013、ORDER-FORM-014、ORDER-FORM-018 |
| 状态流转 | FLOW-002、FLOW-007、FLOW-011、FLOW-012、FLOW-015 |
| 导出 | EXPORT-002、EXPORT-005、EXPORT-008、EXPORT-009、EXPORT-012 |
| 设计师页 | DESIGNER-001、DESIGNER-002、DESIGNER-010、DESIGNER-012 |
| 接口异常 | API-001、API-004、API-005、API-010 |

## 9. 验证记录模板

测试执行时建议按以下格式记录结果：

| 字段 | 内容 |
| --- | --- |
| 测试版本 | 前端 commit / 后端版本 / 数据库版本 |
| 测试环境 | 本地 / 测试服 / 预发 |
| 执行人 | 测试人员 |
| 执行时间 | `YYYY-MM-DD HH:mm:ss` |
| 用例 ID | 例如 `FLOW-015` |
| 执行结果 | 通过 / 失败 / 阻塞 |
| 实际结果 | 记录页面表现、接口响应、文件导出结果 |
| 缺陷编号 | 如有缺陷，关联缺陷单 |
| 备注 | 数据准备、临时绕过、接口未完成等 |

## 10. 风险和待确认项

| 编号 | 风险或待确认项 | 建议处理 |
| --- | --- | --- |
| RISK-001 | 旧需求文档写“不允许删除商户”，当前接口文档和前端实现支持删除商户 | 联调前确认最终业务规则；若不允许删除，应移除前端入口和接口用例 |
| RISK-002 | 当前前端存在“改派”入口，接口文档页面适配部分强调派单接口用于首次派单 | 明确改派是否保留；若保留，应稳定 `/api/orders/{id}/assign` 或新增页面适配接口 |
| RISK-003 | 用户管理页面编辑用户时密码为必填 | 若业务允许只改姓名不改密码，需要调整前端校验和测试用例 |
| RISK-004 | 设计师筛选参数当前前端传 `merchants`、`photoTypes` 文本数组，调度列表传 `shopIds`、`productTypeNames` | 后端需兼容两套页面参数，或统一前端字段 |
| RISK-005 | Excel 导入模板当前未在仓库中提供 | 建议补充标准模板和错误样例文件，便于稳定回归 |
