# 个人博客网站

这是一个静态博客网站模板，专为GitHub Pages设计。

## 项目结构

```
myblog/
├── index.html              # 主页面
├── css/
│   └── style.css           # 样式文件
├── js/
│   └── main.js             # JavaScript交互逻辑
├── images/                 # 图片文件夹
│   ├── bg.jpg             # 背景图片（请替换）
│   ├── avatar.jpg         # 头像图片（请替换）
│   ├── article-1.jpg      # 文章配图1
│   └── article-2.jpg      # 文章配图2
└── articles/              # 文章文件夹
    ├── articles.json      # 文章列表（索引）
    ├── article-1.html     # 文章1内容
    ├── article-2.html     # 文章2内容
    └── ...
```

## 如何更换图片

### 1. 背景图片
- 文件位置：`images/bg.jpg`
- 建议尺寸：1920x1080 或更大

### 2. 头像图片
- 文件位置：`images/avatar.jpg`
- 建议尺寸：400x400 像素，正方形

### 3. 文章配图
- 文件位置：`images/article-1.jpg`、`article-2.jpg` 等
- 建议尺寸：800x400 或 16:9 比例

## 如何发布文章

### 步骤 1：创建文章文件

在 `articles/` 文件夹下创建一个新的 HTML 文件，例如 `my-new-article.html`：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>文章标题</title>
</head>
<body>
    <article>
        <p>这里是文章的第一段内容...</p>
        <br>
        <p>这里是文章的第二段内容...</p>
        <br>
        <h2>二级标题</h2>
        <p>更多内容...</p>
    </article>
</body>
</html>
```

**注意**：
- `<title>` 标签中的内容会作为文章标题显示
- 文章内容放在 `<article>` 标签内
- 使用 `<br>` 换行，使用 `<h2>`、`<h3>` 标题
- 支持任意 HTML 标签

### 步骤 2：添加文章到索引

打开 `articles/articles.json`，添加新的文章记录：

```json
{
    "id": 5,
    "title": "新文章标题",
    "excerpt": "文章摘要...",
    "file": "my-new-article.html",
    "date": "2024-03-01",
    "tag": "分类标签",
    "image": "../images/article-5.jpg"
}
```

### 文章索引格式说明

| 字段 | 说明 |
|-----|------|
| id | 唯一标识符 |
| title | 文章标题（用于显示） |
| excerpt | 列表页显示的摘要（约50字） |
| file | 对应的HTML文件名 |
| date | 发布日期 |
| tag | 文章分类标签 |
| image | 文章封面图路径 |

## 自定义颜色

在 `css/style.css` 文件的开头可以修改主题色：

```css
:root {
    --primary-color: #3498db;      /* 主色调 - 蓝色 */
    --secondary-color: #2c3e50;  /* 次要色 - 深蓝 */
    --text-color: #333;            /* 文字颜色 */
    --text-light: #666;            /* 次要文字颜色 */
}
```

## 部署到GitHub Pages

1. 创建GitHub仓库（如：`yourusername.github.io`）
2. 将所有文件推送到仓库
3. 进入仓库 Settings → Pages
4. Source 选择 "main branch"
5. 保存后访问 `https://yourusername.github.io`

## 注意事项

- 图片文件请使用常见的格式（jpg、png、gif、webp）
- 如果图片不存在，会显示默认的渐变色
- 确保 `images` 文件夹中包含必要的图片文件
- 本地测试需要使用本地服务器（如 VS Code 的 Live Server），直接双击打开 HTML 可能无法加载 JSON 文件
