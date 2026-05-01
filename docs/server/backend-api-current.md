# 设计派单管理系统接口文档（Python 版）

更新时间：2026-05-01

## 1. 文档说明

本文档用于前后端联调和后端开发落地，业务规则以同目录开发文档为准：

```text
D:\Users\Daqie\Desktop\后台系统\设计派单管理系统开发文档-Python版.md
```

接口字段对外统一使用 `camelCase`，数据库和 ORM 内部可以使用 `snake_case`。第一版只做组合筛选，不做分类筛选。

2026-05-01 更新：客户信息不再作为商户下的独立客户表维护，订单直接保存 `customerInfo` 文本；新建订单支持批量新增，Excel 导入先预览校验并返回错误行索引，确认无误后再批量入库。

## 2. 通用约定

### 2.1 基础地址

```text
/api
```

### 2.2 请求头

除登录和刷新 Token 接口外，业务接口都需要携带 JWT：

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

导出接口返回文件流，不使用 JSON 响应。

### 2.3 通用响应头

业务接口响应会包含服务端处理耗时：

```http
X-Process-Time-Ms: 12.34
```

说明：单位为毫秒，用于排查接口性能；前端业务逻辑可以忽略。

### 2.4 通用返回格式

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {}
}
```

说明：成功响应 `code` 统一为 `200`，`message` 按接口动作返回对应中文提示，例如“登录成功”“查询订单成功”“创建订单成功”。

### 2.5 分页返回格式

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "records": [],
    "total": 0,
    "pageNo": 1,
    "pageSize": 20
  }
}
```

### 2.6 成功 message 对照表

说明：以下接口 HTTP 状态为业务实际状态；业务成功时响应体 `code` 一律为 `200`，并返回对应中文 `message`。导出接口返回 `.xlsx` 文件流，不使用 JSON 成功响应。

| 方法 | 路径 | 成功 message | 说明 |
| --- | --- | --- | --- |
| GET | `/api/health` | 服务正常 | 健康检查 |
| POST | `/api/auth/login` | 登录成功 | 登录 |
| POST | `/api/auth/refresh` | 刷新登录状态成功 | 刷新双 Token |
| POST | `/api/auth/logout` | 退出登录成功 | 退出登录 |
| GET | `/api/auth/me` | 查询当前用户成功 | 当前用户信息 |
| GET | `/api/users` | 查询账号成功 | 账号列表 |
| POST | `/api/users` | 创建账号成功 | 创建账号 |
| PUT | `/api/users/{id}` | 编辑账号成功 | 编辑账号信息 / 个人设置，可选修改密码 |
| DELETE | `/api/users/{id}` | 删除账号成功 | 删除账号 |
| GET | `/api/shops` | 查询店铺成功 | 店铺列表 |
| POST | `/api/shops` | 创建店铺成功 | 创建店铺 |
| PUT | `/api/shops/{id}` | 编辑店铺成功 | 编辑店铺 |
| DELETE | `/api/shops/{id}` | 删除店铺成功 | 删除店铺 |
| GET | `/api/product-types` | 查询商品类型成功 | 商品类型列表 |
| POST | `/api/product-types` | 创建商品类型成功 | 创建商品类型和动态字段 |
| PUT | `/api/product-types/{id}` | 编辑商品类型成功 | 编辑商品类型和动态字段 |
| DELETE | `/api/product-types/{id}` | 删除商品类型成功 | 删除商品类型 |
| GET | `/api/product-types/{id}/fields` | 查询动态字段成功 | 查询动态字段 |
| GET | `/api/orders` | 查询订单成功 | 订单明细列表 |
| POST | `/api/orders` | 创建订单成功 | 创建订单 |
| POST | `/api/admin/orders/batch` | 批量新增订单成功 | 页面批量建单，单条新增也走该结构 |
| POST | `/api/admin/orders/import/preview` | 导入文件解析成功 | Excel 导入预览校验，不入库 |
| GET | `/api/orders/{id}` | 查询订单详情成功 | 订单详情 |
| PUT | `/api/orders/{id}` | 编辑订单成功 | 编辑订单 |
| DELETE | `/api/orders/{id}` | 删除订单成功 | 删除订单 |
| PUT | `/api/orders/{id}/assign` | 派单成功 / 改派成功 | 无设计师时派单；已有设计师时改派 |
| PUT | `/api/orders/{id}/submit` | 提交完工成功 | 设计师提交完工 |
| PUT | `/api/orders/{id}/review` | 审核通过成功 | `action=APPROVE` |
| PUT | `/api/orders/{id}/review` | 审核不通过成功 | `action=REJECT` |
| GET | `/api/orders/summary` | 查询订单汇总成功 | 调度汇总表 |
| GET | `/api/statistics/overview` | 查询统计概览成功 | 首页统计 |
| GET | `/api/statistics/header` | 查询统计表头成功 | 字段详情弹窗 |
| POST | `/api/orders/export` | 不适用 | 返回 `.xlsx` 文件流，不返回 JSON |
| GET | `/api/logs` | 查询操作日志成功 | 操作日志列表 |
| GET | `/api/orders/filter-options` | 查询筛选项成功 | 真实前端筛选项 |
| POST | `/api/admin/orders/list` | 查询全部订单成功 | 真实前端全部订单明细 |
| POST | `/api/admin/orders/summary/list` | 查询订单汇总成功 | 真实前端全部订单汇总 |
| POST | `/api/admin/orders` | 新增订单成功 | 页面单条新建订单 |
| POST | `/api/admin/orders/batch` | 批量新增订单成功 | 页面批量建单，单条新增也走该结构 |
| POST | `/api/admin/orders/import/preview` | 导入文件解析成功 | Excel 导入预览校验，不入库 |
| PUT | `/api/admin/orders` | 编辑订单成功 | 页面编辑订单，可手动设置问题件/其他 |
| DELETE | `/api/admin/orders/{id}` | 删除订单成功 | 页面删除订单 |
| POST | `/api/admin/orders/dispatch` | 派单成功 | 页面派单 |
| POST | `/api/admin/orders/approve` | 审核通过成功 | 页面审核通过 |
| POST | `/api/admin/orders/reject` | 退回成功 | 页面审核退回 |
| GET | `/api/admin/orders/shop-groups` | 查询订单分组成功 | 页面商家分组弹窗 |
| GET | `/api/admin/orders/designer-groups` | 查询订单分组成功 | 页面设计师分组弹窗 |
| POST | `/api/admin/orders/export` | 不适用 | 页面勾选导出 `.xlsx` 文件流 |
| POST | `/api/designer/orders/list` | 查询设计师订单成功 | 真实前端设计师主页 |
| POST | `/api/designer/orders/complete` | 提交完工成功 | 页面设计师提交完工 |
| GET | `/api/designer/orders/shop-groups` | 查询商家明细成功 | 设计师商家分组弹窗 |
| POST | `/api/merchant-master/merchants/list` | 查询商户成功 | 真实前端商户列表 |
| GET | `/api/merchant-master/merchants/{id}` | 查询商户详情成功 | 真实前端商户详情 |
| POST | `/api/merchant-master/merchants` | 新增商户成功 | 真实前端新增商户 |
| POST | `/api/merchant-master/merchants/edit-data` | 查询商户编辑数据成功 | 真实前端编辑前取数 |
| PUT | `/api/merchant-master/merchants` | 保存商户成功 | 真实前端保存商户 |
| POST | `/api/merchant-master/merchants/delete` | 删除商户成功 | 真实前端删除商户 |

