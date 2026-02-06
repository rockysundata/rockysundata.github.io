# GitHub Pages 部署指南

## 方法一：自动部署（推荐）

### 1. 创建 GitHub 仓库

```bash
# 在 GitHub 上创建一个新仓库，例如：spring-festival-lottery
# 然后将本地代码推送到仓库
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/spring-festival-lottery.git
git push -u origin main
```

### 2. 启用 GitHub Pages

1. 进入仓库的 **Settings** 页面
2. 点击左侧 **Pages** 选项
3. 在 **Build and deployment** 部分：
   - **Source**: 选择 "GitHub Actions"
4. 保存设置

### 3. 自动部署

每次推送到 `main` 分支时，GitHub Actions 会自动构建并部署。

部署完成后，访问地址：
```
https://你的用户名.github.io/spring-festival-lottery/
```

---

## 方法二：手动部署（dist 文件夹）

### 1. 创建 gh-pages 分支

```bash
# 创建并切换到 gh-pages 分支
git checkout --orphan gh-pages

# 删除所有文件（保留 dist 文件夹）
git rm -rf .

# 将 dist 内容复制到根目录
cp -r dist/* .

# 添加 .nojekyll 文件（禁用 Jekyll）
touch .nojekyll

# 提交
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

### 2. 启用 GitHub Pages

1. 进入仓库的 **Settings** 页面
2. 点击左侧 **Pages** 选项
3. 在 **Build and deployment** 部分：
   - **Source**: 选择 "Deploy from a branch"
   - **Branch**: 选择 `gh-pages` 分支，`/(root)` 文件夹
4. 保存设置

---

## 常见问题

### 1. 页面空白或 404

检查 `vite.config.ts` 中的 `base` 配置：

```ts
// 如果使用 username.github.io/repo-name/ 格式
base: '/你的仓库名/',

// 如果使用自定义域名
base: './',
```

### 2. 图片不显示

确保 `public/images` 文件夹已复制到 `dist` 文件夹：

```bash
# 构建后执行
cp -r public/images dist/
```

### 3. 路由刷新 404

单页应用（SPA）在 GitHub Pages 上刷新页面可能会 404，这是正常现象。
建议：
- 使用 hash 路由（本项目已使用 `/#/` 格式）
- 或通过 `404.html` 重定向

### 4. 样式丢失

检查浏览器控制台是否有 CORS 错误。确保资源路径正确。

---

## 本地预览

在部署前，可以本地预览构建结果：

```bash
# 构建
npm run build

# 本地预览
cd dist
npx serve
```

---

## 项目结构说明

```
app/
├── .github/workflows/    # GitHub Actions 自动部署配置
│   └── deploy.yml
├── dist/                 # 构建输出（部署到 GitHub Pages）
│   ├── assets/          # JS/CSS 文件
│   ├── images/          # 图片资源
│   ├── .nojekyll        # 禁用 Jekyll
│   └── index.html
├── public/              # 静态资源
│   └── images/
├── src/                 # 源代码
├── vite.config.ts       # Vite 配置
└── GITHUB_PAGES_DEPLOY.md  # 本文件
```
