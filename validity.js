/**
 * 激活码生成逻辑（与原 RegistrationManager.dll 中的 ValidityManager.GenerateVipCode 完全一致）
 *
 * 流程：用户码 → ClientDesDecrypt（ClientKey 解密）→ 硬件信息字符串 → ServerDesEncrypt（ServerKey 加密）→ 激活码
 * 算法：DES-CBC + PKCS7 填充 + Base64 编码
 *
 * 依赖：CryptoJS（需在全局作用域中可用）
 */

// DES 密钥和向量从 shared/crypto-config.json 生成，见 crypto-config.js
const CLIENT_KEY = window.CRYPTO_CONFIG.CLIENT_KEY;
const CLIENT_IV  = window.CRYPTO_CONFIG.CLIENT_IV;
const SERVER_KEY = window.CRYPTO_CONFIG.SERVER_KEY;
const SERVER_IV  = window.CRYPTO_CONFIG.SERVER_IV;

/**
 * Client 端 DES 解密：将用户码解密为硬件信息字符串
 * @param {string} encryptedText - 用户码
 * @returns {string|null} 解密后的字符串，失败返回 null
 */
function clientDesDecrypt(encryptedText) {
    try {
        encryptedText = encryptedText.replace(/_%_/g, '/').replace(/-%-/g, '+');
        const decrypted = CryptoJS.DES.decrypt(encryptedText, CLIENT_KEY, {
            iv: CLIENT_IV,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (e) {
        return null;
    }
}

/**
 * Server 端 DES 加密：将硬件信息字符串加密为激活码
 * @param {string} plainText - 硬件信息字符串
 * @returns {string} Base64 编码的激活码
 */
function serverDesEncrypt(plainText) {
    const encrypted = CryptoJS.DES.encrypt(plainText, SERVER_KEY, {
        iv: SERVER_IV,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
}

/**
 * 生成激活码：先解密用户码，再用 Server 密钥加密
 * @param {string} userCode - 用户码
 * @returns {string|null} 激活码，失败返回 null
 */
function generateVipCode(userCode) {
    try {
        const decrypted = clientDesDecrypt(userCode);
        if (!decrypted) return null;
        return serverDesEncrypt(decrypted);
    } catch (e) {
        return null;
    }
}
