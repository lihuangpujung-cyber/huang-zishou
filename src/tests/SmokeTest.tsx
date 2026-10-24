import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';

/**
 * 最小链路测试：验证 Remotion + 浏览器渲染 + 中文字体 + 图片加载。
 */
export const SmokeTest: React.FC = () => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, 59], [0, 600]);
  return (
    <AbsoluteFill style={{backgroundColor: '#f2ece1'}}>
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: '"Noto Serif SC", "Songti SC", SimSun, serif',
        }}
      >
        <div style={{fontSize: 80, color: '#7a2b20', letterSpacing: 6}}>黄子寿</div>
        <div style={{fontSize: 32, color: '#4a4a4a', marginTop: 24}}>渲染链路测试 frame {frame}</div>
        <div
          style={{
            width: 160,
            height: 160,
            marginTop: 60,
            marginLeft: x,
            borderRadius: 12,
            background: 'linear-gradient(135deg,#7a2b20,#c9a227)',
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
