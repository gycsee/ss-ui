# ss-ui

用于管理公共 UI 组件的 `pnpm workspace` monorepo。

当前仓库采用“每个组件一个 package”的组织方式，适合沉淀现有产品中的公共组件，并以统一的构建、测试和发版流程维护。

## Package 清单

仓库中的实际 package 以 `packages/*/package.json` 为准。

## 目录结构

```text
.
├── .changeset/              # changesets 配置与变更记录
├── .github/workflows/       # CI 与发布流水线
├── packages/
│   └── <package-name>/      # 每个组件一个 package
├── package.json             # 根脚本与公共开发依赖
├── pnpm-workspace.yaml      # workspace 声明
└── tsconfig.base.json       # 共享 TypeScript 配置
```

## 环境要求

- Node.js `>= 20`
- pnpm `>= 10`

## 初始化

```bash
pnpm install
```

## 根命令

```bash
pnpm build
pnpm test
pnpm changeset
pnpm version-packages
pnpm release
```

说明：

- `pnpm build`：递归构建所有 package
- `pnpm test`：递归运行所有 package 测试
- `pnpm changeset`：生成一条 changeset 变更记录
- `pnpm version-packages`：根据 changeset 更新版本号与 changelog
- `pnpm release`：构建全部 package 并执行 `changeset publish`

## 常用开发命令

### 构建全部包

```bash
pnpm build
```

### 测试全部包

```bash
pnpm test
```

### 只构建某一个包

```bash
pnpm --filter <package-name> build
```

### 只测试某一个包

```bash
pnpm --filter <package-name> test
```

## Package 约定

- 每个组件独立放在 `packages/<package-name>` 下。
- 每个 package 自己维护 `package.json`、源码、测试和 README。
- 构建产物输出到 `dist/`，不提交到仓库。
- 对外依赖尽量走 `peerDependencies`，避免宿主项目重复安装多份运行时。

## 新增 Package

当前仓库没有保留脚手架，新增 package 时直接手工创建目录即可。

建议至少包含这些文件：

```text
packages/<name>/
├── package.json
├── README.md
├── src/
└── __tests__/
```

建议优先复制一个最接近的新包模板，再按实际框架做精简，而不是从空白开始拼。

## 版本与发布

仓库已经接入 `changesets`，版本管理和发布都基于 changeset 文件完成，不再手工改 package 版本号。

### 发布前准备

1. 确保依赖已安装：

```bash
pnpm install
```

2. 确保本地改动通过验证：

```bash
pnpm test
pnpm build
```

### 新增一条变更记录

当某个 package 需要发版时，先生成一条 changeset：

```bash
pnpm changeset
```

命令会交互式询问：

- 哪些 package 需要发版
- 版本级别是 `patch` / `minor` / `major`
- 本次变更说明

生成的变更记录会写入 `.changeset/*.md`。

### 本地生成版本号

如果你需要在本地先看到版本号和 changelog 变更，可以执行：

```bash
pnpm version-packages
```

这个命令会：

- 更新受影响 package 的 `version`
- 生成或更新对应 changelog
- 消耗掉 `.changeset/*.md` 中的待发布记录

通常在接入 `changesets/action` 后，这一步由 GitHub Action 负责，不要求每次都手动执行。

### CI 发布流程

仓库包含两条 GitHub Actions workflow：

- `CI`：在 `push` 和 `pull_request` 时执行安装、测试和构建
- `Release`：在 `main` 分支收到提交后，自动创建版本 PR，或者在已有 changeset 可发布时自动发布到 registry

`Release` workflow 基于 `changesets/action`。

工作方式如下：

1. 功能分支提交代码和 `.changeset/*.md`
2. 合并到 `main`
3. `Release` workflow 检测到待发布 changeset
4. Action 自动创建或更新一个版本 PR
5. 合并版本 PR 后，workflow 自动执行发布

### GitHub Secrets

要让自动发布真正可用，至少需要在仓库里配置：

- `NPM_TOKEN`：用于发布 npm 包

GitHub 自带的 `GITHUB_TOKEN` 会由 workflow 自动使用，用于创建版本 PR。

### Registry 说明

当前 workflow 默认按 npm 发布场景配置。

如果你们使用的是私有 registry，需要额外确认：

- CI 环境中的 `.npmrc` 是否正确
- `NPM_TOKEN` 对应的是目标 registry 的 token
- package scope 和 registry 映射是否正确

如果你们发布的是公开 scoped package，通常还需要把 `.changeset/config.json` 里的 `access` 从 `restricted` 调整为 `public`。

### 手动发布

如果你需要临时绕过 GitHub Action，在本地手动发布，可以执行：

```bash
pnpm release
```

这会先构建，再执行 `changeset publish`。

手动发布前至少确认：

- 已执行 `pnpm install`
- 已执行 `pnpm test`
- 已执行 `pnpm build`
- 本地 npm 登录态和 registry 配置正确

## 当前状态

这个仓库当前已经具备：

- workspace 组织能力
- 单包与全量构建
- 单包与全量测试
- changesets 版本管理
- GitHub Actions CI
- GitHub Actions 自动发布

如果后续要继续增强，可以考虑补充：

- 更严格的 typecheck
- lint 与格式化校验
- 发布后的自动通知
- 变更日志模板定制
