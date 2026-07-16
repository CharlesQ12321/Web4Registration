# 激活码生成网页 — 阿里云部署方案（Linux 版）

## 1. 项目概述

提供一个网页供用户输入"用户码"并获取对应"激活码"，部署在阿里云 Linux ECS 上。

**核心调用链**：
```
用户输入 UserCode → 前端 POST → 后端 API → ValidityManager.GenerateVipCode(UserCode) → 返回激活码
```

---

## 2. DLL 技术分析

| 属性 | 值 |
|---|---|
| 程序集名称 | RegistrationManager |
| 版本 | 1.0.0.0 |
| 目标框架 | .NET Framework 4.x（CLR v4.0.30319） |
| 强命名 | 否 |
| 依赖项 | `mscorlib`、`System.Management` |

> **关键发现**：`GenerateVipCode` 方法只做纯字符串加解密（DES），不调用 WMI。但原 DLL 是 .NET Framework 4.x 编译，无法在 Linux 上运行。因此需要将加密逻辑重新实现为 .NET 8 跨平台类库。

---

## 3. 技术选型

### 推荐方案：ASP.NET Core (.NET 8) + Nginx（Linux）

| 层级 | 技术 | 说明 |
|---|---|---|
| 加密逻辑 | .NET 8 类库（重新实现） | 将原 DLL 的 DES 加解密逻辑移植为跨平台 .NET 8 代码 |
| 后端框架 | ASP.NET Core Web API (.NET 8) | 跨平台，Linux 原生支持 |
| Web 服务器 | Nginx | Linux 主流 Web 服务器，作为反向代理 |
| 前端 | 纯 HTML + CSS + JavaScript | 无需额外框架，单页面即可 |

> **为什么不用原 DLL**：原 DLL 是 .NET Framework 4.x 编译，依赖 `System.Management`（WMI），无法在 Linux 上加载。但 `GenerateVipCode` 只做 DES 加解密，逻辑简单，可以直接用 .NET 8 重新实现。

---

## 4. 项目结构

```
Web4Registration/
├── RegistrationManager.dll          # 原 DLL（仅本地参考，不部署）
├── RegistrationManagerCore/         # 重新实现的跨平台类库
│   ├── RegistrationManagerCore.csproj
│   └── ValidityManager.cs
── Web4Registration/                # ASP.NET Core Web 项目
│   ├── Web4Registration.csproj
│   ├── Program.cs
│   ├── Controllers/
│   │   └── ActivationController.cs
│   └── wwwroot/
│       └── index.html
├── Web4Registration.sln             # 解决方案文件
└── DEPLOY_PLAN.md                   # 本方案文档
```

---

## 5. 开发步骤

### 5.1 创建解决方案和项目

```bash
# 在项目根目录执行
dotnet new sln -n Web4Registration
dotnet new classlib -n RegistrationManagerCore -f net8.0
dotnet new webapi -n Web4Registration --no-https
dotnet sln add RegistrationManagerCore/RegistrationManagerCore.csproj
dotnet sln add Web4Registration/Web4Registration.csproj
```

### 5.2 重新实现加密逻辑（跨平台类库）

`RegistrationManagerCore/RegistrationManagerCore.csproj`：

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
</Project>
```

`RegistrationManagerCore/ValidityManager.cs`：

```csharp
using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace RegistrationManagerCore;

public static class ValidityManager
{
    // 客户端加密密钥和向量（与原 DLL 一致）
    private static readonly byte[] ClientKey = { 1, 3, 5, 7, 9, 11, 13, 15 };
    private static readonly byte[] ClientIV = { 17, 19, 21, 23, 25, 27, 29, 31 };

    // 服务端加密密钥和向量（与原 DLL 一致）
    private static readonly byte[] ServerKey = { 2, 4, 6, 8, 10, 12, 14, 16 };
    private static readonly byte[] ServerIV = { 18, 20, 22, 24, 26, 28, 30, 32 };

    /// <summary>
    /// 根据用户码生成激活码（服务端调用）
    /// 流程：用 Client 密钥解密用户码 → 得到硬件信息字符串 → 用 Server 密钥重新加密
    /// </summary>
    public static string GenerateVipCode(string userCode)
    {
        try
        {
            string decrypted = ClientDesDecrypt(userCode);
            if (string.IsNullOrEmpty(decrypted))
                return null!;
            return ServerDesEncrypt(decrypted);
        }
        catch
        {
            return null!;
        }
    }

