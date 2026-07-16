/**
 * 激活码生成逻辑（与原 RegistrationManager.dll 中的 ValidityManager.GenerateVipCode 完全一致）
 *
 * 流程：用户码 → ClientDesDecrypt（ClientKey 解密）→ 硬件信息字符串 → ServerDesEncrypt（ServerKey 加密）→ 激活码
 * 算法：DES-CBC + PKCS7 填充 + Base64 编码
 *
 * 依赖：CryptoJS（需在全局作用域中可用）
 */

// DES 密钥和向量（与原 RegistrationManager.dll 完全一致）
const CLIENT_KEY = CryptoJS.enc.Utf8.parse(String.fromCharCode(1, 3, 5, 7, 9, 11, 13, 15));
const CLIENT_IV  = CryptoJS.enc.Utf8.parse(String.fromCharCode(17, 19, 21, 23, 25, 27, 29, 31));
const SERVER_KEY = CryptoJS.enc.Utf8.parse(String.fromCharCode(2, 4, 6, 8, 10, 12, 14, 16));
const SERVER_IV  = CryptoJS.enc.Utf8.parse(String.fromCharCode(18, 20, 22, 24, 26, 28, 30, 32));

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
