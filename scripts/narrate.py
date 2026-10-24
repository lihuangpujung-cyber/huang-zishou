#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
旁白生成（edge-tts，普通话）

生成 public/audio/narration.mp3，供 Remotion 合成使用。

用法：
  python scripts/narrate.py            # 生成默认旁白
  python scripts/narrate.py --voice zh-CN-XiaoxiaoNeural

默认男声 zh-CN-YunxiNeural（纪录片语调）。
注意：edge-tts 需要访问微软 TTS 服务（wss://），若本机网络被代理拦截会失败，
失败时会打印错误并退出非 0，由调用方决定是否改用云端或人工配音。
"""
import argparse
import asyncio
import os
import sys

try:
    import edge_tts
except ImportError:
    print("[错误] 未安装 edge-tts，请先: pip install edge-tts", file=sys.stderr)
    sys.exit(2)

# 旁白文案：严格遵循 docs/03 校正结论
#  - "征南将军"非"征地大将军"
#  - 不称"四品"，军储仓副使按正史为基层仓官
#  - 麦福/廖永忠讨海寇均标"据县志/方志载"
NARRATION = """元末明初的岭南，今广东信宜一带，出了一个普通人——黄子寿。他是信宜水口旺埇村人，本县牌兵。元代军中，十人为一牌，牌兵，就是最基层的兵卒。

至正十年，海寇麦福攻破高州郡城，一路抢到信宜，夺走了县印。据道光《高州府志》和《信宜县志》记载，黄子寿率领本县牌兵力战，城池这才保住。

因为退敌有功，方志说他被授为高州路同知。从一个县兵，一跃成为路一级的副手，跨度之大，连方志也没说清这究竟是实职还是虚衔。

元末的高州路，信宜旧称窦州；到了明朝洪武年间，改路为府。洪武元年，征南将军廖永忠从海路攻取广东，岭南就此底定。

据县志记载，明军讨伐海寇时，黄子寿接应军粮，县印也回到了官府手里。后来，他获授户部军储仓副使——掌管军粮仓储的一名基层仓官。

官不大，却是从县兵走到朝廷的落点。他最终卒于任上，入祀信宜乡贤祠，每年春秋两季仲月的上丁日受祭。

一个县兵，两朝之间，留下了自己的名字。"""


async def main(voice: str, out_path: str):
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    comm = edge_tts.Communicate(NARRATION, voice)
    with open(out_path, "wb") as f:
        async for chunk in comm.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                pass
    size = os.path.getsize(out_path)
    print(f"[完成] 旁白已生成: {out_path} ({size} bytes, 语音 {voice})")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", default="zh-CN-YunxiNeural")
    ap.add_argument("--out", default=os.path.join(os.path.dirname(__file__), "..", "public", "audio", "narration.mp3"))
    args = ap.parse_args()
    out = os.path.abspath(args.out)
    try:
        asyncio.run(main(args.voice, out))
    except Exception as e:  # noqa
        print(f"[错误] 旁白生成失败: {e}", file=sys.stderr)
        sys.exit(1)
