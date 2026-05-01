# 数字输入三位小数精度回归报告

## 基本信息

| 项目 | 内容 |
| --- | --- |
| 测试日期 | 2026-05-01 |
| 前端地址 | `http://127.0.0.1:5183` |
| 管理员账号 | `admin / 123321` |
| 测试方式 | `agent-browser` 浏览器操作 + DOM 输入值核验 |

## 结论

通过。价格类数字输入框已使用 `:precision="PRICE_DECIMAL_PLACES"`，`PRICE_DECIMAL_PLACES = 3`。

照片张数输入框保留 `:precision="0"`，因为照片张数应为整数。

## 修正点

| 文件 | 内容 |
| --- | --- |
| `src/components/CreateOrder.vue` | 新建/编辑订单中的接单价、派单价输入框保留 `precision=3`，并在 `change` 时同步归一化 `v-model` |
| `src/views/MasterData.vue` | 商户照片类型中的默认接单价、默认派单价输入框保留 `precision=3`，并在 `change` 时同步归一化 `v-model` |

## 浏览器复核结果

| 用例 | 结果 | 证据 |
| --- | --- | --- |
| 订单编辑弹窗价格回填 | 通过 | `screenshots/order-edit-precision.png`，真实 DOM input 值为 `3.500`、`1.200` |
| 商户编辑弹窗价格回填 | 通过 | `screenshots/merchant-edit-precision.png`，真实 DOM input 值为 `3.500`、`1.200`、`12.880`、`12.100` |
| 商户默认派单价输入 `1.2345` | 通过 | `screenshots/merchant-price-input-limited.png`，输入阶段结果为 `1.234` |

## 说明

上一轮报告中记录的 `1.2000000476837158` 来自 `agent-browser snapshot` 对 Element Plus `spinbutton` 的可访问性树值展示，不是页面输入框真实显示值。本轮改用 DOM input value 和截图核验，确认视觉值与实际 input 值均被限制在三位小数。

## 验证

| 项目 | 结果 | 证据 |
| --- | --- | --- |
| 页面错误 | 通过 | `admin-errors.txt` 为空 |
| 构建 | 通过 | `build.log` 包含 `✓ built` |

构建仍有 Vite chunk 体积提示，不影响本轮精度修复。
