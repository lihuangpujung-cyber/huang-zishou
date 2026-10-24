import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import HuangZishou, {Stage, Action} from './HuangZishou';

/**
 * 历史场景重建组件（艺术重建，非写实，画面中存疑处由合成层加角标）
 *  - CityWallScene：城墙守御（至正十年麦福破郡城，子寿力战）
 *  - AppointScene：受任/受印（授同知、授军储仓副使）
 *  - GranaryScene：接应军粮、县印复归
 *  - ShrineScene：入祀乡贤祠（收尾）
 *
 * 这些组件只负责"画面"，字幕与来源角标由合成层叠加，便于统一时序。
 */

function Sky({top, bottom}: {top: string; bottom: string}) {
  return <AbsoluteFill style={{background: `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)`}} />;
}

/** 城墙 + 垛口剪影 */
function Wall() {
  const merlons = Array.from({length: 9});
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end'}}>
      <svg viewBox="0 0 1080 520" width="108% " height="38%" preserveAspectRatio="none" style={{position: 'absolute', bottom: 0}}>
        <rect x={0} y={60} width={1080} height={460} fill="#3a2f23" />
        <rect x={0} y={60} width={1080} height={460} fill="url(#wallg)" opacity={0.5} />
        <g fill="#463a2b">
          {merlons.map((_, i) => (
            <rect key={i} x={i * 120 + 18} y={20} width={70} height={50} rx={4} />
          ))}
        </g>
        {/* 砖纹 */}
        <g stroke="#2a2118" strokeWidth={2} opacity={0.6}>
          {Array.from({length: 8}).map((_, r) =>
            Array.from({length: 14}).map((_, c) => (
              <line key={`${r}-${c}`} x1={c * 80 + (r % 2 ? 40 : 0)} y1={70 + r * 52} x2={c * 80 + (r % 2 ? 40 : 0)} y2={70 + r * 52} />
            )),
          )}
        </g>
        <defs>
          <linearGradient id="wallg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity={0.1} />
            <stop offset="1" stopColor="#000" stopOpacity={0.5} />
          </linearGradient>
        </defs>
      </svg>
    </AbsoluteFill>
  );
}

/** 远处海寇船（示意） */
function Raiders() {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, 200], [1200, 760], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'flex-start'}}>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{position: 'absolute'}}>
        <g transform={`translate(${x}, 520)`} opacity={0.85}>
          <path d="M0,40 L160,40 L140,90 L20,90 Z" fill="#241a12" />
          <rect x={60} y={-30} width={10} height={70} fill="#241a12" />
          <path d="M70,-30 L150,0 L70,10 Z" fill="#3a2a1c" />
          <circle cx={40} cy={60} r={8} fill="#7a2b1e" />
          <circle cx={110} cy={60} r={8} fill="#7a2b1e" />
        </g>
      </svg>
    </AbsoluteFill>
  );
}

export const CityWallScene: React.FC<{stage?: Stage; action?: Action}> = ({stage = 'soldier', action = 'defend'}) => {
  return (
    <AbsoluteFill>
      <Sky top="#5b3a2e" bottom="#caa46a" />
      {/* 远山 */}
      <AbsoluteFill style={{justifyContent: 'flex-end'}}>
        <svg viewBox="0 0 1080 600" width="100%" height="40%" preserveAspectRatio="none" style={{position: 'absolute', bottom: '38%'}}>
          <path d="M0,600 L0,260 Q200,180 360,260 T720,240 T1080,280 L1080,600 Z" fill="#6b4a33" opacity={0.6} />
        </svg>
      </AbsoluteFill>
      <Raiders />
      <Wall />
      {/* 角色立于城墙之上 */}
      <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: '34%'}}>
        <div style={{width: 360, height: 620}}>
          <HuangZishou stage={stage} action={action} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** 受任场景：官服人物作揖，前置"告身/印"案几 */