    #region Client 端加解密

    private static string ClientDesEncrypt(string plainText)
    {
        using var des = DES.Create();
        des.Key = ClientKey;
        des.IV = ClientIV;
        using var ms = new MemoryStream();
        using (var cs = new CryptoStream(ms, des.CreateEncryptor(), CryptoStreamMode.Write))
        using (var sw = new StreamWriter(cs))
        {
            sw.Write(plainText);
        }
        return Convert.ToBase64String(ms.ToArray());
    }

    private static string ClientDesDecrypt(string encryptedText)
    {
        try
        {
            encryptedText = encryptedText.Replace("_%_", "/").Replace("-%-", "+");
            byte[] buffer = Convert.FromBase64String(encryptedText);
            using var des = DES.Create();
            des.Key = ClientKey;
            des.IV = ClientIV;
            using var ms = new MemoryStream(buffer);
            using var cs = new CryptoStream(ms, des.CreateDecryptor(), CryptoStreamMode.Read);
            using var sr = new StreamReader(cs);
            return sr.ReadToEnd();
        }
        catch
        {
            return null!;
        }
    }

    #endregion

    #region Server 端加解密

    private static string ServerDesEncrypt(string plainText)
    {
        using var des = DES.Create();
        des.Key = ServerKey;
        des.IV = ServerIV;
        using var ms = new MemoryStream();
        using (var cs = new CryptoStream(ms, des.CreateEncryptor(), CryptoStreamMode.Write))
        using (var sw = new StreamWriter(cs))
        {
            sw.Write(plainText);
        }
        return Convert.ToBase64String(ms.ToArray());
    }

    private static string ServerDesDecrypt(string encryptedText)
    {
        try
        {
            encryptedText = encryptedText.Replace("_%_", "/").Replace("-%-", "+");
            byte[] buffer = Convert.FromBase64String(encryptedText);
            using var des = DES.Create();
            des.Key = ServerKey;
            des.IV = ServerIV;
            using var ms = new MemoryStream(buffer);
            using var cs = new CryptoStream(ms, des.CreateDecryptor(), CryptoStreamMode.Read);
            using var sr = new StreamReader(cs);
            return sr.ReadToEnd();
        }
        catch
        {
            return null!;
        }
    }

    #endregion
}
```

### 5.3 Web 项目配置

`Web4Registration/Web4Registration.csproj`：

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <ProjectReference Include="..\RegistrationManagerCore\RegistrationManagerCore.csproj" />
  </ItemGroup>
</Project>
```

### 5.4 后端 API 控制器

`Web4Registration/Controllers/ActivationController.cs`：

```csharp
using Microsoft.AspNetCore.Mvc;
using RegistrationManagerCore;

namespace Web4Registration.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ActivationController : ControllerBase
{
    [HttpPost("generate")]
    public IActionResult GenerateActivationCode([FromBody] UserCodeRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.UserCode))
            {
                return BadRequest(new { success = false, message = "用户码不能为空" });
            }

            string activationCode = ValidityManager.GenerateVipCode(request.UserCode);

            if (string.IsNullOrEmpty(activationCode))
            {
                return BadRequest(new { success = false, message = "用户码无效，请检查后重新输入" });
            }

            return Ok(new { success = true, activationCode });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = $"服务器异常: {ex.Message}" });
        }
    }
}

public class UserCodeRequest
{
    public string UserCode { get; set; } = "";
}
```

### 5.5 前端页面

