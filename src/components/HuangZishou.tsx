import React from 'react';
import {interpolate, useCurrentFrame, Easing} from 'remotion';

/**
 * 黄子寿人物组件（纯 SVG 分层骨骼，零 WebGL）
 *
 * 设计目标（对应需求"以人物动画为主"）：
 *  - 用正向运动学（FK）驱动四肢关节，做呼吸/行走/持械/点数等动作。
 *  - 三套服装对应三个时代阶段：牌兵(soldier) / 高州路同知(tongzhi) / 户部军储仓副使(official)。
 *  - 所有姿态用 interpolate 平滑过渡，便于分镜里复用。
 *
 * 说明：本组件为"示意性"历史重建，非写实肖像；画面上不声称容貌确凿。
 */

const DEG = Math.PI / 180;

type Pt = {x: number; y: number};

function rot(p: Pt, o: Pt, deg: number): Pt {
  const a = deg * DEG;
  const dx = p.x - o.x;
  const dy = p.y - o.y;
  return {x: o.x + dx * Math.cos(a) - dy * Math.sin(a), y: o.y + dx * Math.sin(a) + dy * Math.cos(a)};
}

/** 从 root 出发，按每段相对上一节的转角累计，正向求出各关节坐标。0°=朝下(+y)，正角=朝前(屏幕+x)。 */
function fk(root: Pt, angles: number[], lengths: number[]): Pt[] {
  const pts: Pt[] = [root];
  let x = root.x;
  let y = root.y;
  let a = 0;
  for (let i = 0; i < angles.length; i++) {
    a += angles[i];
    const L = lengths[i];
    x += Math.sin(a * DEG) * L;
    y += Math.cos(a * DEG) * L;
    pts.push({x, y});
  }
  return pts;
}

function limbPath(pts: Pt[]): string {
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
}

