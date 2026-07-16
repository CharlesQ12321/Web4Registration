# Web4Registration - 激活码生成工具

基于 ASP.NET Core 8.0 的激活码生成 Web 服务，通过引用 `RegistrationManager.dll` 实现用户码到激活码的转换。

## 功能

- 提供网页界面，用户输入本地获取的"用户码"即可生成对应"激活码"
- 后端直接引用 `RegistrationManager.dll`，调用 `ValidityManager.GenerateVipCode()` 完成加解密运算
- 前端纯 HTML/CSS/JavaScript，无需额外框架

## 项目结构

```
Web4Registration/
├── RegistrationManager.dll          # 原 DLL（直接引用）
── .gitignore
├── README.md
└── Web4Registration/                # ASP.NET Core Web 项目
    ├── Web4Registration.csproj
    ├── Program.cs
    ├── Controllers/
    │   └── ActivationController.cs  # API 接口
    └── wwwroot/
        └── index.html               # 前端页面
```

## 技术栈

| 层级 | 技术 |
|---|---|
| 后端框架 | ASP.NET Core 8.0 |
| 授权逻辑 | RegistrationManager.dll（.NET Framework 4.x） |
| 前端 | 纯 HTML + CSS + JavaScript |
| 部署（Linux） | Nginx 反向代理 + systemd 服务 |

## 快速开始

### 本地运行

```bash
cd Web4Registration
dotnet run
```

浏览器访问 `http://localhost:5000`，在页面中粘贴用户码即可生成激活码。

### 发布

```bash
dotnet publish Web4Registration/Web4Registration.csproj -c Release -o ./publish
```

将 `publish` 文件夹内容部署到服务器即可。

## API 接口

### POST /api/activation/generate

根据用户码生成激活码。

**请求体**：

```json
{
  "userCode": "用户粘贴的用户码"
}
```

**成功响应**：

```json
{
  "success": true,
  "activationCode": "生成的激活码"
}
```

**失败响应**：

```json
{
  "success": false,
  "message": "错误描述"
}
```

## 部署到阿里云 Linux

### 环境要求

- Ubuntu 22.04 LTS 或 CentOS 7/8
- .NET 8 SDK
- Nginx

### 部署步骤

1. **安装 .NET 8 SDK（Ubuntu）**

```bash
wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo apt-get update && sudo apt-get install -y dotnet-sdk-8.0
```

2. **安装 Nginx**

```bash
sudo apt-get install -y nginx
sudo systemctl start nginx && sudo systemctl enable nginx
```

3. **上传发布文件**

```bash
scp -r ./publish/* root@<服务器IP>:/var/www/Web4Registration/
```

4. **配置 Nginx 反向代理**

```nginx
server {
    listen 80;
    server_name _;
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

5. **配置 systemd 服务**

```ini
[Unit]
Description=Web4Registration
After=network.target

[Service]
WorkingDirectory=/var/www/Web4Registration
ExecStart=/usr/bin/dotnet /var/www/Web4Registration/Web4Registration.dll
Restart=always
User=www-data
Environment=ASPNETCORE_URLS=http://localhost:5000

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable Web4Registration
sudo systemctl start Web4Registration
```

## 安全提醒

当前版本未对 API 接口做访问限制，任何人知道地址即可生成激活码。生产环境建议添加：

- API 访问密码验证
- IP 白名单
- HTTPS（SSL 证书）
- 请求频率限制

## 注意事项

- `RegistrationManager.dll` 基于 .NET Framework 4.x，本地 Windows 可直接引用运行
- 部署到 Linux 服务器时，需将 DLL 中的 DES 加解密逻辑重新实现为 .NET 8 跨平台代码（密钥和算法与原 DLL 保持一致）