`Web4Registration/wwwroot/index.html`：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>激活码生成工具</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: "Microsoft YaHei", Arial, sans-serif; background: #f0f2f5; padding: 40px; }
        .container { max-width: 520px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); }
        h2 { margin-bottom: 8px; color: #333; }
        .subtitle { font-size: 13px; color: #888; margin-bottom: 20px; }
        textarea { width: 100%; height: 100px; padding: 12px; border: 1px solid #d9d9d9; border-radius: 4px; resize: vertical; font-size: 14px; }
        button { width: 100%; padding: 12px; background: #1677ff; color: #fff; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; margin-top: 12px; }
        button:hover { background: #4096ff; }
        button:disabled { background: #a0c4ff; cursor: not-allowed; }
        .result { margin-top: 20px; padding: 15px; border-radius: 4px; display: none; }
        .result.success { background: #f6ffed; border: 1px solid #b7eb8f; display: block; }
        .result.error { background: #fff2f0; border: 1px solid #ffccc7; display: block; }
        .result strong { display: block; margin-bottom: 6px; }
        .result p { word-break: break-all; font-family: Consolas, monospace; font-size: 13px; color: #333; }
        .loading { display: none; text-align: center; margin-top: 12px; color: #888; }
    </style>
</head>
<body>
    <div class="container">
        <h2>激活码生成工具</h2>
        <p class="subtitle">通过 RegistrationManager.GetUserCode() 获取用户码后粘贴到下方</p>
        <textarea id="userCodeInput" placeholder="请粘贴您的用户码..."></textarea>
        <button id="submitBtn" onclick="getActivationCode()">生成激活码</button>
        <div class="loading" id="loadingArea">正在生成，请稍候...</div>
        <div class="result" id="resultArea">
            <strong>激活码：</strong>
            <p id="activationCodeResult"></p>
        </div>
        <div class="result" id="errorArea">
            <strong style="color:#ff4d4f;">错误：</strong>
            <p id="errorMessage" style="color:#ff4d4f;"></p>
        </div>
    </div>

    <script>
        async function getActivationCode() {
            const userCode = document.getElementById('userCodeInput').value.trim();
            if (!userCode) { alert('请先输入用户码'); return; }

            const btn = document.getElementById('submitBtn');
            btn.disabled = true;
            document.getElementById('loadingArea').style.display = 'block';
            document.getElementById('resultArea').className = 'result';
            document.getElementById('errorArea').className = 'result';

            try {
                const response = await fetch('/api/activation/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userCode })
                });
                const data = await response.json();
                if (data.success) {
                    document.getElementById('activationCodeResult').textContent = data.activationCode;
                    document.getElementById('resultArea').className = 'result success';
                } else {
                    document.getElementById('errorMessage').textContent = data.message || '生成失败';
                    document.getElementById('errorArea').className = 'result error';
                }
            } catch (error) {
                document.getElementById('errorMessage').textContent = '网络请求失败：' + error.message;
                document.getElementById('errorArea').className = 'result error';
            } finally {
                btn.disabled = false;
                document.getElementById('loadingArea').style.display = 'none';
            }
        }
    </script>
</body>
</html>
```

### 5.6 入口配置

`Web4Registration/Program.cs`：

```csharp
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();
app.UseDefaultFiles();          // 自动提供 index.html 作为默认页
app.UseStaticFiles();           // 提供 wwwroot 下的静态文件
app.UseCors();
app.MapControllers();
app.Run();
```

---

## 6. 阿里云部署步骤（Linux）

### 6.1 阿里云 ECS 配置要求

| 配置项 | 建议值 |
|---|---|
| 操作系统 | Ubuntu 22.04 LTS 或 CentOS 7/8 |
| 实例规格 | 2 vCPU、2 GiB 内存（最低配置） |
| 系统盘 | 40 GiB 及以上 |
| 带宽 | 按量付费或 1-5 Mbps |
| 安全组 | 开放 80（HTTP）、443（HTTPS）、22（SSH）端口 |

### 6.2 服务器环境安装

**步骤 1：SSH 连接服务器**

```bash
ssh root@<服务器公网IP>
```

**步骤 2：安装 .NET 8 SDK（Ubuntu 示例）**

```bash
# 添加 Microsoft 包源
wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb

# 安装 .NET 8 SDK
sudo apt-get update
sudo apt-get install -y dotnet-sdk-8.0
```

**CentOS 示例：**

```bash
sudo rpm -Uvh https://packages.microsoft.com/config/centos/7/packages-microsoft-prod.rpm
sudo yum install -y dotnet-sdk-8.0
```

**步骤 3：安装 Nginx**

```bash
# Ubuntu
sudo apt-get install -y nginx

# CentOS
sudo yum install -y nginx
```

**步骤 4：启动 Nginx 并设为开机自启**

```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 6.3 发布与上传

**步骤 1：本地发布项目**

```powershell
# 在项目根目录执行
dotnet publish Web4Registration/Web4Registration.csproj -c Release -o ./publish
```

**步骤 2：上传到服务器**

使用 SCP 上传（在本地 PowerShell 中执行）：

```powershell
scp -r ./publish/* root@<服务器公网IP>:/var/www/Web4Registration/
```

或使用 FTP / 阿里云 OSS 中转。

### 6.4 Nginx 站点配置

创建 Nginx 配置文件：

```bash
sudo nano /etc/nginx/sites-available/Web4Registration
```

写入以下内容：

```nginx
server {
    listen 80;
    server_name _;  # 如有域名，替换为实际域名

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用站点：

```bash
sudo ln -s /etc/nginx/sites-available/Web4Registration /etc/nginx/sites-enabled/
sudo nginx -t                    # 测试配置
sudo systemctl reload nginx      # 重载 Nginx
```

### 6.5 配置 systemd 服务（后台运行）

创建服务文件：

```bash
sudo nano /etc/systemd/system/Web4Registration.service
```

写入以下内容：

```ini
[Unit]
Description=Web4Registration - 激活码生成服务
After=network.target

[Service]
WorkingDirectory=/var/www/Web4Registration
ExecStart=/usr/bin/dotnet /var/www/Web4Registration/Web4Registration.dll
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=Web4Registration
User=www-data
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=ASPNETCORE_URLS=http://localhost:5000

[Install]
WantedBy=multi-user.target
```

> **注意**：CentOS 上 `User` 应改为 `nginx` 而非 `www-data`。

启动服务：

```bash
sudo systemctl daemon-reload
sudo systemctl enable Web4Registration
sudo systemctl start Web4Registration
sudo systemctl status Web4Registration    # 检查状态
```

### 6.6 验证部署

浏览器访问 `http://<服务器公网IP>/`，应看到激活码生成页面。

---

## 7. 安全建议

> **重要提醒**：当前方案下，任何人只要知道网页地址就能无限生成有效激活码，这会完全绕过授权机制。

### 建议添加的安全措施

1. **API 访问密钥**：在前端要求输入管理密码，后端验证后才允许生成
2. **IP 白名单**：仅允许特定 IP 访问 API
3. **请求频率限制**：防止暴力调用
4. **HTTPS**：为域名配置 SSL 证书（阿里云免费证书或 Let's Encrypt）
5. **日志记录**：记录每次生成请求的 IP、时间、输入值

### 简单密码保护示例

在 `appsettings.json` 中添加：

```json
{
  "AdminPassword": "your_secret_password_here"
}
```

前端增加密码输入框，后端验证。这样只有知道密码的人才能使用该工具。

---

## 8. 注意事项

| 事项 | 说明 |
|---|---|
| 加密逻辑一致性 | 重新实现的 `ValidityManager` 密钥和算法与原 DLL 完全一致，生成的激活码互相兼容 |
| 原 DLL 用途 | 原 `RegistrationManager.dll` 仅在客户端（Windows + .NET Framework）用于获取用户码和验证激活码，不部署到服务器 |
| 端口 | ASP.NET Core 默认监听 5000，Nginx 监听 80 并反向代理到 5000 |
| 防火墙 | 确保阿里云安全组已开放 80 端口 |
| 域名（可选） | 如需域名访问，在阿里云 DNS 解析中添加 A 记录指向服务器 IP |
| 时区 | 服务器时区设置为 `Asia/Shanghai`：`sudo timedatectl set-timezone Asia/Shanghai` |

---

## 9. 快速操作清单

- [ ] 购买/准备阿里云 Linux ECS 实例（Ubuntu 22.04 或 CentOS）
- [ ] 配置安全组，开放 80、22 端口
- [ ] SSH 连接服务器
- [ ] 安装 .NET 8 SDK
- [ ] 安装 Nginx
- [ ] 本地创建解决方案，实现跨平台类库和 Web 项目
- [ ] `dotnet publish` 发布
- [ ] SCP 上传到服务器 `/var/www/Web4Registration/`
- [ ] 配置 Nginx 反向代理
- [ ] 配置 systemd 服务
- [ ] 浏览器验证访问