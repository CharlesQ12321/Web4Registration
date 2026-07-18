// 本文件由 tools/generate_crypto.py 根据 shared/crypto-config.json 自动生成
// 请勿手动修改，修改配置后重新运行 build.py 或 dotnet build
window.CRYPTO_CONFIG = {
  CLIENT_KEY: CryptoJS.enc.Utf8.parse(String.fromCharCode(1, 3, 5, 7, 9, 11, 13, 15)),
  CLIENT_IV: CryptoJS.enc.Utf8.parse(String.fromCharCode(17, 19, 21, 23, 25, 27, 29, 31)),
  SERVER_KEY: CryptoJS.enc.Utf8.parse(String.fromCharCode(2, 4, 6, 8, 10, 12, 14, 16)),
  SERVER_IV: CryptoJS.enc.Utf8.parse(String.fromCharCode(18, 20, 22, 24, 26, 28, 30, 32)),
  EXPIRY_DATE: "2026-12-31T23:59:59",
  INVALID_NOTICE: "插件未注册或已过有效期！"
};
