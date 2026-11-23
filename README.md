# 商城后台管理系统 · store-web-backend

商城后台管理系统的服务端 API，基于 NestJS 12 + TypeORM + MySQL + Redis 构建。提供用户注册登录、JWT 鉴权、RBAC 权限管理、商品管理、订单与活动管理，以及用户信息缓存、邮箱验证码、商品热销排行榜等能力。

<p>
  <img src="https://img.shields.io/badge/NestJS-12-E0234E?logo=nestjs&logoColor=white" alt="NestJS 12" />
  <img src="https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white" alt="TypeScript 6" />
  <img src="https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white" alt="MySQL 8" />
  <img src="https://img.shields.io/badge/Redis-6%2B-DC382D?logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/Node.js-22-339933?logo=nodedotjs&logoColor=white" alt="Node.js 22" />
</p>

> 仓库中的 [`http/`](./http) 目录提供了 VS Code REST Client / JetBrains HTTP Client 的请求示例，可直接用来调试接口。

## 功能特性

- **认证**：账号密码登录、JWT 签发与校验、注册与找回密码的邮箱验证码。
- **RBAC**：用户 - 角色 - 权限（菜单 / 页面 / 组件 / 按钮）- 接口权限的完整数据模型。
- **商品**：创建、编辑、删除、分页筛选、上下架、热销榜。
- **订单**：开单、列表、详情、状态更新、删除；开单时自动累加 Redis 销量（模块已完成，待注册）。
- **活动**：活动创建、列表、编辑、删除（模块已完成，待注册）。
- **基础设施**：全局参数校验、CORS、Redis 缓存、NestJS Observe 可观测性、Docker Compose 部署。

## 技术栈

| 分类     | 技术                                |
| -------- | ----------------------------------- |
| 运行时   | Node.js 22+                         |
| 框架     | NestJS 12（Express）                |
| 语言     | TypeScript 6                        |
| 数据库   | MySQL 8 + TypeORM                   |
| 缓存     | Redis（node-redis）                 |
| 认证     | Passport + JWT + bcryptjs           |
| 参数校验 | class-validator / class-transformer |
| 邮件     | Nodemailer                          |
| 测试     | Vitest + Supertest                  |
| 代码质量 | oxlint + Prettier                   |
| 部署     | Docker / Docker Compose             |

## 快速开始

### 1. 环境要求

- Node.js >= 22
- pnpm
- MySQL 8
- Redis 6+

### 2. 安装依赖

```bash
pnpm install
```

### 3. 启动依赖服务

已安装 Docker 时，可以只启动 MySQL 和 Redis：

```bash
docker compose up -d mysql redis
```

也可以使用本地已安装的 MySQL / Redis，并在 `.env` 中修改连接信息。

### 4. 配置环境变量

在项目根目录创建 `.env`：

```dotenv
# 服务
APP_PORT=3333
API_PREFIX=/api

# JWT
JWT_SECRET=please-change-me
JWT_EXPIRE_TIME=7d

# MySQL
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=root
MYSQL_DATABASE=store_web_project

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# 邮箱（163 / QQ / 企业邮箱等 SMTP 服务）
EMAIL_HOST=smtp.163.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your-email@163.com
EMAIL_PASS=your-smtp-authorization-code

# NestJS Observe（可选）
OBSERVE_APP_KEY=
OBSERVE_APP_SECRET=
```

> `.env` 已被 `.gitignore` 忽略，请勿提交真实密钥。邮箱的 `EMAIL_PASS` 通常不是登录密码，而是 SMTP 服务商提供的授权码。

### 5. 启动应用

```bash
# 开发模式（watch）
pnpm run start:dev

# 普通启动
pnpm run start
```

启动后访问 <http://localhost:3333/api>，返回 `Hello World!` 即表示服务正常。

### 环境变量说明

