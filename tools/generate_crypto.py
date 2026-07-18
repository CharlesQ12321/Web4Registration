import json
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).parent.parent
CONFIG_PATH = ROOT / "shared" / "crypto-config.json"
CS_OUTPUT = ROOT / "src" / "RegistrationManager" / "CryptoConfig.cs"
JS_OUTPUT = ROOT / "crypto-config.js"


def _byte_array_literal(values: list[int]) -> str:
    return ", ".join(str(v) for v in values)


def _generate_cs(config: dict) -> str:
    expiry = datetime.fromisoformat(config["expiryDate"])
    lines = [
        "// 本文件由 tools/generate_crypto.py 根据 shared/crypto-config.json 自动生成",
        "// 请勿手动修改，修改配置后重新运行 build.py 或 dotnet build",
        "",
        "using System;",
        "",
        "namespace RegistrationManager",
        "{",
        "    internal static class CryptoConfig",
        "    {",
        f"        public static readonly byte[] ClientKey = new byte[] {{ {_byte_array_literal(config['clientKey'])} }};",
        f"        public static readonly byte[] ClientIV = new byte[] {{ {_byte_array_literal(config['clientIV'])} }};",
        f"        public static readonly byte[] ServerKey = new byte[] {{ {_byte_array_literal(config['serverKey'])} }};",
        f"        public static readonly byte[] ServerIV = new byte[] {{ {_byte_array_literal(config['serverIV'])} }};",
        "",
        f"        public static readonly DateTime ExpiryDate = new DateTime({expiry.year}, {expiry.month}, {expiry.day}, {expiry.hour}, {expiry.minute}, {expiry.second});",
        "",
        f'        public const string InvalidNotice = "{config["invalidNotice"]}";',
        "    }",
        "}",
        "",
    ]
    return "\n".join(lines)


def _generate_js(config: dict) -> str:
    lines = [
        "// 本文件由 tools/generate_crypto.py 根据 shared/crypto-config.json 自动生成",
        "// 请勿手动修改，修改配置后重新运行 build.py 或 dotnet build",
        "window.CRYPTO_CONFIG = {",
        f"  CLIENT_KEY: CryptoJS.enc.Utf8.parse(String.fromCharCode({_byte_array_literal(config['clientKey'])})),",
        f"  CLIENT_IV: CryptoJS.enc.Utf8.parse(String.fromCharCode({_byte_array_literal(config['clientIV'])})),",
        f"  SERVER_KEY: CryptoJS.enc.Utf8.parse(String.fromCharCode({_byte_array_literal(config['serverKey'])})),",
        f"  SERVER_IV: CryptoJS.enc.Utf8.parse(String.fromCharCode({_byte_array_literal(config['serverIV'])})),",
        f"  EXPIRY_DATE: \"{config['expiryDate']}\",",
        f"  INVALID_NOTICE: \"{config['invalidNotice']}\"",
        "};",
        "",
    ]
    return "\n".join(lines)


def generate() -> None:
    config = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))

    CS_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    CS_OUTPUT.write_text(_generate_cs(config), encoding="utf-8")

    JS_OUTPUT.write_text(_generate_js(config), encoding="utf-8")

    print(f"已生成 {CS_OUTPUT}")
    print(f"已生成 {JS_OUTPUT}")


if __name__ == "__main__":
    generate()
