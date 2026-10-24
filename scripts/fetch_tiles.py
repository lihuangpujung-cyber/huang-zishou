#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
把 Esri 在线瓦片（卫星影像 / 地形晕渲）离线拼成整张大图，供 Remotion 相机运动使用。
- 不依赖任何 WebGL / 地图库，纯 HTTP 下载 + Pillow 拼接，渲染端零成本、全确定性。
- 来源：Esri World Imagery / World Terrain Base（实测 200 可用）。
- 使用责任：卫星影像仅用于「现代地形参考」，画面角标须署名，不得当作元末地貌依据。
"""
import math, os, sys, io
import requests
from PIL import Image

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "maps")

SOURCES = {
    "satellite": "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    "terrain": "https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}",
}


def lonlat_to_tile(lon, lat, z):
    n = 2 ** z
    x = int((lon + 180.0) / 360.0 * n)
    lat_rad = math.radians(lat)
    y = int((1.0 - math.log(math.tan(lat_rad) + 1.0 / math.cos(lat_rad)) / math.pi) / 2.0 * n)
    return x, y


def tile_to_lonlat(x, y, z):
    n = 2 ** z
    lon = x / n * 360.0 - 180.0
    lat_rad = math.atan(math.sinh(math.pi * (1 - 2 * y / n)))
    return lon, math.degrees(lat_rad)


def fetch_tile(url, z, x, y):
    r = requests.get(url.format(z=z, x=x, y=y), headers={"User-Agent": UA}, timeout=30)
    if r.status_code != 200:
        raise RuntimeError(f"tile {z}/{x}/{y} -> {r.status_code}")
    return Image.open(io.BytesIO(r.content)).convert("RGB")


def bake(name, kind, z, lon0, lat0, lon1, lat1, size_px=512, force=False):
    """拼接 (lon0,lat0)-(lon1,lat1) 矩形区域到 z 级大图。"""
    src = SOURCES[kind]
    x0, y0 = lonlat_to_tile(lon0, lat0, z)
    x1, y1 = lonlat_to_tile(lon1, lat1, z)
    x0, x1 = min(x0, x1), max(x0, x1)
    y0, y1 = min(y0, y1), max(y0, y1)
    cols, rows = x1 - x0 + 1, y1 - y0 + 1
    print(f"[{name}] z={z} tiles={cols}x{rows} ({(cols*rows)} 张)")
    os.makedirs(OUT, exist_ok=True)
    out_path = os.path.join(OUT, name)
    if os.path.exists(out_path) and not force:
        print(f"[{name}] 已存在，跳过（force 覆盖）")
        return out_path
    # 先取一张确定真实瓦片边长（Esri 实为 256，不能假设 512，否则拼出黑缝）
    probe = fetch_tile(src, z, x0, y0)
    size_px = probe.size[0]
    print(f"  实测瓦片尺寸 {probe.size}，画布 {cols*size_px}x{rows*size_px}")
    canvas = Image.new("RGB", (cols * size_px, rows * size_px))
    canvas.paste(probe, (0, 0))
    total = cols * rows
    done = 1
    for j in range(rows):
        for i in range(cols):
            if i == 0 and j == 0:
                continue
            try:
                tile = fetch_tile(src, z, x0 + i, y0 + j)
            except Exception as e:
                print(f"  ! 缺块 {x0+i}/{y0+j}: {e}")
                tile = Image.new("RGB", (size_px, size_px), (30, 30, 30))
            canvas.paste(tile, (i * size_px, j * size_px))
            done += 1
            if done % 20 == 0 or done == total:
                print(f"  {done}/{total}")
    canvas.save(out_path)
    print(f"[{name}] 保存 {out_path} {canvas.size}")
    return out_path


if __name__ == "__main__":
    force = "--force" in sys.argv
    # 1) 华南大范围（粤西→福建）：镜头由大区域推进
    bake("sat_southchina_z8.png", "satellite", 8,
         lon0=104.0, lat0=18.5, lon1=119.5, lat1=27.5, force=force)
    # 2) 信宜周边近距离（卫星，z12 保证 1080 像素下不糊）
    bake("sat_xinyi_z12.png", "satellite", 12,
         lon0=110.55, lat0=21.95, lon1=111.35, lat1=22.75, force=force)
    # 3) 信宜周边近距离（地形晕渲，体现云开大山余脉）
    bake("terrain_xinyi_z11.png", "terrain", 11,
         lon0=110.55, lat0=21.95, lon1=111.35, lat1=22.75, force=force)
    print("完成。输出目录:", os.path.abspath(OUT))