/** 把一段一段的肢体画成圆头粗线 */
function Limb({pts, width, color, outline}: {pts: Pt[]; width: number; color: string; outline?: string}) {
  return (
    <>
      {outline && (
        <path d={limbPath(pts)} fill="none" stroke={outline} strokeWidth={width + 4} strokeLinecap="round" strokeLinejoin="round" />
      )}
      <path d={limbPath(pts)} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

type Pose = {
  // 各肢体：上臂/前臂 夹角，大腿/小腿 夹角（相对上一节，度）
  armR: [number, number];
  armL: [number, number];
  legR: [number, number];
  legL: [number, number];
  torsoLean: number; // 躯干前倾
  headTilt: number;
};

const POSES: Record<string, Pose> = {
  idle: {armR: [8, 6], armL: [-8, -6], legR: [3, 2], legL: [-3, -2], torsoLean: 2, headTilt: 0},
  // 持长兵守城：右手前举持械，左手护胸
  defend: {armR: [-55, 35], armL: [20, 40], legR: [10, 4], legL: [-14, 6], torsoLean: 8, headTilt: -4},
  // 接印/受任：双臂前拱作揖
  receive: {armR: [-40, 55], armL: [40, -55], legR: [3, 2], legL: [-3, -2], torsoLean: 6, headTilt: 3},
  // 点数粮袋：右手抬起指示，左手扶案
  count: {armR: [-70, 40], armL: [10, 30], legR: [4, 2], legL: [-4, -2], torsoLean: 10, headTilt: -2},
};

function lerpPose(a: Pose, b: Pose, t: number): Pose {
  const mix = (x: number, y: number) => x + (y - x) * t;
  return {
    armR: [mix(a.armR[0], b.armR[0]), mix(a.armR[1], b.armR[1])],
    armL: [mix(a.armL[0], b.armL[0]), mix(a.armL[1], b.armL[1])],
    legR: [mix(a.legR[0], b.legR[0]), mix(a.legR[1], b.legR[1])],
    legL: [mix(a.legL[0], b.legL[0]), mix(a.legL[1], b.legL[1])],
    torsoLean: mix(a.torsoLean, b.torsoLean),
    headTilt: mix(a.headTilt, b.headTilt),
  };
}

export type Stage = 'soldier' | 'tongzhi' | 'official';
export type Action = 'idle' | 'walk' | 'defend' | 'receive' | 'count';

const COSTUME: Record<Stage, {robe: string; trim: string; skin: string; accent: string; belt: string}> = {
  soldier: {robe: '#6b5a3e', trim: '#4a3c28', skin: '#e8c39a', accent: '#8a3b2e', belt: '#3a2c1a'}, // 褐衣皮甲
  tongzhi: {robe: '#2f5d7c', trim: '#1d3c52', skin: '#e8c39a', accent: '#c8a24a', belt: '#caa64a'}, // 元代蓝袍
  official: {robe: '#4a6b4f', trim: '#2f4733', skin: '#e8c39a', accent: '#b8b0a0', belt: '#6b5a3e'}, // 仓官青绿
};

interface Props {
  stage: Stage;
  action: Action;
  /** 是否循环行走（用于过场） */
  frame?: number;
}

export const HuangZishou: React.FC<Props> = ({stage, action, frame: frameProp}) => {
  const frame = frameProp ?? useCurrentFrame();
  const c = COSTUME[stage];

  // 1) 选基础姿态 + 动作叠加
  let base: Pose = POSES.idle;
  let moving = false;
  if (action === 'defend') base = POSES.defend;
  else if (action === 'receive') base = POSES.receive;
  else if (action === 'count') base = POSES.count;
  else if (action === 'walk') moving = true;

  // 2) 呼吸 / 行走节律（基于帧，确定性）
  const breathe = Math.sin((frame / 38) * Math.PI * 2) * 1.2;
  const swing = moving ? Math.sin((frame / 9) * Math.PI * 2) * 18 : 0;
  const swing2 = moving ? Math.sin((frame / 9) * Math.PI * 2 + Math.PI) * 18 : 0;

  const pose: Pose = {
    armR: [base.armR[0] + breathe * 0.4, base.armR[1]],
    armL: [base.armL[0] - breathe * 0.4, base.armL[1]],
    legR: [base.legR[0] + (moving ? swing * 0.5 : 0), base.legR[1]],
    legL: [base.legL[0] + (moving ? swing2 * 0.5 : 0), base.legL[1]],
    torsoLean: base.torsoLean + (moving ? swing * 0.05 : 0),
    headTilt: base.headTilt,
  };

  // 3) 骨架锚点
  const hip: Pt = {x: 200, y: 470};
  const neckRaw: Pt = {x: 200, y: 250};
  const neck = rot(neckRaw, hip, pose.torsoLean);
  const shoulderR: Pt = {x: neck.x + 34, y: neck.y + 14};
  const shoulderL: Pt = {x: neck.x - 34, y: neck.y + 14};
  const hipR: Pt = {x: hip.x + 16, y: hip.y};
  const hipL: Pt = {x: hip.x - 16, y: hip.y};

  // 4) 四肢 FK
  const armRpts = fk(shoulderR, [pose.armR[0], pose.armR[1]], [95, 88]);
  const armLpts = fk(shoulderL, [-pose.armL[0], -pose.armL[1]], [95, 88]); // 镜像
  const legRpts = fk(hipR, [pose.legR[0], pose.legR[1]], [120, 120]);
  const legLpts = fk(hipL, [pose.legL[0], pose.legL[1]], [120, 120]);

  const headC: Pt = rot({x: neck.x, y: neck.y - 62}, neck, pose.headTilt);

  return (
    <svg viewBox="0 0 400 800" width="100%" height="100%" style={{overflow: 'visible'}}>
      {/* 影 */}
      <ellipse cx={200} cy={760} rx={70} cy={0} fill="rgba(0,0,0,0.22)" />
      {/* 腿 */}
      <Limb pts={legRpts} width={30} color={c.trim} outline="#1c140c" />
      <Limb pts={legLpts} width={30} color={c.trim} outline="#1c140c" />
      {/* 鞋 */}
      <circle cx={legRpts[2].x} cy={legRpts[2].y + 6} r={16} fill="#241a10" />
      <circle cx={legLpts[2].x} cy={legLpts[2].y + 6} r={16} fill="#241a10" />
      {/* 躯干（袍） */}
      <path
        d={`M${shoulderL.x},${shoulderL.y}
            Q${neck.x},${(neck.y - 10).toFixed(1)} ${shoulderR.x},${shoulderR.y}
            L${hip.x + 30},${hip.y}
            L${hip.x - 30},${hip.y} Z`}
        fill={c.robe}
        stroke="#1c140c"
        strokeWidth={3}
      />
      {/* 腰带 */}
      <rect x={hip.x - 34} y={hip.y - 28} width={68} height={18} rx={6} fill={c.belt} stroke="#1c140c" strokeWidth={2} />
      {/* 后臂（左，先画在躯干后） */}
      <Limb pts={armLpts} width={26} color={c.robe} outline="#1c140c" />
      {/* 头 */}
      <circle cx={headC.x} cy={headC.y} r={40} fill={c.skin} stroke="#1c140c" strokeWidth={3} />
      {/* 发/巾 */}
      {stage === 'soldier' ? (
        <path d={`M${headC.x - 40},${headC.y} Q${headC.x},${headC.y - 52} ${headC.x + 40},${headC.y} L${headC.x + 40},${headC.y - 8} Q${headC.x},${headC.y - 40} ${headC.x - 40},${headC.y - 8} Z`} fill="#2a2018" />
      ) : (
        // 官帽（乌纱/幞头示意）
        <path d={`M${headC.x - 44},${headC.y - 6} Q${headC.x},${headC.y - 64} ${headC.x + 44},${headC.y - 6} L${headC.x + 30},${headC.y - 2} Q${headC.x},${headC.y - 46} ${headC.x - 30},${headC.y - 2} Z`} fill="#1d1a16" />
      )}
      {/* 眉眼（极简，示意非写实） */}
      <circle cx={headC.x - 13} cy={headC.y - 4} r={3.2} fill="#3a2a1a" />
      <circle cx={headC.x + 13} cy={headC.y - 4} r={3.2} fill="#3a2a1a" />
      {/* 前臂（右，画在躯干前） */}
      <Limb pts={armRpts} width={26} color={c.robe} outline="#1c140c" />
      {/* 手 */}
      <circle cx={armRpts[2].x} cy={armRpts[2].y} r={12} fill={c.skin} stroke="#1c140c" strokeWidth={2} />
      <circle cx={armLpts[2].x} cy={armLpts[2].y} r={12} fill={c.skin} stroke="#1c140c" strokeWidth={2} />

      {/* 道具（按阶段/动作） */}
      {stage === 'soldier' && action === 'defend' && (
        // 长枪：从右手向右上伸出
        <g>
          <line x1={armRpts[2].x} y1={armRpts[2].y} x2={armRpts[2].x + 120} y2={armRpts[2].y - 150} stroke="#5a3b1e" strokeWidth={7} strokeLinecap="round" />
          <path d={`M${armRpts[2].x + 120},${armRpts[2].y - 150} l16,-26 l-30,6 Z`} fill="#cfd3d6" stroke="#7a7d80" strokeWidth={1.5} />
        </g>
      )}
      {stage !== 'soldier' && action === 'receive' && (
        // 笏板（朝笏示意）
        <rect x={armRpts[2].x - 6} y={armRpts[2].y - 70} width={22} height={74} rx={5} fill="#d9c9a0" stroke="#8a7a4a" strokeWidth={2} transform={`rotate(${pose.armR[0] + 20} ${armRpts[2].x} ${armRpts[2].y})`} />
      )}
      {stage === 'official' && action === 'count' && (
        // 账册/斗（点数示意）
        <rect x={armRpts[2].x - 4} y={armRpts[2].y - 60} width={40} height={52} rx={4} fill="#efe6cf" stroke="#8a7a4a" strokeWidth={2} transform={`rotate(${-20} ${armRpts[2].x} ${armRpts[2].y})`} />
      )}
    </svg>
  );
};

export default HuangZishou;
