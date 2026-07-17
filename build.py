import json
import os
import re
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).parent

def url_path(rel: str) -> str:
    return "/".join(quote(part, safe="") for part in rel.replace("\\", "/").split("/"))

def natural_sort_key(name: str):
    return [int(s) if s.isdigit() else s.lower() for s in re.split(r"(\d+)", name)]

def scan_install_guide(folder: Path) -> dict:
    desc_file = folder / "说明文字.txt"
    text = desc_file.read_text(encoding="utf-8").strip() if desc_file.exists() else ""

    lines = [l.strip() for l in text.splitlines() if l.strip()]
    title = ""
    steps = []
    download_url = ""
    download_code = ""

    for line in lines:
        if not title and (line.endswith("：") or line.endswith(":")) and len(line) < 30:
            title = line.rstrip("：:")
            continue
        url_match = re.search(r"https?://[^\s，。、]+", line)
        code_match = re.search(r"提取码[：:]\s*([a-zA-Z0-9]+)", line)
        if url_match:
            download_url = url_match.group(0).rstrip("，。、")
        if code_match:
            download_code = code_match.group(1)
        # 检查是否是步骤行（以数字)开头）
        step_match = re.match(r"(\d+)\)\s*(.+)", line)
        if step_match:
            steps.append({
                "number": int(step_match.group(1)),
                "text": step_match.group(2).strip()
            })
        elif line and not (url_match or code_match or "下载地址" in line or "下载链接" in line):
            steps.append({"number": len(steps) + 1, "text": line})

    image_files = sorted(
        [f for f in folder.iterdir() if f.is_file() and f.suffix.lower() in (".png", ".jpg", ".jpeg", ".gif", ".webp")],
        key=lambda f: natural_sort_key(f.name)
    )
    images = [url_path(os.path.relpath(f, ROOT)) for f in image_files]

    # 按图片文件名编号映射：图片2→步骤4, 图片3→步骤5, 图片5→步骤6, 图片6→步骤7
    image_to_step = {}
    filename_mapping = {2: 4, 3: 5, 5: 6, 6: 7}  # 图片编号 → 步骤编号
    for src in images:
        file_name = decode_url_filename(src)
        num_match = re.match(r"图片(\d+)", file_name)
        if num_match:
            img_num = int(num_match.group(1))
            if img_num in filename_mapping:
                image_to_step[filename_mapping[img_num]] = src

    # 步骤分组：[1,2] 一组, [3] 单独, [4] 单独, [5] 单独, [6,7] 一组
    step_groups = [
        {"steps": [s for s in steps if s["number"] in (1, 2)], "image": image_to_step.get(2)},
        {"steps": [s for s in steps if s["number"] == 3], "image": None},
        {"steps": [s for s in steps if s["number"] == 4], "image": image_to_step.get(4)},
        {"steps": [s for s in steps if s["number"] == 5], "image": image_to_step.get(5)},
        {"steps": [s for s in steps if s["number"] in (6, 7)], "image": image_to_step.get(6)},
    ]

    return {
        "title": title,
        "stepGroups": step_groups,
        "images": images,
        "downloadUrl": download_url,
        "downloadCode": download_code,
    }

def decode_url_filename(src: str) -> str:
    """从 URL 编码路径中提取文件名（解码后）。"""
    from urllib.parse import unquote
    return unquote(src.split("/")[-1])

def scan_case_studies(folder: Path) -> list[dict]:
    cases = []
    for case_dir in sorted(folder.iterdir()):
        if not case_dir.is_dir():
            continue
        desc_file = case_dir / "说明文字.txt"
        description = desc_file.read_text(encoding="utf-8").strip() if desc_file.exists() else ""
        images = sorted(
            [f for f in case_dir.iterdir() if f.is_file() and f.suffix.lower() in (".png", ".jpg", ".jpeg", ".gif", ".webp")],
            key=lambda f: natural_sort_key(f.name)
        )
        cases.append({
            "title": case_dir.name,
            "description": description,
            "images": [url_path(os.path.relpath(img, ROOT)) for img in images]
        })
    return cases

def scan_image_folder(folder: Path) -> list[dict]:
    items = []
    for f in sorted(folder.iterdir()):
        if f.is_file() and f.suffix.lower() in (".png", ".jpg", ".jpeg", ".gif", ".webp"):
            items.append({
                "name": f.stem,
                "src": url_path(os.path.relpath(f, ROOT))
            })
    return items

def main():
    install_guide = scan_install_guide(ROOT / "安装激活说明")
    data = {
        "installGuide": install_guide,
        "caseStudies": scan_case_studies(ROOT / "应用案例展示"),
        "qrCodes": scan_image_folder(ROOT / "站点二维码"),
        "partners": scan_image_folder(ROOT / "合作单位"),
    }
    output = ROOT / "data.js"
    output.write_text(
        "window.siteData = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8"
    )
    print(f"已生成 {output}")
    print(f"  安装标题: {install_guide['title']}")
    print(f"  步骤分组: {len(install_guide['stepGroups'])}")
    for g in install_guide['stepGroups']:
        nums = [s['number'] for s in g['steps']]
        print(f"    步骤{nums} -> 配图: {'有' if g['image'] else '无'}")
    print(f"  下载链接: {install_guide['downloadUrl']}")
    print(f"  提取码: {install_guide['downloadCode']}")
    print(f"  应用案例: {len(data['caseStudies'])}")
    print(f"  友情链接二维码: {len(data['qrCodes'])}")
    print(f"  合作单位: {len(data['partners'])}")

if __name__ == "__main__":
    main()
