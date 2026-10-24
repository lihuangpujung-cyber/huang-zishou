import React from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame, interpolate, Easing} from 'remotion';

/**
 * 地图图层组件
 *  - MapPushIn：卫星/地形影像的相机推进（zoom + 平移聚焦于某点），零 WebGL，纯 CSS transform。
 *  - MapAnnotate：在历史地形图上叠加"高州路/潘州/窦州"等示意标注 + "边界非精确"角标。
 *
 * 影像来源：public/maps/ 下三张 Esri 离线拼图（World_Imagery / World_Shaded_Relief）。
 * 注意：历史行政区边界为"示意"，不做精确绘制，并在画面角落明确标注。
 */

const IMG = {
  southchina: {file: 'maps/sat_southchina_z8.png', w: 3072, h: 2048},
  xinyiSat: {file: 'maps/sat_xinyi_z12.png', w: 2560, h: 2560},
  xinyiTerrain: {file: 'maps/terrain_xinyi_z11.png', w: 1536, h: 1280},
} as const;

type ImgKey = keyof typeof IMG;

interface PushInProps {
  img: ImgKey;
  fromScale?: number;
  toScale?: number;
  focusX?: number; // 归一化 0..1
  focusY?: number;
  durationInFrames: number;
  ease?: boolean;
  label?: string; // 右下角地名标签
}

export const MapPushIn: React.FC<PushInProps> = ({
  img,
  fromScale = 1,
  toScale = 2.4,
  focusX = 0.5,
  focusY = 0.5,
  durationInFrames,
  ease = true,
  label,
}) => {
  const frame = useCurrentFrame();
  const meta = IMG[img];
  const t = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease ? Easing.inOut(Easing.cubic) : Easing.linear,
  });
  const S = interpolate(t, [0, 1], [fromScale, toScale]);

  // 影像以 cover 方式铺满 1080x1920
  const W = 1080;
  const H = 1920;
  const scaleFit = Math.max(W / meta.w, H / meta.h);
  const baseW = meta.w * scaleFit;
  const baseH = meta.h * scaleFit;
  const sx = focusX * meta.w * scaleFit;
  const sy = focusY * meta.h * scaleFit;
  const tx = W / 2 - sx * S;
  const ty = H / 2 - sy * S;

  return (
    <AbsoluteFill style={{backgroundColor: '#0b1622'}}>
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: baseW,
            height: baseH,
            transform: `translate(${tx}px, ${ty}px) scale(${S})`,
            transformOrigin: '0 0',
            backgroundImage: `url(${staticFile(meta.file)})`,
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
          }}
        />
      </AbsoluteFill>
      {/* 暗角 + 网格，增加"舆图"质感 */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(120% 80% at 50% 40%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)',
          pointerEvents: 'none',
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
        }}
      />
      {label && (
        <AbsoluteFill
          style={{justifyContent: 'flex-end', alignItems: 'flex-end', padding: 36}}
        >
          <div
            style={{
              fontFamily: 'Noto Sans SC, sans-serif',
              fontSize: 30,
              color: '#eaf2ff',
              background: 'rgba(8,18,30,0.6)',
              padding: '8px 16px',
              borderRadius: 8,
              letterSpacing: 2,
            }}
          >
            {label}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

export interface Mark {
  x: number; // 归一化 0..1（相对影像原始宽高，再按 cover 映射；此处直接用容器比例近似）
  y: number;
  title: string;
  sub?: string;
}

interface AnnotateProps {
  img: ImgKey;
  marks: Mark[];
  focusX?: number;
  focusY?: number;
  scale?: number;
  durationInFrames: number;
}

export const MapAnnotate: React.FC<AnnotateProps> = ({
  img,
  marks,
  focusX = 0.5,
  focusY = 0.5,
  scale = 1.25,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const meta = IMG[img];
  const W = 1080;
  const H = 1920;
  const scaleFit = Math.max(W / meta.w, H / meta.h);
  const baseW = meta.w * scaleFit;
  const baseH = meta.h * scaleFit;
  const sx = focusX * meta.w * scaleFit;
  const sy = focusY * meta.h * scaleFit;
  const tx = W / 2 - sx * scale;
  const ty = H / 2 - sy * scale;

  // 标注点随相机一起平移缩放：屏幕坐标 = (markNorm * base) * scale + t
  const toScreen = (nx: number, ny: number) => ({
    x: nx * baseW * scale + tx,
    y: ny * baseH * scale + ty,
  });

  const reveal = interpolate(frame, [0, Math.min(40, durationInFrames)], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{backgroundColor: '#0b1622'}}>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', overflow: 'hidden'}}>
        <div
          style={{
            width: baseW,
            height: baseH,
            transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
            transformOrigin: '0 0',
            backgroundImage: `url(${staticFile(meta.file)})`,
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: 'radial-gradient(120% 80% at 50% 40%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)',
          pointerEvents: 'none',
        }}
      />
      {/* 标注 */}
      {marks.map((m, i) => {
        const p = toScreen(m.x, m.y);
        const delay = i * 6;
        const op = interpolate(frame, [delay, delay + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        return (
          <AbsoluteFill key={i} style={{pointerEvents: 'none'}}>
            <div style={{position: 'absolute', left: p.x, top: p.y, transform: `translate(-6px,-6px)`}}>
              <div style={{width: 14, height: 14, borderRadius: '50%', background: '#ffd34d', border: '3px solid #7a3b00', boxShadow: '0 0 14px rgba(255,211,77,0.8)'}} />
            </div>
            <div
              style={{
                position: 'absolute',
                left: p.x + 22,
                top: p.y - 18,
                opacity: op,
                transform: `translateY(${(1 - op) * 8}px)`,
                fontFamily: 'Noto Sans SC, sans-serif',
                color: '#fff4d6',
                background: 'rgba(20,12,4,0.72)',
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid rgba(255,211,77,0.5)',
                maxWidth: 360,
              }}
            >
              <div style={{fontSize: 26, fontWeight: 700, letterSpacing: 1}}>{m.title}</div>
              {m.sub && <div style={{fontSize: 18, color: '#e9d9b0', marginTop: 2}}>{m.sub}</div>}
            </div>
          </AbsoluteFill>
        );
      })}
      {/* 边界非精确角标 */}
      <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'flex-start', padding: 28}}>
        <div
          style={{
            opacity: reveal,
            fontFamily: 'Noto Sans SC, sans-serif',
            fontSize: 20,
            color: '#ffe6a8',
            background: 'rgba(40,20,4,0.6)',
            padding: '5px 12px',
            borderRadius: 6,
            border: '1px solid rgba(255,211,77,0.4)',
          }}
        >
          示意 · 历史边界非精确绘制
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export {IMG};
export default MapPushIn;