| 变量                 | 必填 | 默认值  | 说明                                      |
| -------------------- | ---- | ------- | ----------------------------------------- |
| `APP_PORT`           | 否   | `3000`  | 服务监听端口                              |
| `API_PREFIX`         | 否   | 空      | 全局路由前缀，示例配置为 `/api`           |
| `JWT_SECRET`         | 是   | -       | JWT 签名密钥，生产环境务必替换            |
| `JWT_EXPIRE_TIME`    | 否   | -       | Token 有效期，如 `7d`、`12h`              |
| `MYSQL_HOST`         | 是   | -       | MySQL 主机                                |
| `MYSQL_PORT`         | 是   | -       | MySQL 端口                                |
| `MYSQL_USER`         | 是   | -       | MySQL 用户名                              |
| `MYSQL_PASSWORD`     | 是   | -       | MySQL 密码                                |
| `MYSQL_DATABASE`     | 是   | -       | 数据库名，示例为 `store_web_project`      |
| `REDIS_HOST`         | 是   | -       | Redis 主机                                |
| `REDIS_PORT`         | 是   | -       | Redis 端口                                |
| `EMAIL_HOST`         | 是   | -       | SMTP 服务器地址                           |
| `EMAIL_PORT`         | 是   | -       | SMTP 端口，SSL 通常为 `465`               |
| `EMAIL_SECURE`       | 否   | `false` | 是否使用 SSL，值为字符串 `true` / `false` |
| `EMAIL_USER`         | 是   | -       | 发件邮箱账号                              |
| `EMAIL_PASS`         | 是   | -       | 邮箱授权码                                |
| `OBSERVE_APP_KEY`    | 否   | -       | NestJS Observe 应用 Key                   |
| `OBSERVE_APP_SECRET` | 否   | -       | NestJS Observe 应用 Secret                |

`ConfigModule` 会根据 `NODE_ENV` 选择环境文件：

| `NODE_ENV`    | 加载文件          |
| ------------- | ----------------- |
| `docker`      | `.env.docker`     |
| `production`  | `.env.production` |
| 其他 / 未设置 | `.env`            |

> 当前 `TypeOrmModule` 中 `synchronize` 固定为 `true`，开发环境会自动创建 / 同步表结构。生产环境请改为 `false` 并使用数据迁移。`.env` 中的 `MYSQL_SYNCHRONIZE` 暂未被代码读取。

## 常用脚本

| 命令                    | 说明                                          |
| ----------------------- | --------------------------------------------- |
| `pnpm run build`        | 编译到 `dist/`                                |
| `pnpm run start`        | 启动应用（读取 `.env`）                       |
| `pnpm run start:dev`    | 开发模式，监听文件变化                        |
| `pnpm run start:debug`  | 调试模式，监听文件变化                        |
| `pnpm run start:prod`   | 运行 `dist/main`                              |
| `pnpm run start:docker` | 以 `NODE_ENV=docker` 运行，读取 `.env.docker` |
| `pnpm run lint`         | 使用 oxlint 做类型感知检查                    |
| `pnpm run format`       | 使用 Prettier 格式化 `src/` 和 `test/`        |
| `pnpm run test`         | 运行单元测试                                  |
| `pnpm run test:watch`   | 监听模式运行单元测试                          |
| `pnpm run test:cov`     | 生成测试覆盖率报告                            |
| `pnpm run test:e2e`     | 运行端到端测试                                |
| `pnpm run deploy`       | 通过 NestJS Mau 部署                          |

> e2e 测试会加载完整的 `AppModule`，运行前需保证 MySQL 和 Redis 可用。

## 接口说明

### 基础信息

- Base URL：`http://localhost:3333/api`（由 `APP_PORT` 与 `API_PREFIX` 决定）
- 请求体：`application/json`；文件上传为 `multipart/form-data`
- 时间格式：ISO 8601 字符串
- 分页参数：`page` 从 `1` 开始，`pageSize` 为每页条数

### 认证方式

除标注「公开」的接口外，均需在请求头携带登录后获得的 Token：

```http
Authorization: Bearer <access_token>
```

登录示例：

```bash
curl -X POST http://localhost:3333/api/sys/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"123456"}'
```

响应：

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

全局 `JwtAuthGuard` 会校验 Token，并将用户信息写入 `req.user`。使用 `@AllowNoToken()` 装饰器的接口无需登录即可访问。

