# Web4Registration - 激活码生成工具

纯前端激活码生成工具，通过 DES 加解密算法将用户码转换为激活码。无需后端服务器，一个 HTML 文件即可运行。

## 功能

- 输入通过 `RegistrationManager.GetUserCode()` 获取的用户码，一键生成对应激活码
- 纯前端实现，所有运算在浏览器本地完成
- 零依赖后端，可部署到任意静态文件托管服务

## 原理

激活码生成逻辑与原 `RegistrationManager.dll` 中的 `ValidityManager.GenerateVipCode()` 完全一致：

```
用户码 → ClientDesDecrypt（ClientKey 解密）→ 硬件信息字符串 → ServerDesEncrypt（ServerKey 加密）→ 激活码
```

算法：DES-CBC + PKCS7 填充 + Base64 编码

## 项目结构

```
Web4Registration/
├── index.html      # 唯一文件，包含全部逻辑
├── .gitignore
└── README.md
```

## 使用方式

### 本地使用

直接用浏览器打开 `index.html` 文件即可，无需任何服务器。

### 部署到静态服务器

将 `index.html` 放到任意静态文件服务器（Nginx、Apache、GitHub Pages、Gitee Pages 等）即可。

**Nginx 示例：**

```nginx
server {
    listen 80;
    server_name _;
    root /var/www/Web4Registration;
    index index.html;
}
```

## 安全说明

- 加解密密钥直接写在前端代码中，与原版 DLL 中的硬编码密钥一致
- 所有运算在浏览器本地完成，用户码和激活码不会发送到任何服务器
- 如需限制访问，可通过服务器端配置（IP 白名单、Basic Auth 等）保护页面

## 技术依赖

- [CryptoJS](https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js)（通过 CDN 加载，用于 DES 加解密）
