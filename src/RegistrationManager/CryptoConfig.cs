// 本文件由 tools/generate_crypto.py 根据 shared/crypto-config.json 自动生成
// 请勿手动修改，修改配置后重新运行 build.py 或 dotnet build

using System;

namespace RegistrationManager
{
    internal static class CryptoConfig
    {
        public static readonly byte[] ClientKey = new byte[] { 1, 3, 5, 7, 9, 11, 13, 15 };
        public static readonly byte[] ClientIV = new byte[] { 17, 19, 21, 23, 25, 27, 29, 31 };
        public static readonly byte[] ServerKey = new byte[] { 2, 4, 6, 8, 10, 12, 14, 16 };
        public static readonly byte[] ServerIV = new byte[] { 18, 20, 22, 24, 26, 28, 30, 32 };

        public static readonly DateTime ExpiryDate = new DateTime(2026, 12, 31, 23, 59, 59);

        public const string InvalidNotice = "插件未注册或已过有效期！";
    }
}
