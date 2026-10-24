import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, spring, Easing} from 'remotion';
import {Icon, IconName} from './icons';

/**
 * 地图驱动叙事的通用 UI 原语
 *  - Shot：镜头容器，带淡入/淡出，用于相邻镜头交叉溶解（相邻 Sequence 重叠若干帧）
 *  - MapMarker：地图上的动态图标标记（pop / pulse / flicker / drift）
 *  - Callout：图标 + 引线 + 文字标注卡（按帧错峰入场）
 */

const W = 1080;
const H = 1920;

/* ---------------- Shot（交叉溶解） ---------------- */
export const Shot: React.FC<{dur: number; fadeIn?: number; fadeOut?: number; children: React.ReactNode}> = ({
  dur,
  fadeIn = 0,
  fadeOut = 0,
  children,
}) => {
  const frame = useCurrentFrame();
  const inOp =
    fadeIn > 0
      ? interpolate(frame, [0, Math.max(1, fadeIn)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
      : 1;
  const outOp =
    fadeOut > 0
      ? interpolate(frame, [dur - Math.max(1, fadeOut), dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
      : 1;
  const finalOp = Math.min(inOp, outOp);
  return (
    <AbsoluteFill style={{opacity: finalOp, pointerEvents: 'none'}}>{children}</AbsoluteFill>
  );
};

/* ---------------- 地图标记 ---------------- */
interface MarkerProps {
  x: number; // 0..1
  y: number;
  icon: IconName;
  color?: string;
  accent?: string;
  size?: number;
  delay?: number;
  anim?: 'pop' | 'pulse' | 'flicker' | 'drift';
  driftFrom?: {x: number; y: number};
  driftTo?: {x: number; y: number};
  label?: string;
}

export const MapMarker: React.FC<MarkerProps> = ({
  x,
  y,
  icon,
  color = '#ffd34d',
  accent,
  size = 52,
  delay = 0,
  anim = 'pop',
  driftFrom,
  driftTo,
  label,
}) => {
  const frame = useCurrentFrame();
  const f = frame - delay;

  const enter = spring({frame: Math.max(0, f), fps: 30, config: {damping: 14, stiffness: 140, mass: 0.9}});
  const baseOp = interpolate(f, [0, 6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // 位置（支持漂移）
  let px = x;
  let py = y;
  if (anim === 'drift' && driftFrom && driftTo) {
    px = interpolate(f, [0, 90], [driftFrom.x, driftTo.x], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    py = interpolate(f, [0, 90], [driftFrom.y, driftTo.y], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  }

  // 动画效果
  let scale = enter;
  let ring = 0;
  let opExtra = 1;
  if (anim === 'pulse') {
    ring = (Math.sin(f / 16) + 1) / 2;
  } else if (anim === 'flicker') {
    opExtra = 0.65 + 0.35 * Math.abs(Math.sin(f / 6 + x * 10));
  }

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* 脉冲环 */}
      {anim === 'pulse' && (
        <div
          style={{
            position: 'absolute',
            left: px * W,
            top: py * H,
            width: size * (1.2 + ring * 1.1),
            height: size * (1.2 + ring * 1.1),
            marginLeft: -size * (1.2 + ring * 1.1) / 2,
            marginTop: -size * (1.2 + ring * 1.1) / 2,
            borderRadius: '50%',
            border: `2px solid ${color}`,
            opacity: (1 - ring) * 0.6 * baseOp,
          }}
        />
      )}
      {/* 图标本体 */}
      <div
        style={{
          position: 'absolute',
          left: px * W,
          top: py * H,
          transform: `translate(-50%,-50%) scale(${scale})`,
          opacity: baseOp * opExtra,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Icon name={icon} size={size} color={color} accent={accent} />
        {label && (
          <div
            style={{
              marginTop: 2,
              fontFamily: 'Noto Sans SC, sans-serif',
              fontSize: 22,
              fontWeight: 700,
              color: '#fff',
              textShadow: '0 2px 6px rgba(0,0,0,0.9)',
              whiteSpace: 'nowrap',
              letterSpacing: 1,
            }}
          >
            {label}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- 文字标注 ---------------- */
interface CalloutProps {
  x: number;
  y: number;
  icon: IconName;
  title: string;
  sub?: string;
  color?: string;
  delay?: number;
  align?: 'auto' | 'left';
  size?: number;
}

export const Callout: React.FC<CalloutProps> = ({
  x,
  y,
  icon,
  title,
  sub,
  color = '#ffd34d',
  delay = 0,
  align = 'auto',
  size = 46,
}) => {
  const frame = useCurrentFrame();
  const f = frame - delay;
  const enter = spring({frame: Math.max(0, f), fps: 30, config: {damping: 15, stiffness: 130, mass: 0.9}});
  const op = interpolate(f, [0, 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const toLeft = align === 'left' || (align === 'auto' && x > 0.52);

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: x * W,
          top: y * H,
          transform: `translateY(${(1 - enter) * 10}px)`,
          opacity: op,
          display: 'flex',
          alignItems: 'center',
          flexDirection: toLeft ? 'row-reverse' : 'row',
          gap: 10,
        }}
      >
        <div style={{transform: `scale(${enter})`}}>
          <Icon name={icon} size={size} color={color} />
        </div>
        {/* 引线 */}
        <div style={{width: 22, height: 3, background: color, borderRadius: 2, opacity: 0.9, boxShadow: `0 0 8px ${color}`}} />
        <div
          style={{
            background: 'rgba(10,14,20,0.78)',
            border: `1.5px solid ${color}`,
            borderRadius: 10,
            padding: '8px 14px',
            maxWidth: 360,
            textAlign: toLeft ? 'right' : 'left',
            boxShadow: '0 6px 20px rgba(0,0,0,0.55)',
          }}
        >
          <div style={{fontFamily: 'Noto Sans SC, sans-serif', fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: 1, lineHeight: 1.25}}>
            {title}
          </div>
          {sub && (
            <div style={{fontFamily: 'Noto Sans SC, sans-serif', fontSize: 19, color: '#cfe0f0', marginTop: 3, letterSpacing: 0.5}}>
              {sub}
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- 战斗特效：刀光/交火簇 ---------------- */
export const Clash: React.FC<{x: number; y: number; delay?: number; size?: number; color?: string}> = ({
  x,
  y,
  delay = 0,
  size = 60,
  color = '#ff5a3c',
}) => {
  const frame = useCurrentFrame();
  const f = frame - delay;
  const flash = Math.max(0, Math.sin(f / 4)); // 反复闪光
  const op = interpolate(f, [0, 5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) * (0.4 + 0.6 * flash);
  const s = 0.8 + 0.3 * flash;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: x * W,
          top: y * H,
          transform: `translate(-50%,-50%) scale(${s})`,
          opacity: op,
        }}
      >
        <Icon name="swords" size={size} color={color} accent="#fff0c0" />
      </div>
      {/* 爆点环 */}
      <div
        style={{
          position: 'absolute',
          left: x * W,
          top: y * H,
          width: size * (1.4 + flash),
          height: size * (1.4 + flash),
          marginLeft: -size * (1.4 + flash) / 2,
          marginTop: -size * (1.4 + flash) / 2,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}55 0%, transparent 70%)`,
          opacity: op * 0.8,
        }}
      />
    </AbsoluteFill>
  );
};

/* ---------------- 火光 ---------------- */
export const Fire: React.FC<{x: number; y: number; delay?: number; size?: number}> = ({x, y, delay = 0, size = 50}) => {
  const frame = useCurrentFrame();
  const f = frame - delay;
  const flick = 0.6 + 0.4 * Math.abs(Math.sin(f / 5 + x * 8));
  const op = interpolate(f, [0, 6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: x * W,
          top: y * H,
          transform: `translate(-50%,-50%) scale(${0.9 + flick * 0.15})`,
          opacity: op * flick,
          filter: 'drop-shadow(0 0 10px rgba(255,120,40,0.8))',
        }}
      >
        <Icon name="flame" size={size} color="#ff6a2a" accent="#ffe9a8" />
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- 进攻方向（虚线动画箭头） ---------------- */
export const Approach: React.FC<{
  from: {x: number; y: number};
  to: {x: number; y: number};
  delay?: number;
  color?: string;
  label?: string;
}> = ({from, to, delay = 0, color = '#ff8a4a', label}) => {
  const frame = useCurrentFrame();
  const f = frame - delay;
  const prog = interpolate(f, [0, 80], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const x1 = from.x * W;
  const y1 = from.y * H;
  const x2 = interpolate(prog, [0, 1], [x1, to.x * W]);
  const y2 = interpolate(prog, [0, 1], [y1, to.y * H]);
  const angle = Math.atan2(to.y * H - y1, to.x * W - x1);
  const op = interpolate(f, [0, 8, 70, 80], [0, 1, 1, 0.3], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{position: 'absolute'}}>
        <defs>
          <marker id={`ah-${Math.round(from.x * 1000)}-${Math.round(from.y * 1000)}`} markerWidth="12" markerHeight="12" refX="8" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={color} />
          </marker>
        </defs>
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={color}
          strokeWidth={4}
          strokeDasharray="14 10"
          opacity={op}
          markerEnd={`url(#ah-${Math.round(from.x * 1000)}-${Math.round(from.y * 1000)})`}
        />
      </svg>
      {label && (
        <div
          style={{
            position: 'absolute',
            left: mx,
            top: my,
            transform: 'translate(-50%,-50%)',
            fontFamily: 'Noto Sans SC, sans-serif',
            fontSize: 20,
            color: color,
            background: 'rgba(10,14,20,0.7)',
            padding: '3px 10px',
            borderRadius: 6,
            opacity: op,
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </div>
      )}
    </AbsoluteFill>
  );
};
