using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Management;

namespace RegistrationManager
{
    public static class ValidityManager
    {
        //过期时间
        public static DateTime ExpiryDate = CryptoConfig.ExpiryDate;
        //定义用户码，初始为空，需通过方法创建
        public static string UserCode = "";
        //定义激活状态，初始为未激活 false
        public static bool IsRegistered = false;
        //定义有效期状态
        public static bool IsValid = false;
        //定义未注册提醒，用于电池报错提醒
        public static string InValidNotice = CryptoConfig.InvalidNotice;

        //方法：用来判断是否过期，过期返回false，不过期返回true
        public static bool CheckValidity()
        {
            bool isValid;
            //运行时获取当前时间
            DateTime currentDate = DateTime.Now;
            //判断是否过期
            if (currentDate < ValidityManager.ExpiryDate)
            { isValid = true; }
            else
            { isValid = false; }
            //改写全局静态变量
            ValidityManager.IsValid = isValid;
            //返回结果
            return isValid;
        }

        //方法：获取本地CPU的ID
        public static string GetCpuID()
        {
            try
            {
                foreach (ManagementObject obj in new ManagementClass("Win32_Processor").GetInstances())
                {
                    return obj["ProcessorId"]?.ToString() ?? "";
                }
            }
            catch { }
            return "";
        }

        //方法：获取本地的主板ID
        public static string GetBoardID()
        {
            try
            {
                foreach (ManagementObject obj in new ManagementClass("Win32_BaseBoard").GetInstances())
                {
                    return obj["SerialNumber"]?.ToString() ?? "";
                }
            }
            catch { }
            return "";
        }

        //方法：获取本地的BiosID
        public static string GetBiosID()
        {
            try
            {
                foreach (ManagementObject obj in new ManagementClass("Win32_BIOS").GetInstances())
                {
                    return obj["SerialNumber"]?.ToString() ?? "";
                }
            }
            catch { }
            return "";
        }

        //方法：获取本地的MacAddress
        public static string GetMacAddress()
        {
            try
            {
                foreach (ManagementObject obj in new ManagementClass("Win32_NetworkAdapterConfiguration").GetInstances())
                {
                    if (obj["IPEnabled"] as bool? == true)
                    {
                        return obj["MacAddress"]?.ToString() ?? "";
                    }
                }
            }
            catch { }
            return "";
        }

        //方法：客户端加密方法，将输入的明文 plainText 加密为Base64编码并返回
        public static string ClientDesEncrypt(string plainText)
        {
            using (DESCryptoServiceProvider des = new DESCryptoServiceProvider())
            using (MemoryStream ms = new MemoryStream())
            using (CryptoStream cs = new CryptoStream(ms, des.CreateEncryptor(CryptoConfig.ClientKey, CryptoConfig.ClientIV), CryptoStreamMode.Write))
            using (StreamWriter sw = new StreamWriter(cs))
            {
                sw.Write(plainText);
                sw.Flush();
                cs.FlushFinalBlock();
                return Convert.ToBase64String(ms.ToArray());
            }
        }

        //方法：客户端解密方法，将输入的Base64加密编码 encryptedText 解密为原文并返回
        public static string ClientDesDecrypt(string encryptedText)
        {
            try
            {
                //如果加密编码进行了替换，则需要执行以下反向替换为Base64中的字符。
                encryptedText = encryptedText.Replace("_%_", "/").Replace("-%-", "+");
                byte[] buffer = Convert.FromBase64String(encryptedText);

                using (DESCryptoServiceProvider des = new DESCryptoServiceProvider())
                using (MemoryStream ms = new MemoryStream(buffer))
                using (CryptoStream cs = new CryptoStream(ms, des.CreateDecryptor(CryptoConfig.ClientKey, CryptoConfig.ClientIV), CryptoStreamMode.Read))
                using (StreamReader sr = new StreamReader(cs))
                {
                    return sr.ReadToEnd();
                }
            }
            catch
            {
                return null;
            }
        }

        //方法：服务器端加密方法，将输入的明文 plainText 加密为Base64编码并返回
        public static string ServerDesEncrypt(string plainText)
        {
            using (DESCryptoServiceProvider des = new DESCryptoServiceProvider())
            using (MemoryStream ms = new MemoryStream())
            using (CryptoStream cs = new CryptoStream(ms, des.CreateEncryptor(CryptoConfig.ServerKey, CryptoConfig.ServerIV), CryptoStreamMode.Write))
            using (StreamWriter sw = new StreamWriter(cs))
            {
                sw.Write(plainText);
                sw.Flush();
                cs.FlushFinalBlock();
                return Convert.ToBase64String(ms.ToArray());
            }
        }

        //方法：服务器端解密方法，将输入的Base64加密编码 encryptedText 解密为原文并返回
        public static string ServerDesDecrypt(string encryptedText)
        {
            try
            {
                //如果加密编码进行了替换，则需要执行以下反向替换为Base64中的字符。
                encryptedText = encryptedText.Replace("_%_", "/").Replace("-%-", "+");
                byte[] buffer = Convert.FromBase64String(encryptedText);

                using (DESCryptoServiceProvider des = new DESCryptoServiceProvider())
                using (MemoryStream ms = new MemoryStream(buffer))
                using (CryptoStream cs = new CryptoStream(ms, des.CreateDecryptor(CryptoConfig.ServerKey, CryptoConfig.ServerIV), CryptoStreamMode.Read))
                using (StreamReader sr = new StreamReader(cs))
                {
                    return sr.ReadToEnd();
                }
            }
            catch
            {
                return null;
            }
        }

        //方法：根据本地的 macAddress, cpuID, biosID 计算加密后的用户码。
        public static string GetUserCode()
        {
            try
            {
                string macAddress = GetMacAddress();
                string cpuID = GetCpuID();
                string biosID = GetBiosID();
                return ClientDesEncrypt($"{macAddress},{cpuID},{biosID}");
            }
            catch
            {
                return null;
            }
        }

        //方法：测试用户输入的激活码 vipCode 是否有效
        public static bool TestVip(string vipCode)
        {
            bool isRegistered = false;
            try
            {
                string decryptedCode = ServerDesDecrypt(vipCode);
                if (string.IsNullOrEmpty(decryptedCode)) return false;

                string[] hardwareIds = { GetMacAddress(), GetCpuID(), GetBiosID() };
                string[] codeParts = decryptedCode.Split(',');

                //检查 vipCode 所含ID与 hardwareIds 中的本机ID是否相同
                int matchCount = 0;
                foreach (string id in hardwareIds)
                {
                    foreach (string part in codeParts)
                    {
                        if (part == id)
                        {
                            matchCount++;
                            break;
                        }
                    }
                }
                //若有2相相同，则注册成功
                isRegistered = matchCount >= 2;
                if (isRegistered)
                {
                    //注册成功后将全局静态变量 IsRegistered 改为true，避免多次注册
                    ValidityManager.IsRegistered = isRegistered;
                }

                return isRegistered;
            }
            catch
            {
                return false;
            }
        }

        //方法：生成激活码
        public static string GenerateVipCode(string userCode)
        {
            try
            {
                // 1. 使用客户端的密钥和IV解码用户码
                string decryptedUserCode = ClientDesDecrypt(userCode);
                if (string.IsNullOrEmpty(decryptedUserCode))
                {
                    return null; // 用户码无效
                }

                // 2. 使用服务器端的密钥和IV对解码后的硬件信息进行加密，生成激活码
                string vipCode = ServerDesEncrypt(decryptedUserCode);
                return vipCode;
            }
            catch
            {
                // 如果过程中发生异常，返回null
                return null;
            }
        }



    }
}
