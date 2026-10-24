# 02 GitHub Actions 云端渲染：启用步骤

> 目标：渲染在 GitHub 的机器上跑，本机只负责 push 代码，CPU 零负担。
> 现状：**除了需要你在 GitHub 点几下授权，其余我这边全部做完了。**

## 一、我已经完成的（你不用管）

| 项目 | 状态 |
|---|---|
| gh CLI 安装 | ✅ v2.103.2（直连 502，改走 `gh-proxy.com` 镜像下载 15.2MB，2 秒完成）<br>位置：`C:\Users\My PC\.workbuddy\binaries\gh\bin\gh.exe`（未加 PATH） |
| 专用 SSH 密钥 | ✅ `~/.ssh/id_ed25519_huang_zishou`（仅用于本仓库，无密码短语以便自动推送） |
| 云端工作流 | ✅ `.github/workflows/render.yml`，YAML 已校验；push 自动触发 + 手动触发两种方式 |
| 中文字体 | ✅ 工作流内自动 `apt install fonts-noto-cjk`，避免云端中文变方框 |
| 本地 git 仓库 | ✅ 已 `git init`（main 分支）并完成首次提交，12 个文件受版本控制 |
| 本地降负载渲染 | ✅ `scripts/render-low.mjs`（空闲优先级、单并发、半分辨率自检） |

## 二、你需要做的（约 3 分钟，两步）

### 第 1 步：把公钥加到 GitHub

1. 浏览器打开 → **https://github.com/settings/ssh/new**
2. 三个格子这样填：
   - **Title**：`huang-zishou-actions`
   - **Key type**：`Authentication Key`
   - **Key**：把下面整行粘进去（含开头 `ssh-ed25519`，不要断行）

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJOqMd3YwlG33L5Fc0FaUGN7SgL+rtYS3SrG2ncc/nTU huang-zishou-actions
```

3. 点 **Add SSH key**。

> 这把密钥只能写你授权的仓库，不能读你的其他私有内容。用完后可在同一页面删除。

### 第 2 步：建一个空仓库

1. 打开 → **https://github.com/new**
2. 填写：
   - **Repository name**：`huang-zishou`
   - **Visibility**：`Private`（私有仓库每月 2000 分钟免费额度，一次成片约 5–10 分钟，够用几十次）
   - **不要**勾选 `Add a README file`、`Add .gitignore`、`Choose a license`
     （勾了会产生初始提交，push 时会冲突，还得额外处理）
3. 点 **Create repository**，页面会显示 `git@github.com:你的用户名/huang-zishou.git`

### 第 3 步：把仓库地址发我

把 `你的用户名/huang-zishou` 或那一整行 `git@github.com:...` 发给我即可。我这边会：

1. 配好 remote（走 SSH，因为本机 HTTPS 通道被代理拦截）
2. `git push` → 推送即自动触发云端渲染
3. 把运行状态和产物信息回报给你

## 三、之后的日常用法

| 想做的事 | 怎么做 |
|---|---|
| 改完素材重新出片 | 我改代码 → `git push` → 云端自动渲染，本机不跑渲染 |
| 只想预览某一段 | 在仓库 **Actions** 页 → `Render on Cloud` → **Run workflow**，填 `frames=0-89`、`scale=0.5` |
| 下载成片 | Actions 运行完成后，页面底部 **Artifacts** → `render-xxx` → 下载 zip |
| 临时不用云 | 本地跑 `node scripts/render-low.mjs <合成名> out/x.mp4`（空闲优先级） |

## 四、可能的坑与应对

| 现象 | 原因 | 应对 |
|---|---|---|
| `git push` 报 `Permission denied (publickey)` | 公钥没加对，或加成了 Deploy key 但仓库不匹配 | 重新在 https://github.com/settings/ssh/new 添加，确认 Key type 是 Authentication Key |
| Actions 里中文显示成方框 | 字体没装上 | 工作流已装 `fonts-noto-cjk`；若仍异常，我会改成内置字体文件 |
| 运行失败提示 `Composition not found` | 默认合成名不对 | 目前 push 默认渲染 `SmokeTest`（链路验证用）；正式合成 `HuangZishou` 建好后我会改默认值 |
| 私有仓库分钟数用完 | 超出免费额度 | 改公开仓库（不限时），或只渲片段 |
| 无法下载 artifact | 网络限制 | 在浏览器 Actions 页面手动下载 zip |

## 五、成本说明

- 公开仓库：**0 元**，不限时长。
- 私有仓库：每月 2000 分钟免费；本项目 90 秒成片 1080p 在 4 核 runner 上约 5–10 分钟/次。
- 不涉及任何付费服务开通，不需要信用卡。