### 2.7 通用分页参数

| 参数 | 位置 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| pageNo | query | int | 否 | 1 | 页码 |
| pageSize | query | int | 否 | 20 | 每页条数，最大 100 |

### 2.8 通用错误码

| code | 说明 |
| --- | --- |
| 200 | 成功 |
| 400 | 参数错误 |
| 301 | 未登录或登录过期 |
| 401 | 登录失败或账号禁用 |
| 403 | 无权限 |
| 404 | 数据不存在 |
| 409 | 数据冲突，例如订单号重复 |
| 500 | 系统异常 |

### 2.9 枚举

用户角色：

| 值 | 说明 |
| --- | --- |
| DESIGNER | 设计师 |
| DISPATCHER | 调度 |
| ADMIN | 超级管理员 |

用户状态：

| 值 | 说明 |
| --- | --- |
| ENABLED | 启用 |
| DISABLED | 禁用 |

订单状态：

| 值 | 说明 |
| --- | --- |
| UNASSIGNED | 未派单 |
| UNCOMPLETED | 未完成 |
| PENDING_REVIEW | 待审核 |
| COMPLETED | 已完工 |
| PROBLEM | 问题件 |
| OTHER | 其他 |

动态字段类型：

| 值 | 说明 |
| --- | --- |
| TEXT | 单行文本 |
| TEXTAREA | 多行文本 |
| NUMBER | 数字 |
| DATE | 日期 |
| SELECT | 下拉选择 |

审核动作：

| 值 | 说明 |
| --- | --- |
| APPROVE | 审核通过，订单变为已完工 |
| REJECT | 审核回退，订单变为未完成 |

说明：当前审核接口只接受 `APPROVE` 和 `REJECT`。问题件、其他不通过审核接口切换，只能在订单编辑中手动设置为 `PROBLEM` 或 `OTHER`。

## 3. 通用数据结构

### 3.1 UserVO

```json
{
  "id": 1,
  "username": "admin",
  "realName": "超级管理员",
  "role": "ADMIN",
  "status": "ENABLED",
  "lastLoginAt": "2026-04-25 10:00:00",
  "createdAt": "2026-04-25 10:00:00",
  "updatedAt": "2026-04-25 10:00:00"
}
```

### 3.2 ShopVO

```json
{
  "id": 1,
  "shopName": "某某商户",
  "ownerName": "张三",
  "contactPhone": "13800000000",
  "remark": "",
  "createdAt": "2026-04-25 10:00:00",
  "updatedAt": "2026-04-25 10:00:00"
}
```

### 3.3 客户信息模型

客户信息不再提供独立 `ShopCustomerVO`，也不再提供商户客户增删改查接口。

订单创建、编辑、批量新增和 Excel 导入时直接传 `customerInfo` 文本，后端把该文本保存到订单数据中。

### 3.4 ProductTypeVO

```json
{
  "id": 1,
  "shopId": 1,
  "shopName": "某某商户",
  "typeName": "证件照",
  "defaultAcceptPrice": "10.00",
  "defaultDispatchPrice": "6.00",
  "sortOrder": 1,
  "fields": [],
  "createdAt": "2026-04-25 10:00:00",
  "updatedAt": "2026-04-25 10:00:00"
}
```

### 3.5 ProductTypeFieldVO

```json
{
  "id": 1,
  "productTypeId": 1,
  "fieldKey": "size",
  "fieldLabel": "尺寸",
  "fieldType": "TEXT",
  "required": true,
  "defaultValue": "",
  "options": [],
  "sortOrder": 1
}
```

### 3.6 OrderVO

```json
{
  "id": 1,
  "orderNo": "DD202604250001",
  "shopId": 1,
  "shopName": "某某商户",
  "customerInfo": "客户A",
  "productTypeId": 1,
  "productTypeName": "证件照",
  "photoCount": 10,
  "acceptUnitPrice": "10.00",
  "acceptTotalAmount": "100.00",
  "dispatchUnitPrice": "6.00",
  "dispatchTotalAmount": "60.00",
  "designerId": 2,
  "designerName": "设计师A",
  "status": "UNCOMPLETED",
  "requirementText": "",
  "remark": "",
  "orderedAt": "2026-04-25 10:00:00",
  "submittedAt": null,
  "reviewedAt": null,
  "dispatchedAt": "2026-04-25 10:10:00",
  "completedAt": null,
  "dynamicFields": [],
  "createdAt": "2026-04-25 10:00:00",
  "updatedAt": "2026-04-25 10:10:00"
}
```

## 4. 登录鉴权接口

### 4.1 登录

```http
POST /api/auth/login
```

权限：无需登录。

请求参数：

| 参数 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| username | body | string | 是 | 登录账号 |
| password | body | string | 是 | 登录密码 |

请求示例：

```json
{
  "username": "admin",
  "password": "123456"
}
```