export const AppointScene: React.FC<{stage: Stage}> = ({stage}) => {
  return (
    <AbsoluteFill>
      <Sky top="#243a4a" bottom="#6f5a3a" />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div style={{width: 360, height: 640}}>
          <HuangZishou stage={stage} action="receive" />
        </div>
      </AbsoluteFill>
      {/* 案几 + 印/文书（示意） */}
      <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 220}}>
        <svg viewBox="0 0 400 160" width={360} height={150}>
          <rect x={40} y={60} width={320} height={26} rx={6} fill="#5a3b1e" />
          <rect x={60} y={86} width={18} height={60} fill="#3a2614" />
          <rect x={322} y={86} width={18} height={60} fill="#3a2614" />
          {/* 印 */}
          <rect x={150} y={30} width={46} height={46} rx={6} fill="#b23a2e" stroke="#7a2018" strokeWidth={3} />
          <rect x={158} y={18} width={30} height={16} rx={4} fill="#d9c9a0" />
          {/* 文书卷 */}
          <rect x={210} y={40} width={80} height={26} rx={6} fill="#efe6cf" stroke="#8a7a4a" strokeWidth={2} />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** 粮仓场景：接应军粮、点数粮袋、县印复归 */
export const GranaryScene: React.FC<{stage: Stage}> = ({stage}) => {
  return (
    <AbsoluteFill>
      <Sky top="#2a3320" bottom="#7a6a44" />
      {/* 仓廪剪影 */}
      <AbsoluteFill style={{justifyContent: 'flex-end'}}>
        <svg viewBox="0 0 1080 700" width="100%" height="46%" preserveAspectRatio="none" style={{position: 'absolute', bottom: 0}}>
          <g fill="#4a3a24">
            <path d="M120,700 L120,300 Q260,180 400,300 L400,700 Z" />
            <path d="M540,700 L540,320 Q680,200 820,320 L820,700 Z" />
          </g>
          <g fill="#5a4a30">
            <rect x={150} y={320} width={230} height={20} />
            <rect x={570} y={340} width={230} height={20} />
          </g>
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div style={{width: 360, height: 640}}>
          <HuangZishou stage={stage} action="count" />
        </div>
      </AbsoluteFill>
      {/* 粮袋堆（示意） */}
      <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'flex-end', padding: 60}}>
        <svg viewBox="0 0 300 220" width={260} height={200}>
          <ellipse cx={80} cy={170} rx={60} ry={44} fill="#c9b07a" stroke="#8a7340" strokeWidth={3} />
          <ellipse cx={170} cy={180} rx={58} ry={42} fill="#bda670" stroke="#8a7340" strokeWidth={3} />
          <ellipse cx={130} cy={110} rx={52} ry={40} fill="#d2b985" stroke="#8a7340" strokeWidth={3} />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** 入祀乡贤祠：牌坊 + 神主牌 */
export const ShrineScene: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = interpolate(frame, [0, 60], [0.2, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <Sky top="#15110a" bottom="#3a2a14" />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <svg viewBox="0 0 1080 1100" width="100%" height="62%" style={{position: 'absolute', top: '14%'}}>
          {/* 牌坊 */}
          <g fill="#7a2b1e" stroke="#4a160e" strokeWidth={4}>
            <rect x={260} y={300} width={50} height={560} />
            <rect x={770} y={300} width={50} height={560} />
            <rect x={230} y={260} width={620} height={50} rx={6} />
            <rect x={300} y={200} width={480} height={46} rx={6} />
            <path d="M230,260 L300,180 L360,260 Z" />
            <path d="M850,260 L780,180 L720,260 Z" />
          </g>
          {/* 匾额 */}
          <rect x={360} y={340} width={360} height={120} rx={8} fill="#1d140a" stroke="#caa64a" strokeWidth={4} />
          <text x={540} y={420} textAnchor="middle" fontFamily="Noto Serif SC, serif" fontSize={64} fill="#f4e4b8" fontWeight={800}>
            乡贤祠
          </text>
          {/* 神主牌 */}
          <g opacity={glow}>
            <rect x={500} y={620} width={80} height={150} rx={8} fill="#caa64a" stroke="#7a5a1a" strokeWidth={3} />
            <rect x={516} y={600} width={48} height={26} rx={4} fill="#e0c878" />
            <text x={540} y={710} textAnchor="middle" fontFamily="Noto Serif SC, serif" fontSize={34} fill="#3a2a0a" fontWeight={700}>
              黄公
            </text>
          </g>
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default CityWallScene;
