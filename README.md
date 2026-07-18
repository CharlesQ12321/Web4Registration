# Web4Registration - IronMan 插件安装激活页面

本项目包含两部分：前端静态页面和 RegistrationManager C# 类库。

前端页面用于展示 IronMan 插件的安装激活流程，并提供在线激活码生成功能。RegistrationManager 类库供 Grasshopper 或 Rhino 插件端调用，用于获取机器码、验证激活码以及检查有效期。

两部分的 DES 加密参数统一维护在 shared 目录下的 crypto-config.json 文件中，避免各自硬编码导致不一致。

## 项目结构

- index.html：前端页面入口。
- validity.js：前端激活码生成逻辑。
- crypto-config.js：前端加密参数文件，由工具自动生成，请勿手动修改。
- data.js：页面展示数据。
- shared/crypto-config.json：加密参数的唯一真源，包括客户端密钥、服务端密钥、有效期和提示文案。
- tools/generate_crypto.py：根据 crypto-config.json 自动生成 C# 和 JS 常量文件的工具脚本。
- src/RegistrationManager/：C# 类库项目，包含项目文件、核心逻辑和自动生成的加密参数文件。
- Web4Registration.sln：解决方案文件，包含 RegistrationManager 项目。

## 本地预览

建议通过本地 HTTP 服务器打开页面。直接在浏览器中双击打开 index.html 会使用 file 协议，容易出现缓存和安全限制问题。

可以在项目根目录运行 Python 内置的 HTTP 服务器，然后使用浏览器访问本地地址。

## 构建 RegistrationManager.dll

在项目根目录运行 dotnet build 命令，即可编译 RegistrationManager 项目并生成 DLL。编译过程中会自动调用 generate_crypto.py，根据 crypto-config.json 刷新 C# 和前端加密参数文件。

## 更新加密参数

所有加密参数都保存在 shared/crypto-config.json 中。需要更新密钥或有效期时，按以下步骤操作：

1. 修改 shared/crypto-config.json 中的参数。
2. 重新生成常量文件。有两种方式：
   - 只更新常量文件：运行 tools 目录下的 generate_crypto.py 脚本。
   - 同时编译 DLL：运行 dotnet build 命令。
3. 部署网页前，确认 crypto-config.js 已经更新为最新内容。
4. 打开网页后按 Ctrl + F5 强制刷新，或在开发者工具中禁用缓存后刷新，避免浏览器使用旧的加密参数文件。

## 更新密钥时的注意事项

修改客户端密钥 clientKey 和初始向量 clientIV 后，旧版插件生成的用户码将无法被网页端解密。用户必须更新插件后重新获取用户码，才能生成新的激活码。

修改服务端密钥 serverKey 和初始向量 serverIV 后，所有已经发放的激活码都会失效。已激活用户必须重新生成激活码。

有效期 expiryDate 只在插件端生效，网页端仅用于生成激活码，不做有效期判断。

浏览器可能会缓存 crypto-config.js 和 validity.js，更新密钥后务必强制刷新页面，否则页面可能继续使用旧的密钥。

## 技术说明

C# 项目目标框架为 .NET Framework 4.8，依赖 System.Management 获取机器硬件信息。前端使用 CryptoJS 实现 DES-CBC 加解密。

dotnet build 通过 RegistrationManager 项目文件中的 BeforeBuild Target 自动触发 generate_crypto.py，确保每次编译时加密参数文件与配置文件保持一致。

## 安全提示

本项目的密钥同时存在于前端 JS 和 C# DLL 中，仅用于简单的客户端授权验证。如果有更高的安全需求，建议增加服务端激活、许可证签名或证书校验等机制。