返回数据：

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "accessToken": "jwt-token",
    "refreshToken": "refresh-jwt-token",
    "tokenType": "Bearer",
    "expiresIn": 7200,
    "refreshExpiresIn": 604800,
    "user": {
      "id": 1,
      "username": "admin",
      "realName": "超级管理员",
      "role": "ADMIN",
      "status": "ENABLED"
    }
  }
}
```

说明：

- `accessToken` 用于访问业务接口，建议有效期 2 小时。
- `refreshToken` 用于刷新登录状态，建议有效期 7 天。
- 前端业务请求只在请求头携带 `accessToken`。

### 4.2 刷新 Token

```http
POST /api/auth/refresh
```

权限：无需 accessToken，但必须提供有效 refreshToken。

请求参数：

| 参数 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| refreshToken | body | string | 是 | 登录接口返回的 refreshToken |

请求示例：

```json
{
  "refreshToken": "refresh-jwt-token"
}
```

返回数据：

```json
{
  "code": 200,
  "message": "刷新登录状态成功",
  "data": {
    "accessToken": "new-jwt-token",
    "refreshToken": "new-refresh-jwt-token",
    "tokenType": "Bearer",
    "expiresIn": 7200,
    "refreshExpiresIn": 604800
  }
}
```

说明：

- `refreshToken` 过期或无效时返回 401。
- 用户修改本人密码或被超级管理员重置密码后，旧 Token 失效。
- 第一版不引入 Redis 黑名单，退出登录由前端清除本地 Token。

### 4.3 退出登录

```http
POST /api/auth/logout
```

权限：已登录用户。

请求参数：无。

返回数据：

```json
{
  "code": 200,
  "message": "退出登录成功",
  "data": true
}
```

### 4.4 当前用户信息

```http
GET /api/auth/me
```

权限：已登录用户。

请求参数：无。

返回数据：

```json
{
  "code": 200,
  "message": "查询当前用户成功",
  "data": {
    "id": 1,
    "username": "admin",
    "realName": "超级管理员",
    "role": "ADMIN",
    "status": "ENABLED",
    "menus": [
      "orders",
      "shops",
      "productTypes",
      "users",
      "statistics",
      "logs"
    ]
  }
}
```

### 4.5 保存个人设置

```http
PUT /api/users/{id}
```

权限：已登录用户，仅可保存本人资料；超级管理员仍可通过同一接口编辑其他账号。

请求参数：

| 参数 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| id | path | int | 是 | 当前登录用户 ID |
| username | body | string | 否 | 登录账号；仅超级管理员本人允许修改，其他角色不能修改 |
| realName | body | string | 是 | 用户姓名 |
| role | body | string | 是 | 当前角色；只能传当前角色，不能修改自己的角色 |
| status | body | string | 是 | 当前账号状态；本人保存时只能传当前状态 |
| newPassword | body | string | 否 | 新密码；不填则不修改密码 |

说明：个人设置每次提交全字段；修改密码不校验原密码，也不需要传原密码字段。

请求示例：

```json
{
  "username": "designer",
  "realName": "设计师A",
  "role": "DESIGNER",
  "status": "ENABLED",
  "newPassword": "654321"
}
```

返回数据：

```json
{
  "code": 200,
  "message": "编辑账号成功",
  "data": {
    "id": 2,
    "username": "designer",
    "realName": "设计师A",
    "role": "DESIGNER",
    "status": "ENABLED",
    "lastLoginAt": "2026-04-28 10:00:00",
    "createdAt": "2026-04-25 10:00:00",
    "updatedAt": "2026-04-28 10:00:00"
  }
}
```

业务规则：

- 所有角色都可以修改本人姓名和密码。
- 普通角色不能修改登录账号和角色；超级管理员本人可以修改登录账号，但不能修改自己的角色。
- 修改登录账号或密码后，旧 Token 立即失效，前端应清理登录态并重新登录。

## 5. 账号管理接口

账号列表、创建、删除仅超级管理员可访问；编辑接口同时承担个人设置，已登录用户可以编辑本人资料。

### 5.1 账号列表

```http
GET /api/users
```

权限：超级管理员可编辑普通账号；已登录用户可编辑本人。

请求参数：

| 参数 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| pageNo | query | int | 否 | 页码 |
| pageSize | query | int | 否 | 每页条数 |
| role | query | string | 否 | DESIGNER / DISPATCHER |
| status | query | string | 否 | ENABLED / DISABLED |
| keyword | query | string | 否 | 登录账号、姓名关键词 |

返回数据：

```json
{
  "code": 200,
  "message": "查询账号成功",
  "data": {
    "records": [
      {
        "id": 2,
        "username": "designer01",
        "realName": "设计师A",
        "role": "DESIGNER",
        "status": "ENABLED",
        "lastLoginAt": null,
        "createdAt": "2026-04-25 10:00:00",
        "updatedAt": "2026-04-25 10:00:00"
      }
    ],
    "total": 1,
    "pageNo": 1,
    "pageSize": 20
  }
}
```

### 5.2 创建账号

```http
POST /api/users
```

权限：超级管理员。

请求参数：

| 参数 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| username | body | string | 是 | 登录账号，唯一 |
| password | body | string | 是 | 初始密码 |
| realName | body | string | 是 | 用户姓名 |
| role | body | string | 是 | 只能为 DESIGNER 或 DISPATCHER |
| status | body | string | 否 | ENABLED / DISABLED，默认 ENABLED |

请求示例：

```json
{
  "username": "designer01",
  "password": "123456",
  "realName": "设计师A",
  "role": "DESIGNER",
  "status": "ENABLED"
}
```

返回数据：`UserVO`。成功 message：`创建账号成功`。

### 5.3 编辑账号

```http
PUT /api/users/{id}
```

权限：超级管理员。

请求参数：

| 参数 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| id | path | int | 是 | 用户 ID |
| username | body | string | 否 | 登录账号；仅超级管理员编辑本人时允许修改，必须唯一 |
| realName | body | string | 是 | 用户姓名 |
| role | body | string | 是 | DESIGNER / DISPATCHER；超级管理员编辑本人时传 ADMIN，且不能修改为其他角色 |
| status | body | string | 是 | ENABLED / DISABLED |
| newPassword | body | string | 否 | 新密码；填写时修改该账号密码，不填则不修改密码；不需要原密码 |

请求示例：

```json
{
  "username": "designer01",
  "realName": "设计师A",
  "role": "DESIGNER",
  "status": "ENABLED",
  "newPassword": "123456"
}
```

返回数据：`UserVO`。成功 message：`编辑账号成功`。

业务规则：

- 超级管理员可以编辑本人用户名，但 `role` 必须保持 `ADMIN`，不能把自己改成调度或设计师。
- 超级管理员本人用户名变更后，旧 Token 立即失效，前端应清理登录态并让用户使用新用户名重新登录。
- 编辑其他账号时不允许修改登录账号，不允许把角色设置为 `ADMIN`。
- 填写 `newPassword` 时会重置目标账号密码，并递增目标账号 `tokenVersion`，旧 Token 立即失效。
- 普通角色调用该接口时只能编辑本人，必须提交全字段，不能修改登录账号、角色和账号状态。

### 5.4 删除账号

```http
DELETE /api/users/{id}
```

权限：超级管理员。

请求参数：

| 参数 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| id | path | int | 是 | 用户 ID |

返回数据：

```json
{
  "code": 200,
  "message": "删除账号成功",
  "data": true
}
```

## 6. 商户管理接口

调度和超级管理员可访问，设计师不可访问。

### 6.1 商户列表

```http
GET /api/shops
```

请求参数：

| 参数 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| pageNo | query | int | 否 | 页码 |
| pageSize | query | int | 否 | 每页条数 |
| keyword | query | string | 否 | 商户名称、负责人、联系方式关键词 |

返回数据：

```json
{
  "code": 200,
  "message": "查询店铺成功",
  "data": {
    "records": [
      {
        "id": 1,
        "shopName": "某某商户",
        "ownerName": "张三",
        "contactPhone": "13800000000",
        "remark": "",
        "createdAt": "2026-04-25 10:00:00",
        "updatedAt": "2026-04-25 10:00:00"
      }
    ],
    "total": 1,
    "pageNo": 1,
    "pageSize": 20
  }
}
```

### 6.2 创建商户

```http
POST /api/shops
```

请求参数：

| 参数 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| shopName | body | string | 是 | 商户名称 |
| ownerName | body | string | 否 | 负责人 |
| contactPhone | body | string | 否 | 联系方式 |
| remark | body | string | 否 | 备注 |

请求示例：

```json
{
  "shopName": "某某商户",
  "ownerName": "张三",
  "contactPhone": "13800000000",
  "remark": ""
}
```

返回数据：`ShopVO`。成功 message：`创建店铺成功`。

### 6.3 编辑商户

```http
PUT /api/shops/{id}
```

请求参数：

| 参数 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| id | path | int | 是 | 商户 ID |
| shopName | body | string | 是 | 商户名称 |
| ownerName | body | string | 否 | 负责人 |
| contactPhone | body | string | 否 | 联系方式 |
| remark | body | string | 否 | 备注 |

返回数据：`ShopVO`。成功 message：`编辑店铺成功`。

### 6.4 删除商户

```http
DELETE /api/shops/{id}
```

请求参数：

| 参数 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| id | path | int | 是 | 商户 ID |

返回数据：

```json
{
  "code": 200,
  "message": "删除店铺成功",
  "data": true
}
```

### 6.5 商户客户接口已移除

客户信息不再挂在商户下面维护，以下接口已废弃并从后端移除：

```http
GET /api/shops/{id}/customers
POST /api/shops/{id}/customers
PUT /api/shop-customers/{id}
DELETE /api/shop-customers/{id}
```

新增订单、编辑订单、批量新增和 Excel 导入时，直接在订单字段 `customerInfo` 中填写客户信息。

## 7. 照片类型和动态字段接口

调度和超级管理员可访问，设计师不可访问。

### 7.1 照片类型列表

```http
GET /api/product-types
```

请求参数：

| 参数 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| pageNo | query | int | 否 | 页码 |
| pageSize | query | int | 否 | 每页条数 |
| shopId | query | int | 否 | 商户 ID |
| keyword | query | string | 否 | 照片类型名称关键词 |

返回数据：分页 `ProductTypeVO`。成功 message：`查询商品类型成功`。

### 7.2 创建照片类型和动态字段

```http
POST /api/product-types
```

请求参数：

| 参数 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| shopId | body | int | 是 | 商户 ID |
| typeName | body | string | 是 | 照片类型名称 |
| defaultAcceptPrice | body | decimal | 是 | 默认接单价，不能小于 0 |
| defaultDispatchPrice | body | decimal | 是 | 默认派单价，不能小于 0 |
| sortOrder | body | int | 否 | 排序 |
| fields | body | array | 否 | 动态字段列表 |

`fields` 字段项：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| fieldKey | string | 是 | 字段标识，同一个照片类型下唯一 |
| fieldLabel | string | 是 | 字段名称 |
| fieldType | string | 是 | TEXT / TEXTAREA / NUMBER / DATE / SELECT |
| required | boolean | 是 | 是否必填 |
| defaultValue | string | 否 | 默认值 |
| options | array | 否 | SELECT 选项 |
| sortOrder | int | 否 | 排序 |

请求示例：

```json
{
  "shopId": 1,
  "typeName": "证件照",
  "defaultAcceptPrice": "10.00",
  "defaultDispatchPrice": "6.00",
  "sortOrder": 1,
  "fields": [
    {
      "fieldKey": "size",
      "fieldLabel": "尺寸",
      "fieldType": "TEXT",
      "required": true,
      "defaultValue": "",
      "options": [],
      "sortOrder": 1
    }
  ]
}
```

返回数据：`ProductTypeVO`。成功 message：`创建商品类型成功`。

### 7.3 编辑照片类型和动态字段

```http
PUT /api/product-types/{id}
```

请求参数同创建接口，额外包含：

| 参数 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| id | path | int | 是 | 照片类型 ID |

返回数据：`ProductTypeVO`。成功 message：`编辑商品类型成功`。

### 7.4 删除照片类型

```http
DELETE /api/product-types/{id}
```

请求参数：

| 参数 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| id | path | int | 是 | 照片类型 ID |

返回数据：`true`。成功 message：`删除商品类型成功`。

### 7.5 获取照片类型动态字段

```http
GET /api/product-types/{id}/fields
```

请求参数：

| 参数 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| id | path | int | 是 | 照片类型 ID |

返回数据：

```json
{
  "code": 200,
  "message": "查询动态字段成功",
  "data": [
    {
      "id": 1,
      "productTypeId": 1,
      "fieldKey": "size",
      "fieldLabel": "尺寸",
      "fieldType": "TEXT",
      "required": true,
      "defaultValue": "",
      "options": [],
      "sortOrder": 1
    }
  ]
}
```

## 8. 订单管理接口

### 8.1 订单明细列表

```http
GET /api/orders
```

权限：设计师、调度、超级管理员。

数据权限：

- 设计师只能查看派发给自己的订单。
- 调度和超级管理员可以查看全部订单。

请求参数：

| 参数 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| pageNo | query | int | 否 | 页码 |
| pageSize | query | int | 否 | 每页条数 |
| shopIds | query | int[] | 否 | 商户 ID 多选，重复传参：`shopIds=1&shopIds=2` |
| productTypeIds | query | int[] | 否 | 照片类型 ID 多选，重复传参：`productTypeIds=1&productTypeIds=2` |
| statuses | query | string[] | 否 | 订单状态多选，重复传参：`statuses=UNASSIGNED&statuses=COMPLETED` |
| designerIds | query | int[] | 否 | 设计师 ID 多选，重复传参；设计师角色传了也只能看自己 |
| startTime | query | string | 否 | 下单开始时间 |
| endTime | query | string | 否 | 下单结束时间 |
| keyword | query | string | 否 | 订单号、客户信息、备注关键词 |

返回数据：

```json
{
  "code": 200,
  "message": "查询订单成功",
  "data": {
    "records": [
      {
        "id": 1,
        "orderNo": "DD202604250001",
        "shopId": 1,
        "shopName": "某某商户",
        "customerInfo": "客户A",
        "productTypeId": 1,
        "productTypeName": "证件照",
        "photoCount": 10,
        "acceptUnitPrice": "10.00",
        "acceptTotalAmount": "100.00",
        "dispatchUnitPrice": "6.00",
        "dispatchTotalAmount": "60.00",
        "designerId": 2,
        "designerName": "设计师A",
        "status": "UNCOMPLETED",
        "remark": "",
        "orderedAt": "2026-04-25 10:00:00",
        "completedAt": null
      }
    ],
    "total": 1,
    "pageNo": 1,
    "pageSize": 20
  }
}
```

说明：设计师角色返回时，后端可以不返回接单价、派单价、合计金额等调度字段，或返回为 `null`。

### 8.2 创建订单

```http
POST /api/orders
```

权限：调度、超级管理员。

请求参数：

| 参数 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| orderNo | body | string | 是 | 订单号，手动录入，唯一 |
| shopId | body | int | 是 | 商户 ID |
| customerInfo | body | string | 是 | 客户信息文本，直接保存在订单中 |
| productTypeId | body | int | 是 | 照片类型 ID |
| photoCount | body | int | 是 | 照片张数，必须大于 0 |
| acceptUnitPrice | body | decimal | 是 | 接单价 |
| dispatchUnitPrice | body | decimal | 是 | 派单价 |
| requirementText | body | string | 否 | 设计要求 |
| remark | body | string | 否 | 备注 |
| orderedAt | body | string | 是 | 下单时间 |
| dynamicFields | body | array | 否 | 动态字段值 |

`dynamicFields` 字段项：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| fieldId | int | 是 | 动态字段定义 ID |
| fieldValue | string | 否 | 字段值 |

请求示例：

```json
{
  "orderNo": "DD202604250001",
  "shopId": 1,
  "customerInfo": "客户A",
  "productTypeId": 1,
  "photoCount": 10,
  "acceptUnitPrice": "10.00",
  "dispatchUnitPrice": "6.00",
  "requirementText": "",
  "remark": "",
  "orderedAt": "2026-04-25 10:00:00",
  "dynamicFields": [
    {
      "fieldId": 1,
      "fieldValue": "一寸"
    }
  ]
}
```

返回数据：`OrderVO`。成功 message：`创建订单成功`。

业务规则：

- 建单时不传设计师。
- 创建后状态为 `UNASSIGNED`。
- `designerId` 为空。
- 客户信息直接保存为订单 `customerInfo`，不再绑定商户客户 ID。
- 后端计算 `acceptTotalAmount` 和 `dispatchTotalAmount`。

### 8.2.1 批量创建订单

```http
POST /api/admin/orders/batch
```

权限：调度、超级管理员。

说明：页面新建订单统一走批量结构；新增单条订单时，`orders` 数组只传一条数据。

请求参数：

| 参数 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| merchantName | body | string | 是 | 商户名称 |
| photoType | body | string | 是 | 照片类型名称 |
| orders | body | array | 是 | 批量订单明细，至少 1 条 |

`orders` 明细字段：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| customerInfo | string | 是 | 客户信息文本 |
| photoCount | int/string | 是 | 照片张数，必须大于 0 |
| acceptUnitPrice | decimal/string | 是 | 接单价，不小于 0 |
| dispatchUnitPrice | decimal/string | 是 | 派单价，不小于 0 |
| orderNo | string | 是 | 订单号，整库唯一，批次内也不能重复 |
| orderedAt | string | 是 | 下单时间，`YYYY-MM-DD HH:mm:ss` |
| remark | string | 否 | 备注 |

请求示例：

```json
{
  "merchantName": "云帆摄影",
  "photoType": "精修",
  "orders": [
    {
      "customerInfo": "李小姐",
      "photoCount": "8",
      "acceptUnitPrice": "12.00",
      "dispatchUnitPrice": "8.00",
      "orderNo": "DD202605010001",
      "orderedAt": "2026-05-01 10:00:00",
      "remark": "加急处理"
    }
  ]
}
```

成功返回：`OrderVO[]`。成功 message：`批量新增订单成功`。

校验失败返回：

```json
{
  "code": 400,
  "message": "批量订单校验失败",
  "data": {
    "valid": false,
    "errors": [
      {
        "index": 1,
        "field": "orderNo",
        "message": "订单号已存在"
      }
    ]
  }
}
```

业务规则：

- 整批校验，全部通过才入库。
- 任一行失败时整批不写入，并返回错误所在数组索引 `index`、字段 `field` 和中文错误信息 `message`。
- 后端默认订单状态为 `UNASSIGNED`。

### 8.2.2 Excel 导入预览

```http
POST /api/admin/orders/import/preview
```

权限：调度、超级管理员。

请求方式：`multipart/form-data`

| 参数 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| file | form-data | file | 是 | `.xlsx` 文件 |

Excel 表头沿用导出明细表：

```text
订单号、商户、客户、照片类型、照片数、状态、设计师、接单价、接单合计、派单价、派单合计、备注、下单时间、完工时间
```

导入预览只读取以下列：

```text
订单号、商户、客户、照片类型、照片数、接单价、派单价、备注、下单时间
```

忽略以下列：

```text
状态、设计师、接单合计、派单合计、完工时间、合计行
```

返回示例：

```json
{
  "code": 200,
  "message": "导入文件解析成功",
  "data": {
    "valid": false,
    "rows": [
      {
        "index": 0,
        "excelRowNumber": 2,
        "merchantName": "云帆摄影",
        "photoType": "精修",
        "customerInfo": "李小姐",
        "photoCount": "8",
        "acceptUnitPrice": "12.00",
        "dispatchUnitPrice": "8.00",
        "orderNo": "DD202605010001",
        "orderedAt": "2026-05-01 10:00:00",
        "remark": "加急处理"
      }
    ],
    "errors": [
      {
        "index": 1,
        "excelRowNumber": 3,
        "field": "orderNo",
        "message": "订单号不能为空"
      }
    ]
  }
}
```

业务规则：

- 该接口只解析和校验，不写入数据库。
- `index` 为返回 `rows` 数组中的 0 基索引，前端用于精准标红。
- `excelRowNumber` 为 Excel 原始行号，前端可用于提示用户第几行出错。
- 前端修改错误数据后，调用 `POST /api/admin/orders/batch` 执行最终入库。

### 8.3 订单详情

```http
GET /api/orders/{id}
```

权限：设计师、调度、超级管理员。

请求参数：

| 参数 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| id | path | int | 是 | 订单 ID |

返回数据：`OrderVO`。成功 message：`查询订单详情成功`。

说明：

- 设计师只能查看自己的订单。
- 设计师不展示调度价格字段。

### 8.4 编辑订单

```http
PUT /api/orders/{id}
```

权限：调度、超级管理员。

请求参数：

| 参数 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| id | path | int | 是 | 订单 ID |
| orderNo | body | string | 是 | 订单号 |
| shopId | body | int | 是 | 商户 ID |
| customerInfo | body | string | 是 | 客户信息文本 |
| productTypeId | body | int | 是 | 照片类型 ID |
| photoCount | body | int | 是 | 照片张数 |
| acceptUnitPrice | body | decimal | 是 | 接单价 |
| dispatchUnitPrice | body | decimal | 是 | 派单价 |
| requirementText | body | string | 否 | 设计要求 |
| remark | body | string | 否 | 备注 |
| orderedAt | body | string | 是 | 下单时间 |
| dynamicFields | body | array | 否 | 动态字段值 |

请求示例同创建订单。

返回数据：`OrderVO`。成功 message：`编辑订单成功`。

业务规则：

- 已完工订单允许编辑。
- 已完工订单编辑后状态保持 `COMPLETED`。
- 已完工订单不允许修改商户和照片类型，即不允许修改 `shopId` 和 `productTypeId`。

### 8.5 删除订单

```http
DELETE /api/orders/{id}
```

权限：调度、超级管理员。

请求参数：

| 参数 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| id | path | int | 是 | 订单 ID |

返回数据：`true`。成功 message：`删除订单成功`。

说明：删除采用物理删除，同时记录操作日志。

## 9. 派单和审核接口

### 9.1 派单或改派设计师

```http
PUT /api/orders/{id}/assign
```

权限：调度、超级管理员。

请求参数：

| 参数 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| id | path | int | 是 | 订单 ID |
| designerId | body | int | 是 | 设计师 ID |

请求示例：

```json
{
  "designerId": 2
}
```

返回数据：`OrderVO`。成功 message：首次派单返回 `派单成功`，改派返回 `改派成功`。

业务规则：

- 目标用户必须是启用状态的设计师。
- 一个订单同一时间只能绑定一个设计师。
- 派单后状态为 `UNCOMPLETED`。

### 9.2 设计师提交完工

```http
PUT /api/orders/{id}/submit
```

权限：设计师。

请求参数：

| 参数 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| id | path | int | 是 | 订单 ID |
| remark | body | string | 否 | 完工备注 |

请求示例：

```json
{
  "remark": "已完成"
}
```

返回数据：`OrderVO`。成功 message：`提交完工成功`。

业务规则：

- 设计师只能提交自己的订单。
- 当前状态必须为 `UNCOMPLETED`。
- 提交后状态为 `PENDING_REVIEW`。

### 9.3 审核通过和审核退回

```http
PUT /api/orders/{id}/review
```

权限：调度、超级管理员。

请求参数：

| 参数 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| id | path | int | 是 | 订单 ID |
| action | body | string | 是 | APPROVE / REJECT |
| reason | body | string | 否 | 原因或备注 |

请求示例：

```json
{
  "action": "APPROVE",
  "reason": ""
}
```

返回数据：`OrderVO`。成功 message 按 `action` 返回：`APPROVE` 为 `审核通过成功`，`REJECT` 为 `审核不通过成功`。

业务规则：

- `APPROVE`：待审核变为已完工。
- `REJECT`：待审核回退为未完成。
- `APPROVE` 和 `REJECT` 仅允许当前状态为 `PENDING_REVIEW` 的订单操作。
- 问题件和其他不通过审核接口切换，只能由调度或超级管理员在订单编辑接口中手动设置。

## 10. 汇总和统计接口

### 10.1 调度汇总表

```http
GET /api/orders/summary
```

权限：调度、超级管理员。

请求参数：

| 参数 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| pageNo | query | int | 否 | 页码 |
| pageSize | query | int | 否 | 每页条数 |
| shopIds | query | int[] | 否 | 商户 ID 多选，重复传参：`shopIds=1&shopIds=2` |
| productTypeIds | query | int[] | 否 | 照片类型 ID 多选，重复传参：`productTypeIds=1&productTypeIds=2` |
| statuses | query | string[] | 否 | 订单状态多选，重复传参：`statuses=UNASSIGNED&statuses=COMPLETED` |
| designerIds | query | int[] | 否 | 设计师 ID 多选，重复传参：`designerIds=2&designerIds=3` |
| startTime | query | string | 否 | 下单开始时间 |
| endTime | query | string | 否 | 下单结束时间 |
| keyword | query | string | 否 | 关键词 |

返回数据：

```json
{
  "code": 200,
  "message": "查询订单汇总成功",
  "data": {
    "records": [
      {
        "shopId": 1,
        "shopName": "某某商户",
        "orderCount": 20,
        "photoCount": 200,
        "acceptTotalAmount": "2000.00",
        "dispatchTotalAmount": "1200.00",
        "profitAmount": "800.00",
        "orderTime": "2026-04"
      }
    ],
    "total": 1,
    "pageNo": 1,
    "pageSize": 20
  }
}
```

### 10.2 首页统计

```http
GET /api/statistics/overview
```

权限：设计师、调度、超级管理员。

请求参数：无。

返回数据：

```json
{
  "code": 200,
  "message": "查询统计概览成功",
  "data": {
    "unassignedCount": 5,
    "uncompletedCount": 10,
    "pendingReviewCount": 3,
    "completedCount": 100,
    "problemCount": 2,
    "otherCount": 1
  }
}
```

说明：设计师角色只统计本人订单。

### 10.3 字段详情弹窗数据

```http
GET /api/statistics/header
```

权限：设计师、调度、超级管理员。

请求参数：

| 参数 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| type | query | string | 是 | SHOP / DESIGNER |
| shopId | query | int | 否 | type=SHOP 时使用 |
| designerId | query | int | 否 | type=DESIGNER 时使用 |
| startTime | query | string | 否 | 开始时间 |
| endTime | query | string | 否 | 结束时间 |
| limit | query | int | 否 | 返回记录数，默认 100，范围 1-500 |

返回数据：

```json
{
  "code": 200,
  "message": "查询统计表头成功",
  "data": {
    "type": "SHOP",
    "records": [
      {
        "shopName": "某某商户",
        "customerName": "客户A",
        "orderNo": "DD202604250001",
        "productTypeName": "证件照",
        "status": "UNCOMPLETED",
        "photoCount": 10,
        "unitPrice": "10.00",
        "designUnitPrice": "6.00",
        "designTotalAmount": "60.00",
        "remark": "",
        "orderedAt": "2026-04-25 10:00:00",
        "designerName": "设计师A"
      }
    ]
  }
}
```

说明：设计师角色只查看本人订单，价格相关字段返回 `null`。

## 11. 导出接口

### 11.1 导出当前表格数据

```http
GET /api/orders/export
```

权限：调度、超级管理员。

请求参数：

| 参数 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| tableType | query | string | 是 | DETAIL / SUMMARY |
| shopIds | query | int[] | 否 | 商户 ID 多选，重复传参：`shopIds=1&shopIds=2` |
| productTypeIds | query | int[] | 否 | 照片类型 ID 多选，重复传参：`productTypeIds=1&productTypeIds=2` |
| statuses | query | string[] | 否 | 订单状态多选，重复传参：`statuses=UNASSIGNED&statuses=COMPLETED` |
| designerIds | query | int[] | 否 | 设计师 ID 多选，重复传参：`designerIds=2&designerIds=3` |
| startTime | query | string | 否 | 下单开始时间 |
| endTime | query | string | 否 | 下单结束时间 |
| keyword | query | string | 否 | 关键词 |

返回数据：`.xlsx` 文件流。

响应头示例：

```http
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="orders.xlsx"
```

说明：

- `DETAIL` 导出订单明细表。
- `SUMMARY` 导出调度汇总表。
- 导出数据必须和当前组合筛选条件一致；前端多选筛选使用 `shopIds`、`productTypeIds`、`statuses`、`designerIds` 重复传参。
- 单次导出最多支持 10000 条记录；超过上限返回 400，提示“导出数据超过上限，最多支持 10000 条”。
- 设计师不允许导出。

## 12. 操作日志接口

### 12.1 操作日志列表

```http
GET /api/logs
```

权限：调度、超级管理员。

请求参数：

| 参数 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| pageNo | query | int | 否 | 页码 |
| pageSize | query | int | 否 | 每页条数 |
| operatorId | query | int | 否 | 操作人 ID |
| actionType | query | string | 否 | 操作类型 |
| targetType | query | string | 否 | 操作对象类型 |
| startTime | query | string | 否 | 开始时间 |
| endTime | query | string | 否 | 结束时间 |

返回数据：

```json
{
  "code": 200,
  "message": "查询操作日志成功",
  "data": {
    "records": [
      {
        "id": 1,
        "operatorId": 1,
        "operatorName": "超级管理员",
        "operatorRole": "ADMIN",
        "actionType": "CREATE_ORDER",
        "targetType": "ORDER",
        "targetId": 1,
        "targetName": "DD202604250001",
        "content": "创建订单",
        "remark": "",
        "createdAt": "2026-04-25 10:00:00"
      }
    ],
    "total": 1,
    "pageNo": 1,
    "pageSize": 20
  }
}
```

说明：登录失败等无法定位到系统用户的日志，`operatorId`、`operatorName`、`operatorRole` 可能为 `null`。

## 13. 真实前端页面适配接口

说明：本节接口是当前 Vue 前端页面实际优先调用的页面适配接口。旧 REST 接口仍按前文保留，但前端页面联调以本节字段形态为准。

### 13.1 查询订单筛选项

```http
GET /api/orders/filter-options
```

权限：已登录用户。

返回数据：

```json
{
  "code": 200,
  "message": "查询筛选项成功",
  "data": {
    "shops": [{ "id": 1, "name": "云帆摄影" }],
    "productTypes": [{ "name": "精修" }],
    "statuses": [{ "value": "UNASSIGNED", "label": "未派单" }],
    "designers": [{ "id": 8, "name": "林设计" }],
    "merchants": ["云帆摄影"],
    "photoTypes": ["精修"],
    "designerNames": ["林设计"]
  }
}
```

### 13.2 全部订单明细列表

```http
POST /api/admin/orders/list
```

权限：调度、超级管理员。

请求 body：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| pageNo | int | 否 | 页码，默认 1 |
| pageSize | int | 否 | 每页条数 |
| merchants | string[] | 否 | 商户名称多选 |
| photoTypes | string[] | 否 | 照片类型名称多选 |
| statuses | string[] | 否 | 状态编码或中文状态多选 |
| designers | string[] | 否 | 设计师名称多选 |
| dateRange | string[] | 否 | `[开始时间, 结束时间]` |
| shopIds | int[] | 否 | 商户 ID 多选 |
| productTypeNames | string[] | 否 | 照片类型名称多选 |
| designerIds | int[] | 否 | 设计师 ID 多选 |
| startTime | string | 否 | 下单开始时间 |
| endTime | string | 否 | 下单结束时间 |
| keyword | string | 否 | 订单号、客户信息、备注关键词 |

返回字段按真实前端表格：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | int | 订单唯一 ID |
| index | int | 当前筛选下序号 |
| merchant | string | 商户名称 |
| photoType | string | 照片类型 |
| status | string | 中文状态 |
| designer | string | 设计师名称，未派单为空字符串 |
| orderNo | string | 订单号 |
| photoCount | int | 照片张数 |
| customer | string | 客户信息文本 |
| receivePrice | number | 接单价 |
| receiveTotal | number | 接单合计 |
| dispatchPrice | number | 派单价 |
| dispatchTotal | number | 派单合计 |
| remark | string | 备注 |
| orderedAt | string | 下单时间 |
| completedAt | string | 完工时间，未完成为空字符串 |

成功 message：`查询全部订单成功`。

### 13.3 全部订单汇总列表

```http
POST /api/admin/orders/summary/list
```

权限：调度、超级管理员。

请求 body：同 `POST /api/admin/orders/list`。

返回字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string/int | 汇总行 ID，可能为 `summary-<shopId>-<month>` |
| index | int | 当前筛选下序号 |
| merchant | string | 商户名称 |
| orderCount | int | 订单数量 |
| photoCount | int | 照片张数 |
| receiveTotal | number | 接单总价 |
| dispatchTotal | number | 派单总价 |
| profit | number | 利润 |
| orderedAt | string | 汇总时间文本 |

成功 message：`查询订单汇总成功`。

### 13.4 页面单条新建订单

```http
POST /api/admin/orders
```

权限：调度、超级管理员。

说明：当前推荐前端新增统一走批量建单接口；该接口是页面适配层现有单条新建入口。

请求 body：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| orderNo | string | 是 | 订单号，唯一 |
| merchantName | string | 否 | 商户名称；不传 `shopId` 时必填 |
| shopId | int | 否 | 商户 ID |
| customerInfo | string | 是 | 客户信息文本 |
| photoType | string | 否 | 照片类型；不传 `productTypeName` 时使用 |
| productTypeName | string | 否 | 照片类型 |
| photoCount | int | 是 | 照片张数，必须大于 0 |
| acceptUnitPrice | decimal | 是 | 接单价 |
| dispatchUnitPrice | decimal | 是 | 派单价 |
| orderedAt | string | 是 | 下单时间 |
| remark | string | 否 | 备注 |

成功 message：`新增订单成功`。返回字段同全部订单明细行。

### 13.5 页面批量建单

```http
POST /api/admin/orders/batch
```

权限：调度、超级管理员。

说明：当前前端新增一条或多条订单均优先使用该接口。

请求 body：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| merchantName | string | 否 | 批量默认商户名称 |
| shopId | int | 否 | 批量默认商户 ID |
| photoType | string | 否 | 批量默认照片类型 |
| productTypeName | string | 否 | 批量默认照片类型 |
| productTypeId | int | 否 | 批量默认照片类型 ID |
| orders | array | 是 | 订单明细，至少 1 条 |

`orders` 明细：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| merchantName | string | 否 | 行级商户名称，优先于批量默认值 |
| photoType | string | 否 | 行级照片类型，优先于批量默认值 |
| orderNo | string | 是 | 订单号 |
| customerInfo | string | 是 | 客户信息文本 |
| photoCount | int/string | 是 | 照片张数 |
| acceptUnitPrice | decimal/string | 是 | 接单价 |
| dispatchUnitPrice | decimal/string | 是 | 派单价 |
| orderedAt | string | 是 | 下单时间 |
| remark | string | 否 | 备注 |

成功 message：`批量新增订单成功`。校验失败返回 `code=400`、`message=批量订单校验失败`，`data.errors` 中包含 `index`、`field`、`message`，Excel 导入场景还会包含 `excelRowNumber`。

### 13.6 Excel 导入预览

```http
POST /api/admin/orders/import/preview
```

权限：调度、超级管理员。

请求方式：`multipart/form-data`

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| file | file | 是 | `.xlsx` 文件 |

说明：该接口只解析和校验，不写入数据库。返回 `rows` 供前端预览，返回 `errors` 供前端按 `index` 和 `excelRowNumber` 标红。

成功 message：`导入文件解析成功`。

### 13.7 页面编辑订单

```http
PUT /api/admin/orders
```

权限：调度、超级管理员。

请求 body：同页面单条新建订单，并额外传 `id`。可选 `status` 只允许手动设置为 `问题件` / `PROBLEM` 或 `其他` / `OTHER`；其余状态必须通过派单、提交完工、审核、退回流程变化。

成功 message：`编辑订单成功`。

### 13.8 页面删除订单

```http
DELETE /api/admin/orders/{id}
```

权限：调度、超级管理员。

返回数据：`true`。成功 message：`删除订单成功`。

### 13.9 页面派单

```http
POST /api/admin/orders/dispatch
```

权限：调度、超级管理员。

请求 body：

```json
{
  "id": 1001,
  "designerId": 8
}
```

说明：该接口只用于未派单订单首次派单。成功后状态变为未完工。成功 message：`派单成功`。

### 13.10 页面审核通过和退回

审核通过：

```http
POST /api/admin/orders/approve
```

退回：

```http
POST /api/admin/orders/reject
```

权限：调度、超级管理员。

请求 body：

```json
{
  "id": 1001
}
```

说明：审核通过后状态变为已完工；退回后状态变为未完工。成功 message 分别为 `审核通过成功`、`退回成功`。

### 13.11 页面订单分组弹窗

商家分组：

```http
GET /api/admin/orders/shop-groups
```

设计师分组：

```http
GET /api/admin/orders/designer-groups
```

权限：调度、超级管理员。

返回数据：按 `groupId`、`groupName` 分组的订单数组。成功 message：`查询订单分组成功`。

### 13.12 页面勾选导出

```http
POST /api/admin/orders/export
```

权限：调度、超级管理员。

请求 body：

```json
{
  "tableType": "DETAIL",
  "ids": [1001, 1002]
}
```

`tableType` 可选 `DETAIL` 或 `SUMMARY`。响应为 `.xlsx` 文件流，不返回 JSON。

### 13.13 设计师页面订单列表

```http
POST /api/designer/orders/list
```

权限：设计师。

请求 body：同 `POST /api/admin/orders/list`。后端只返回当前设计师自己的订单，价格字段不返回给设计师页面。成功 message：`查询设计师订单成功`。

### 13.14 设计师页面提交完工

```http
POST /api/designer/orders/complete
```

权限：设计师。

请求 body：

```json
{
  "id": 1001
}
```

说明：仅允许设计师提交自己的未完工订单。成功后状态变为待审核。成功 message：`提交完工成功`。

### 13.15 设计师商家分组弹窗

```http
GET /api/designer/orders/shop-groups
```

权限：设计师。

返回设计师本人可见订单的商家分组。成功 message：`查询商家明细成功`。

### 13.16 真实前端商户列表

```http
POST /api/merchant-master/merchants/list
```

权限：调度、超级管理员。

请求 body：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| pageNo | int | 否 | 页码 |
| pageSize | int | 否 | 每页条数 |
| merchantName | string | 否 | 商户名称关键词 |

返回字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | int | 商户 ID |
| merchantName | string | 商户名称 |
| photoTypes | array | 照片类型列表 |
| createdAt | string | 创建时间 |

成功 message：`查询商户成功`。

### 13.17 真实前端商户详情

```http
GET /api/merchant-master/merchants/{id}
```

权限：调度、超级管理员。

返回字段同商户列表单条记录。成功 message：`查询商户详情成功`。

### 13.18 真实前端新增商户

```http
POST /api/merchant-master/merchants
```

权限：调度、超级管理员。

请求 body：

```json
{
  "merchantName": "云帆摄影",
  "photoTypes": [
    {
      "photoType": "精修",
      "acceptPrice": "12.00",
      "dispatchPrice": "8.00"
    }
  ]
}
```

说明：商户管理不再维护客户信息。成功 message：`新增商户成功`。

### 13.19 获取商户编辑数据

```http
POST /api/merchant-master/merchants/edit-data
```

权限：调度、超级管理员。

请求 body：

```json
{
  "id": 1
}
```

返回 `merchantName` 和 `photoTypes`。成功 message：`查询商户编辑数据成功`。

### 13.20 保存商户编辑

```http
PUT /api/merchant-master/merchants
```

权限：调度、超级管理员。

请求 body：同新增商户，并额外传 `id`。保存时以后端收到的 `photoTypes` 数组为准覆盖该商户照片类型。成功 message：`保存商户成功`。

### 13.21 删除商户

```http
POST /api/merchant-master/merchants/delete
```

权限：调度、超级管理员。

请求 body：

```json
{
  "id": 1
}
```

说明：删除商户会同时删除该商户关联订单、订单动态字段、订单状态日志、照片类型字段和照片类型。成功 message：`删除商户成功`。

## 14. 前端联调重点

- 建单接口不传 `designerId`。
- 派单接口才传 `designerId`。
- 登录接口返回 `accessToken` 和 `refreshToken`，前端用 `refreshToken` 调用 `/api/auth/refresh` 保持登录状态。
- 订单号由调度或超级管理员手动录入。
- 真实前端订单列表优先调用 `POST /api/admin/orders/list` 和 `POST /api/designer/orders/list`，筛选条件放在 body 中。
- 新建订单优先调用 `POST /api/admin/orders/batch`，单条新增也是 `orders` 数组一条。
- 设计师只能看到自己的订单。
- 问题件和其他只能通过订单编辑手动设置，审核接口只负责通过和退回。
- 动态字段需要按照片类型加载，建单保存时传 `fieldId` 和 `fieldValue`。
- 汇总表和导出必须复用同一套组合筛选参数。
- 导出接口返回文件流，不是 JSON。
- 设计师角色下价格字段返回 `null`，包括订单里的 `acceptUnitPrice`、`acceptTotalAmount`、`dispatchUnitPrice`、`dispatchTotalAmount`，以及统计弹窗里的 `unitPrice`、`designUnitPrice`、`designTotalAmount`。

