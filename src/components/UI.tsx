import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';

/**
 * 通用字幕与史料来源角标
 *  - Subtitle：底部居中字幕，按帧淡入淡出，长句自动折行。
 *  - SourceTag：右上角小角标，标注"据县志载 / 示意 / 宗族记忆"等可信度。
 *  - TitleCard / EndCard：片头片尾。
 */

export const Subtitle: React.FC<{text: string; start?: number; end?: number}> = ({text, start = 0, end = 99999}) => {
  const frame = useCurrentFrame();
  const localEnd = end;
  const op = interpolate(frame, [start, start + 6, localEnd - 6, localEnd], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 150, pointerEvents: 'none'}}>
      <div
        style={{
          opacity: op,
          maxWidth: 920,
          fontFamily: 'Noto Sans SC, sans-serif',
          fontSize: 40,
          lineHeight: 1.5,
          color: '#fff',
          textAlign: 'center',
          background: 'rgba(0,0,0,0.55)',
          padding: '16px 28px',
          borderRadius: 14,
          textShadow: '0 2px 6px rgba(0,0,0,0.8)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

type TagKind = '县志' | '示意' | '宗族记忆' | '正史';

const TAG_STYLE: Record<TagKind, {bg: string; fg: string; border: string}> = {
  县志: {bg: 'rgba(40,20,4,0.66)', fg: '#ffe6a8', border: 'rgba(255,211,77,0.5)'},
  示意: {bg: 'rgba(8,24,40,0.66)', fg: '#bfe3ff', border: 'rgba(120,200,255,0.5)'},
  宗族记忆: {bg: 'rgba(40,8,28,0.66)', fg: '#ffc9e6', border: 'rgba(255,140,200,0.5)'},
  正史: {bg: 'rgba(8,32,16,0.66)', fg: '#c6ffce', border: 'rgba(120,255,150,0.5)'},
};

export const SourceTag: React.FC<{kind: TagKind; text?: string}> = ({kind, text}) => {
  const s = TAG_STYLE[kind];
  const label = text ?? ({县志: '据县志载', 示意: '示意', 宗族记忆: '宗族记忆', 正史: '据正史'}[kind]);
  return (
    <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'flex-end', padding: 28, pointerEvents: 'none'}}>
      <div
        style={{
          fontFamily: 'Noto Sans SC, sans-serif',
          fontSize: 20,
          color: s.fg,
          background: s.bg,
          padding: '5px 12px',
          borderRadius: 6,
          border: `1px solid ${s.border}`,
          letterSpacing: 1,
        }}
      >
        {label}
      </div>
    </AbsoluteFill>
  );
};

export const TitleCard: React.FC<{title: string; subtitle: string; sub2?: string}> = ({title, subtitle, sub2}) => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [0, 18, 110, 140], [0, 1, 1, 0], {extrapolateRight: 'clamp'});
  const y = interpolate(frame, [0, 18], [40, 0], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(160deg, #1a1206 0%, #2a1c0a 50%, #0c0a06 100%)',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: a,
      }}
    >
      <div style={{transform: `translateY(${y}px)`, textAlign: 'center'}}>
        <div style={{fontFamily: 'Noto Serif SC, serif', fontSize: 96, fontWeight: 800, color: '#f4e4b8', letterSpacing: 8, textShadow: '0 4px 18px rgba(0,0,0,0.7)'}}>
          {title}
        </div>
        <div style={{marginTop: 26, fontFamily: 'Noto Sans SC, sans-serif', fontSize: 38, color: '#d9c79a', letterSpacing: 4}}>
          {subtitle}
        </div>
        {sub2 && (
          <div style={{marginTop: 14, fontFamily: 'Noto Sans SC, sans-serif', fontSize: 26, color: '#9b8a63', letterSpacing: 2}}>
            {sub2}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

export const EndCard: React.FC<{lines: string[]}> = ({lines}) => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [0, 16], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(160deg, #0c0a06 0%, #1a1206 100%)',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: a,
      }}
    >
      <div style={{textAlign: 'center', maxWidth: 900}}>
        {lines.map((l, i) => (
          <div
            key={i}
            style={{
              fontFamily: 'Noto Sans SC, sans-serif',
              fontSize: i === 0 ? 44 : 28,
              fontWeight: i === 0 ? 700 : 400,
              color: i === 0 ? '#f4e4b8' : '#cdbb8e',
              marginBottom: i === 0 ? 22 : 12,
              letterSpacing: 1,
            }}
          >
            {l}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
