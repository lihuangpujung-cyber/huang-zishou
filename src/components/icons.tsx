import React from 'react';

/**
 * 图标库（纯内联 SVG，用于地图上的战斗/冲突/地点标注）
 * 设计：几何化、高对比、在白底卫星图上可读；统一 0 0 24 24 viewBox。
 */

export type IconName =
  | 'swords'
  | 'flame'
  | 'arrowUpRight'
  | 'arrowDownRight'
  | 'ship'
  | 'shield'
  | 'grain'
  | 'seal'
  | 'gate'
  | 'shrine'
  | 'scroll'
  | 'wave'
  | 'banner'
  | 'village'
  | 'mountain'
  | 'star'
  | 'crown';

interface Props {
  name: IconName;
  size?: number;
  color?: string;
  accent?: string;
}

const Renderer: Record<IconName, (c: string, a: string) => JSX.Element> = {
  // 刀枪交火：两把交叉的刀 + 护手
  swords: (c) => (
    <g stroke={c} strokeWidth={1.7} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20 L16 5" />
      <path d="M20 20 L8 5" />
      <path d="M6.5 15.5 L9 19 M9 15.5 L6.5 19" />
      <path d="M17.5 15.5 L15 19 M15 15.5 L17.5 19" />
    </g>
  ),
  // 火（填充）
  flame: (c, a) => (
    <g>
      <path
        d="M12 2 C12 2 5.5 8.2 5.5 13.4 a6.5 6.5 0 0 0 13 0 C18.5 8.2 12 2 12 2 Z"
        fill={c}
      />
      <path d="M12 9 C12 9 9 11.6 9 14 a3 3 0 0 0 6 0 C15 11.6 12 9 12 9 Z" fill={a || '#fff3c4'} />
    </g>
  ),
  // 进攻箭头（斜向）
  arrowUpRight: (c, a) => (
    <g>
      <path d="M4 20 L18 6" stroke={c} strokeWidth={2.2} fill="none" strokeLinecap="round" />
      <path d="M18 6 L18 15 M18 6 L9 6" stroke={c} strokeWidth={2.2} fill="none" strokeLinecap="round" />
      <path d="M18 6 l-6.5 0.9 M18 6 l-0.9 6.5" stroke={a || c} strokeWidth={1.2} fill="none" opacity={0.7} />
    </g>
  ),
  // 撤退/退敌箭头（反向斜下）
  arrowDownRight: (c) => (
    <g>
      <path d="M4 4 L18 18" stroke={c} strokeWidth={2.2} fill="none" strokeLinecap="round" />
      <path d="M18 18 L18 9 M18 18 L9 18" stroke={c} strokeWidth={2.2} fill="none" strokeLinecap="round" />
    </g>
  ),
  // 海船（帆船示意）
  ship: (c, a) => (
    <g stroke={c} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 16.5 H21 L18 21 H6 Z" fill={a || c} fillOpacity={0.35} />
      <path d="M12 16.5 V4" />
      <path d="M12 5 Q18 8 18 15 H12 Z" fill={a || c} fillOpacity={0.25} />
      <path d="M12 6 Q6.5 9 6.5 15 H12 Z" fill={a || c} fillOpacity={0.25} />
    </g>
  ),
  // 盾（防御/牌兵）
  shield: (c, a) => (
    <g stroke={c} strokeWidth={1.7} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.5 L20 5.5 V12 c0 5-3.6 8.2-8 9.5 C7.6 20.2 4 17 4 12 V5.5 Z" fill={a || c} fillOpacity={0.18} />
      <path d="M12 7 v8 M8 11 h8" strokeWidth={1.4} />
    </g>
  ),
  // 粮袋
  grain: (c, a) => (
    <g stroke={c} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 8 Q12 5 17 8 Q19 15 17 20 Q12 22 7 20 Q5 15 7 8 Z" fill={a || c} fillOpacity={0.3} />
      <path d="M8 8 Q12 10.5 16 8" strokeWidth={1.3} />
    </g>
  ),
  // 印（红方印）
  seal: (c, a) => (
    <g>
      <rect x="9.5" y="3.5" width="5" height="4.5" rx="1" fill={a || c} />
      <rect x="4.5" y="8" width="15" height="13" rx="2" fill={c} />
      <path d="M9 12 v5 M15 12 v5 M9 14.5 h6" stroke="#fff" strokeWidth={1.4} fill="none" strokeLinecap="round" opacity={0.85} />
    </g>
  ),
  // 城门
  gate: (c, a) => (
    <g stroke={c} strokeWidth={1.7} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21 V8 H21 V21" fill={a || c} fillOpacity={0.15} />
      <path d="M9 21 V15 a3 3 0 0 1 6 0 V15" strokeWidth={1.4} />
      <path d="M1 8 L12 3 L23 8" strokeWidth={1.5} />
    </g>
  ),
  // 牌坊/祠
  shrine: (c, a) => (
    <g stroke={c} strokeWidth={1.7} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 21 V11 M18 21 V11" strokeWidth={2} />
      <path d="M3 11 H21 M5 7.5 H19" />
      <path d="M3 11 L5 5 M21 11 L19 5" />
      <rect x="9" y="13" width="6" height="4" fill={a || c} fillOpacity={0.3} />
    </g>
  ),
  // 文书/告身
  scroll: (c, a) => (
    <g stroke={c} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="4.5" width="14" height="15" rx="1.5" fill={a || c} fillOpacity={0.18} />
      <path d="M8 8.5 h8 M8 12 h8 M8 15.5 h5" strokeWidth={1.3} />
    </g>
  ),
  // 海浪
  wave: (c) => (
    <g stroke={c} strokeWidth={1.6} fill="none" strokeLinecap="round">
      <path d="M2.5 8 q3-2.5 6 0 t6 0 t6 0" />
      <path d="M2.5 13 q3-2.5 6 0 t6 0 t6 0" />
      <path d="M2.5 18 q3-2.5 6 0 t6 0 t6 0" />
    </g>
  ),
  // 旗
  banner: (c, a) => (
    <g stroke={c} strokeWidth={1.7} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3 V21" strokeWidth={2} />
      <path d="M6 4 H19 L15.5 8 L19 12 H6 Z" fill={a || c} fillOpacity={0.35} />
    </g>
  ),
  // 村落
  village: (c, a) => (
    <g stroke={c} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11 L12 4 L21 11" />
      <path d="M5.5 11 V20 H18.5 V11" fill={a || c} fillOpacity={0.2} />
      <path d="M10.5 20 V15 h3 v5" strokeWidth={1.3} />
    </g>
  ),
  // 山地
  mountain: (c, a) => (
    <g stroke={c} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 19 L9 6 L13 13 L16 9 L22 19 Z" fill={a || c} fillOpacity={0.22} />
    </g>
  ),
  // 重点星标
  star: (c, a) => (
    <path
      d="M12 2.5 L14.6 9.2 L21.5 9.6 L16.2 14 L18 20.6 L12 16.8 L6 20.6 L7.8 14 L2.5 9.6 L9.4 9.2 Z"
      fill={a || c}
      stroke={c}
      strokeWidth={1}
    />
  ),
  // 冠/官阶（受任）
  crown: (c, a) => (
    <g stroke={c} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18 L4.5 7 L9 12 L12 5 L15 12 L19.5 7 L21 18 Z" fill={a || c} fillOpacity={0.25} />
      <path d="M3 18 H21" strokeWidth={1.8} />
    </g>
  ),
};

export const Icon: React.FC<Props> = ({name, size = 44, color = '#ffd34d', accent}) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{display: 'block', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'}}>
      {Renderer[name](color, accent)}
    </svg>
  );
};

export default Icon;