### 响应约定

- 列表接口返回 `{ "list": [...], "total": 100 }`
- 操作类接口返回中文提示字符串，如 `"创建成功"`
- 失败时返回非 2xx 状态码和 Nest 默认异常结构：

```json
{
  "statusCode": 400,
  "message": "商品名称不能为空",
  "error": "Bad Request"
}
```

### 接口清单

以下路径均省略了全局前缀 `/api`。

#### 系统与认证 `/sys`

| 方法   | 路径                               | 说明                              | 鉴权 |
| ------ | ---------------------------------- | --------------------------------- | ---- |
| `POST` | `/sys/registry`                    | 注册用户（需邮箱验证码）          | 公开 |
| `POST` | `/sys/login`                       | 登录，返回 `access_token`         | 公开 |
| `POST` | `/sys/forgot`                      | 通过邮箱验证码重置密码            | 公开 |
| `GET`  | `/sys/sendEmailForForgot?email=`   | 发送找回密码验证码                | 公开 |
| `GET`  | `/sys/sendEmailForRegistry?email=` | 发送注册验证码                    | 公开 |
| `POST` | `/sys/upload`                      | 上传文件，表单字段 `file`、`type` | 需要 |

#### 用户 `/user`

| 方法    | 路径                    | 说明                                     | 鉴权 |
| ------- | ----------------------- | ---------------------------------------- | ---- |
| `GET`   | `/user/list`            | 用户列表，支持 `username` 模糊搜索       | 需要 |
| `GET`   | `/user/currentUser`     | 当前用户信息、角色与菜单权限             | 需要 |
| `GET`   | `/user/info/:id`        | 用户详情                                 | 需要 |
| `PATCH` | `/user/edit`            | 编辑用户信息 / 分配角色                  | 需要 |
| `GET`   | `/user/delete/:id`      | 删除用户                                 | 需要 |
| `PATCH` | `/user/update/freezed`  | 冻结 / 解冻用户，body 传 `id`、`freezed` | 需要 |
| `GET`   | `/user/sendMail?email=` | 发送修改密码验证码                       | 需要 |

#### 角色 `/role`

| 方法    | 路径               | 说明                       | 鉴权 |
| ------- | ------------------ | -------------------------- | ---- |
| `POST`  | `/role/create`     | 创建角色并绑定权限         | 需要 |
| `GET`   | `/role/list`       | 角色列表，支持 `name` 搜索 | 需要 |
| `PATCH` | `/role/edit`       | 编辑角色与权限             | 需要 |
| `GET`   | `/role/delete/:id` | 删除角色（系统角色不可删） | 需要 |

#### 权限 `/permission`

| 方法   | 路径               | 说明                 | 鉴权 |
| ------ | ------------------ | -------------------- | ---- |
| `POST` | `/permission`      | 创建权限（占位实现） | 需要 |
| `GET`  | `/permission/list` | 当前用户的权限菜单树 | 需要 |

#### 商品 `/product`

| 方法    | 路径                    | 说明                                                  | 鉴权 |
| ------- | ----------------------- | ----------------------------------------------------- | ---- |
| `POST`  | `/product/create`       | 创建商品                                              | 需要 |
| `GET`   | `/product/list`         | 商品列表，支持 `name`、`status`、分页                 | 需要 |
| `PATCH` | `/product/edit`         | 编辑商品                                              | 需要 |
| `GET`   | `/product/delete/:id`   | 删除商品                                              | 需要 |
| `PATCH` | `/product/updateStatus` | 上架 / 下架，body 传 `id`、`status`（1 上架、2 下架） | 需要 |
| `GET`   | `/product/hot-list`     | 热销榜，`topN` 指定数量                               | 需要 |

#### 订单 `/order`（未启用）

| 方法    | 路径                 | 说明               |
| ------- | -------------------- | ------------------ |
| `POST`  | `/order/create`      | 开单               |
| `GET`   | `/order/list`        | 订单列表           |
| `GET`   | `/order/detail/:id`  | 订单详情           |
| `PATCH` | `/order/updateOrder` | 更新订单状态与备注 |
| `GET`   | `/order/delete/:id`  | 删除订单           |

#### 活动 `/activity`（未启用）

| 方法    | 路径                   | 说明     |
| ------- | ---------------------- | -------- |
| `POST`  | `/activity/create`     | 创建活动 |
| `GET`   | `/activity/list`       | 活动列表 |
| `GET`   | `/activity/:id`        | 活动详情 |
| `PATCH` | `/activity/edit`       | 编辑活动 |
| `GET`   | `/activity/delete/:id` | 删除活动 |

> `OrderModule` 与 `ActivityModule` 的代码已经完成，但尚未在 `AppModule` 中注册，因此上述接口当前不可访问。注册 `ActivityModule` 前还需为其 `TypeOrmModule.forFeature()` 补上 `ActivityEntity`，否则依赖注入会失败。详见[已知限制与后续计划](#已知限制与后续计划)。

### 请求示例

创建商品：

```bash
curl -X POST http://localhost:3333/api/product/create \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "机械键盘",
    "price": "399.00",
    "desc": "87 键热插拔机械键盘",
    "status": 1
  }'
```

查询商品列表：

```bash
curl "http://localhost:3333/api/product/list?name=键盘&page=1&pageSize=10" \
  -H "Authorization: Bearer $TOKEN"
```

查询热销榜前 5 名：

```bash
curl "http://localhost:3333/api/product/hot-list?topN=5" \
  -H "Authorization: Bearer $TOKEN"
```

## 认证与权限模型

- 用户类型：`0` 管理员、`1` 普通用户。
- 管理员默认拥有全部权限；普通用户通过「用户 → 角色 → 角色权限 → 权限 / 接口权限」获取访问能力。
- 登录成功后签发 JWT，Token 中携带用户 ID、账号、类型等基础信息，不包含密码和盐值。
- 公开接口使用 `@AllowNoToken()` 标记；接口权限使用 `@AllowNoPermission()` 标记。
- `JwtAuthGuard` 已在 `AppModule` 中注册为全局守卫；`RoleAuthGuard` 已实现「按请求方法 + URL 匹配接口权限」的逻辑，但尚未注册为全局守卫，因此 `@AllowNoPermission()` 目前不会生效。启用方式是在 `AppModule` 的 `providers` 中追加：

```ts
{ provide: APP_GUARD, useClass: RoleAuthGuard }
```

## 数据模型与缓存

### 数据表

| 表名                    | 说明                              |
| ----------------------- | --------------------------------- |
| `store_user`            | 用户                              |
| `store_role`            | 角色                              |
| `store_permission`      | 权限（菜单 / 页面 / 组件 / 按钮） |
| `store_permission_api`  | 接口权限（请求方法 + URL）        |
| `store_user_role`       | 用户 - 角色关联                   |
| `store_role_permission` | 角色 - 权限关联                   |
| `store_product`         | 商品                              |
| `store_order`           | 订单                              |
| `store_order_product`   | 订单 - 商品关联（预留）           |
| `store_activity`        | 活动                              |

> `store_activity` 与 `store_order_product` 对应的实体尚未在模块中注册，启用订单 / 活动模块后才会随 `synchronize` 创建。

### Redis Key

所有 Key 通过 `getRedisKey()` 和 `RedisKeyPrefix` 统一生成：

| Key                     | 类型   | 说明                               | TTL    |
| ----------------------- | ------ | ---------------------------------- | ------ |
| `user:info:{id}`        | Hash   | 用户信息缓存                       | 无     |
| `password_reset:{id}`   | String | 找回密码验证码                     | 5 分钟 |
| `registry_code:{email}` | String | 注册邮箱验证码                     | 5 分钟 |
| `hot_sales_ranking`     | ZSet   | 商品销量排行（按商品 ID 累计销量） | 无     |

## Docker 部署

项目提供了 `Dockerfile` 和 `docker-compose.yaml`，包含 `servers`、`mysql`、`redis` 三个服务。

1. 按实际环境修改 `.env.docker` 中的 JWT、MySQL、Redis、邮箱配置。
2. 构建并启动：

```bash
docker compose up -d --build
```

3. 查看日志：

```bash
docker compose logs -f servers
```

服务对外暴露 `3333` 端口，容器内通过 `NODE_ENV=docker` 加载 `.env.docker`，MySQL 与 Redis 的主机名分别为 `mysql`、`redis`。

停止服务：

```bash
docker compose down
```

如需同时删除数据卷（会清空数据库和 Redis 数据）：

```bash
docker compose down -v
```

## 可观测性

项目已接入 [NestJS Observe](https://observe.nestjs.com)，可查看分布式追踪、慢请求、错误、日志和指标。连接方式：

```bash
npx @nestjs/observe link
```

命令会把 `OBSERVE_APP_KEY` 和 `OBSERVE_APP_SECRET` 写入 `.env`，`start` / `start:dev` / `start:debug` 脚本都会自动加载。生产环境请在部署平台直接设置这两个环境变量。

也可以手动在 [observe.nestjs.com](https://observe.nestjs.com) 创建应用和 API Key，再配置上述变量。免费套餐每月包含 300,000 个事件；也可以先查看[在线 Demo](https://www.observe-demo.nestjs.com/dashboard)。

## 目录结构

```text
.
├── src/
│   ├── activity/              # 活动模块（未注册）
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── activity.controller.ts
│   │   ├── activity.module.ts
│   │   └── activity.service.ts
│   ├── common/
│   │   ├── auth/              # Passport 策略、JWT 守卫、权限守卫
│   │   ├── decorators/        # @AllowNoToken / @AllowNoPermission
│   │   ├── enum/              # 用户类型、权限类型、Redis Key 前缀
│   │   ├── mail/              # 邮件验证码
│   │   ├── redis/             # Redis 客户端与常用操作封装
│   │   ├── types/             # 请求类型扩展
│   │   └── utils/             # 分页基类、Redis Key、列表转树
│   ├── order/                 # 订单模块（未注册）
│   ├── permission/            # 权限模块
│   ├── product/               # 商品模块与热销榜
│   ├── role/                  # 角色模块
│   ├── sys/                   # 登录、注册、找回密码、上传
│   ├── user/                  # 用户模块
│   ├── app.module.ts          # 根模块
│   └── main.ts                # 应用入口
├── http/                      # REST Client 请求示例
├── test/                      # e2e 测试
├── Dockerfile
├── docker-compose.yaml
├── vitest.config.ts
└── vitest.config.e2e.ts
```

## 开发约定

- 路径别名 `@/*` 指向 `src/*`，新增模块时保持按领域拆分 `controller / service / dto / entities`。
- 请求参数使用 DTO + `class-validator` 声明校验规则，全局 `ValidationPipe` 会返回 400。
- 业务错误统一抛出 `HttpException`，提示信息使用中文。
- 新增 Redis 缓存时，先在 `RedisKeyPrefix` 中登记前缀，再通过 `getRedisKey()` 生成 Key。
- 提交前建议执行 `pnpm run lint && pnpm run test`。
- 格式化配置：单引号、尾随逗号（`.prettierrc`）。

## 已知限制与后续计划

- [ ] 在 `AppModule` 中注册 `OrderModule`，启用订单接口与销量累计。
- [ ] 为 `ActivityModule` 补充 `TypeOrmModule.forFeature([ActivityEntity])` 并注册模块。
- [ ] 注册 `RoleAuthGuard`，让 `@AllowNoPermission()` 与接口级权限校验生效。
- [ ] 关闭生产环境的 `synchronize`，接入 TypeORM 数据迁移，并读取 `MYSQL_SYNCHRONIZE` 配置。
- [ ] 完善文件上传：当前返回本地 URL，后续可接入对象存储并校验文件类型 / 大小。
- [ ] 接入 Swagger / OpenAPI，自动生成接口文档。

## License

本项目为私有项目，`package.json` 中标记为 `UNLICENSED`，未经授权不得使用或分发。
