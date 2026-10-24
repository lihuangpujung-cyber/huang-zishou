import React from 'react';
import {Composition, Sequence, Audio, staticFile} from 'remotion';
import {SmokeTest} from './tests/SmokeTest';
import {MapPushIn, MapAnnotate} from './components/MapLayer';
import {Shot, MapMarker, Callout, Clash, Fire, Approach} from './components/MapUI';
import {Subtitle, SourceTag, TitleCard, EndCard} from './components/UI';

/**
 * 正式合成：HuangZishou v2（地图驱动 · 无人物动画）
 * 1080x1920 / 30fps / 约 86 秒。
 *
 * 与 v1 的区别：去掉分层纸偶人物，改为以卫星/地形影像为主视觉基底，
 * 通过文字标注（Callout）、战斗/冲突图标（刀枪交火/火/船/箭/盾/粮/印/祠）
 * 与地图相机运动来讲叙事；镜头之间用交叉溶解转场（相邻 Sequence 重叠 OV 帧）。
 *
 * 史实口径沿用 docs/03：征南将军、不称四品、麦福/廖永忠讨海寇标"据县志/正史"。
 */

const FPS = 30;
const OV = 12; // 交叉溶解重叠帧数

/* ---------- 氛围色叠加 ---------- */
const Mood: React.FC<{tint: 'warm' | 'cool' | 'none'}> = ({tint}) => {
  if (tint === 'none') return null;
  const bg =
    tint === 'warm'
      ? 'radial-gradient(70% 55% at 50% 50%, rgba(255,80,30,0.20) 0%, rgba(120,20,0,0.35) 100%)'
      : 'radial-gradient(75% 60% at 50% 45%, rgba(30,90,150,0.18) 0%, rgba(6,14,30,0.4) 100%)';
  return <div style={{position: 'absolute', inset: 0, background: bg, mixBlendMode: 'screen', pointerEvents: 'none'}} />;
};

/* ---------- 「十人为一牌」示意卡 ---------- */
const PaiCard: React.FC<{x: number; y: number; delay?: number}> = ({x, y, delay = 0}) => {
  return (
    <div style={{position: 'absolute', left: x * 1080, top: y * 1920, transform: 'translate(-50%,-50%)'}}>
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <Callout x={x} y={0} icon="shield" title="本县牌兵" sub="元代军中，十人为一牌" delay={delay} size={44} />
      </div>
      <div
        style={{
          marginTop: 8,
          display: 'flex',
          gap: 7,
          padding: '8px 12px',
          background: 'rgba(10,14,20,0.82)',
          border: '1px solid rgba(140,200,255,0.45)',
          borderRadius: 10,
          width: 'fit-content',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        {Array.from({length: 10}).map((_, i) => (
          <div key={i} style={{width: 15, height: 15, borderRadius: '50%', background: '#8fd0ff', border: '1.5px solid #3a6a9a'}} />
        ))}
        <div style={{fontFamily: 'Noto Sans SC, sans-serif', fontSize: 18, color: '#cfe6ff', marginLeft: 8, alignSelf: 'center', whiteSpace: 'nowrap'}}>
          = 一牌（十人）
        </div>
      </div>
    </div>
  );
};

/* ---------- 场景定义 ---------- */
type Scene = {id: string; dur: number; render: () => React.ReactNode};

const scenes: Scene[] = [
  /* 1. 片头 */
  {id: 'title', dur: 120, render: () => <TitleCard title="黄子寿" subtitle="元末明初 · 信宜 · 一个县兵的朝代" sub2="历史科普 · 据方志重建" />},

  /* 2. 岭南大区域推进 */
  {
    id: 'region',
    dur: 260,
    render: () => (
      <>
        <MapPushIn img="southchina" fromScale={1} toScale={2.6} focusX={0.5} focusY={0.5} durationInFrames={260} label="岭南 · 高州路（元）" />
        <Mood tint="cool" />
        <MapMarker x={0.5} y={0.42} icon="mountain" color="#ffd34d" anim="pulse" size={54} label="高州路（元）" delay={30} />
        <Callout x={0.34} y={0.56} icon="wave" title="南海之滨" sub="海寇屡犯的沿海" delay={70} color="#7fd0ff" />
        <Subtitle text="故事发生在元末明初的岭南——今广东信宜一带" start={24} end={230} />
      </>
    ),
  },

  /* 3. 信宜定位 */
  {
    id: 'xinyi',
    dur: 150,
    render: () => (
      <>
        <MapPushIn img="xinyiSat" fromScale={1.1} toScale={2.1} focusX={0.5} focusY={0.5} durationInFrames={150} label="信宜 · 水口旺埇" />
        <Callout x={0.5} y={0.46} icon="village" title="信宜 · 水口旺埇村" sub="黄氏聚居，奉子寿为始祖" delay={30} color="#ffd34d" />
        <Subtitle text="信宜水口旺埇村，黄氏聚居之地，奉子寿为始祖" start={18} end={140} />
      </>
    ),
  },

  /* 4. 出场：本县牌兵 */
  {
    id: 'paibing',
    dur: 170,
    render: () => (
      <>
        <MapPushIn img="xinyiSat" fromScale={2.0} toScale={2.4} focusX={0.5} focusY={0.5} durationInFrames={170} label="牌兵 · 基层兵卒" />
        <MapMarker x={0.5} y={0.38} icon="shield" color="#8fd0ff" anim="pulse" size={58} delay={10} />
        <Callout x={0.5} y={0.5} icon="village" title="黄子寿" sub="元末信宜水口旺埇村人" delay={20} color="#ffd34d" />
        <PaiCard x={0.5} y={0.64} delay={60} />
        <Subtitle text="元代军中，十人为一牌——牌兵，就是最基层的兵卒" start={40} end={160} />
        <SourceTag kind="正史" text="牌兵建制见《元史·兵志》" />
      </>
    ),
  },

  /* 5. 战斗 · 麦福破郡城、掠信宜夺县印 */
  {
    id: 'battleAttack',
    dur: 300,
    render: () => (
      <>
        <MapPushIn img="xinyiSat" fromScale={1.9} toScale={2.5} focusX={0.5} focusY={0.5} durationInFrames={300} label="至正十年 · 海寇来犯" />
        <Mood tint="warm" />
        <MapMarker x={0.16} y={0.44} icon="ship" color="#ff8a4a" anim="drift" driftFrom={{x: 0.02, y: 0.42}} driftTo={{x: 0.3, y: 0.46}} size={58} delay={10} />
        <MapMarker x={0.22} y={0.56} icon="ship" color="#ff8a4a" anim="drift" driftFrom={{x: 0.02, y: 0.6}} driftTo={{x: 0.32, y: 0.56}} size={50} delay={26} />
        <Callout x={0.2} y={0.32} icon="banner" title="海寇麦福" sub="攻破高州郡城" delay={20} color="#ff8a4a" />
        <Clash x={0.52} y={0.5} delay={90} size={72} />
        <Clash x={0.44} y={0.56} delay={120} size={54} />
        <Fire x={0.6} y={0.46} delay={100} size={52} />
        <Fire x={0.46} y={0.62} delay={140} size={44} />
        <MapMarker x={0.68} y={0.54} icon="seal" color="#e0483a" anim="pulse" size={48} delay={150} />
        <Callout x={0.62} y={0.66} icon="seal" title="掠信宜 · 夺县印" sub="至正十年" delay={160} color="#ff6a5a" />
        <Subtitle text="至正十年，海寇麦福攻破高州郡城" start={20} end={150} />
        <Subtitle text="一路抢到信宜，夺走了县印" start={156} end={290} />
        <SourceTag kind="县志" />
      </>
    ),
  },

  /* 6. 战斗 · 力战退敌、城得不陷 */
  {
    id: 'battleDefend',
    dur: 260,
    render: () => (
      <>
        <MapPushIn img="xinyiSat" fromScale={2.4} toScale={2.1} focusX={0.5} focusY={0.5} durationInFrames={260} label="子寿力战 · 城得不陷" />
        <Mood tint="cool" />
        <MapMarker x={0.5} y={0.5} icon="shield" color="#7fe08f" anim="pulse" size={72} delay={10} label="力战" />
        <Approach from={{x: 0.5, y: 0.5}} to={{x: 0.16, y: 0.38}} delay={60} color="#7fe08f" label="退敌" />
        <Approach from={{x: 0.5, y: 0.5}} to={{x: 0.84, y: 0.42}} delay={90} color="#7fe08f" />
        <Clash x={0.4} y={0.44} delay={80} size={54} color="#8fe0ff" />
        <Clash x={0.6} y={0.46} delay={120} size={54} color="#8fe0ff" />
        <MapMarker x={0.24} y={0.52} icon="ship" color="#ff8a4a" anim="drift" driftFrom={{x: 0.4, y: 0.5}} driftTo={{x: 0.04, y: 0.44}} size={48} delay={80} />
        <Callout x={0.5} y={0.32} icon="shield" title="子寿率众力战" sub="城得不陷" delay={40} color="#7fe08f" />
        <Subtitle text="黄子寿率领本县牌兵力战，城池这才保住" start={24} end={250} />
        <SourceTag kind="县志" />
      </>
    ),
  },

  /* 7. 授高州路同知 */
  {
    id: 'tongzhi',
    dur: 200,
    render: () => (
      <>
        <MapPushIn img="xinyiTerrain" fromScale={1.2} toScale={1.7} focusX={0.5} focusY={0.5} durationInFrames={200} label="因功授任" />
        <Callout x={0.5} y={0.44} icon="crown" title="授高州路同知" sub="方志称 · 因功授任" delay={30} color="#ffd34d" />
        <MapMarker x={0.34} y={0.58} icon="scroll" color="#e8d9a0" anim="pop" size={48} delay={90} label="告身" />
        <Callout x={0.5} y={0.68} icon="mountain" title="从县兵到路级佐贰" sub="跨度极大 · 虚实无考" delay={130} color="#cfe0f0" />
        <Subtitle text="因为退敌有功，方志说他被授为高州路同知" start={24} end={190} />
        <SourceTag kind="县志" text="据《信宜县志》" />
      </>
    ),
  },

  /* 8. 历史地形示意：高州路/潘州/窦州 */
  {
    id: 'annotate',
    dur: 220,
    render: () => (
      <>
        <MapAnnotate
          img="xinyiTerrain"
          durationInFrames={220}
          focusX={0.5}
          focusY={0.5}
          scale={1.3}
          marks={[
            {x: 0.42, y: 0.4, title: '高州路（元）', sub: '明洪武改高州府'},
            {x: 0.62, y: 0.55, title: '潘州', sub: '高州旧称'},
            {x: 0.5, y: 0.66, title: '窦州', sub: '信宜旧称（唐置）'},
          ]}
        />
        <Subtitle text="元末的高州路，信宜旧称窦州；明洪武改路为府" start={20} end={210} />
        <SourceTag kind="示意" />
      </>
    ),
  },

  /* 9. 明初：征南将军取广东 */
  {
    id: 'ming',
    dur: 230,
    render: () => (
      <>
        <MapPushIn img="southchina" fromScale={2.3} toScale={3.3} focusX={0.5} focusY={0.5} durationInFrames={230} label="明初 · 岭南底定" />
        <Mood tint="cool" />
        <MapMarker x={0.28} y={0.7} icon="wave" color="#7fd0ff" anim="pulse" size={40} delay={10} />
        <MapMarker x={0.36} y={0.62} icon="ship" color="#cfe0f0" anim="drift" driftFrom={{x: 0.2, y: 0.78}} driftTo={{x: 0.46, y: 0.5}} size={54} delay={20} />
        <MapMarker x={0.42} y={0.66} icon="ship" color="#cfe0f0" anim="drift" driftFrom={{x: 0.26, y: 0.82}} driftTo={{x: 0.5, y: 0.54}} size={48} delay={50} />
        <Approach from={{x: 0.4, y: 0.68}} to={{x: 0.52, y: 0.5}} delay={70} color="#9fd8ff" label="由海道取广东" />
        <Callout x={0.58} y={0.38} icon="banner" title="征南将军 廖永忠" sub="洪武元年" delay={110} color="#ffd34d" />
        <Subtitle text="洪武元年，征南将军廖永忠从海路攻取广东" start={24} end={220} />
        <SourceTag kind="正史" text="据《明史·廖永忠传》" />
      </>
    ),
  },

  /* 10. 接应军粮、县印复归 */
  {
    id: 'grain',
    dur: 260,
    render: () => (
      <>
        <MapPushIn img="xinyiSat" fromScale={2.0} toScale={2.3} focusX={0.5} focusY={0.5} durationInFrames={260} label="接应军粮 · 县印复归" />
        <Mood tint="cool" />
        <Approach from={{x: 0.24, y: 0.62}} to={{x: 0.46, y: 0.52}} delay={30} color="#e8c96a" label="军粮" />
        <MapMarker x={0.4} y={0.54} icon="grain" color="#e8c96a" anim="drift" driftFrom={{x: 0.2, y: 0.58}} driftTo={{x: 0.44, y: 0.52}} size={48} delay={20} />
        <MapMarker x={0.38} y={0.62} icon="grain" color="#e8c96a" anim="drift" driftFrom={{x: 0.24, y: 0.66}} driftTo={{x: 0.42, y: 0.6}} size={44} delay={60} />
        <Callout x={0.5} y={0.38} icon="grain" title="接应军粮" sub="子寿为明军筹粮" delay={80} color="#e8c96a" />
        <MapMarker x={0.62} y={0.5} icon="gate" color="#8fd0ff" anim="pop" size={56} delay={120} />
        <Callout x={0.6} y={0.62} icon="seal" title="县印复归" sub="回到了官府手里" delay={150} color="#7fe08f" />
        <Subtitle text="据县志载，明军讨伐海寇时，子寿接应军粮" start={20} end={150} />
        <Subtitle text="县印，也回到了官府手里" start={156} end={250} />
        <SourceTag kind="县志" />
      </>
    ),
  },

  /* 11. 授户部军储仓副使 */
  {
    id: 'official',
    dur: 210,
    render: () => (
      <>
        <MapPushIn img="xinyiTerrain" fromScale={1.7} toScale={2.2} focusX={0.5} focusY={0.5} durationInFrames={210} label="户部军储仓副使" />
        <Callout x={0.5} y={0.44} icon="scroll" title="户部军储仓副使" sub="掌管军粮仓储的基层仓官" delay={30} color="#ffd34d" />
        <MapMarker x={0.34} y={0.58} icon="grain" color="#e8c96a" anim="pop" size={48} delay={90} />
        <div style={{position: 'absolute', left: 0.5 * 1080, top: 0.68 * 1920, transform: 'translate(-50%,-50%)'}}>
          <div style={{fontFamily: 'Noto Sans SC, sans-serif', fontSize: 22, color: '#fff', background: 'rgba(8,32,16,0.72)', border: '1px solid rgba(120,255,150,0.5)', padding: '6px 14px', borderRadius: 8, whiteSpace: 'nowrap'}}>
            从九品 · 基层仓官（据《明史·职官志》）
          </div>
        </div>
        <Subtitle text="后来，他获授户部军储仓副使——官不大，却是从县兵走向朝廷的落点" start={24} end={200} />
        <SourceTag kind="正史" text="军储仓副使从九品" />
      </>
    ),
  },

  /* 12. 入祀乡贤祠 */
  {
    id: 'enshrine',
    dur: 230,
    render: () => (
      <>
        <MapPushIn img="xinyiTerrain" fromScale={1.3} toScale={1.9} focusX={0.5} focusY={0.5} durationInFrames={230} label="入祀乡贤祠" />
        <Mood tint="warm" />
        <Callout x={0.5} y={0.46} icon="shrine" title="入祀信宜乡贤祠" sub="卒于官 · 受乡里奉祀" delay={30} color="#ffd34d" />
        <MapMarker x={0.36} y={0.6} icon="star" color="#ffd34d" anim="pulse" size={40} delay={90} />
        <Callout x={0.5} y={0.68} icon="scroll" title="春秋仲月上丁致祭" sub="乡贤之礼" delay={130} color="#cfe0f0" />
        <Subtitle text="他最终卒于任上，入祀信宜乡贤祠，春秋仲月上丁致祭" start={24} end={220} />
        <SourceTag kind="县志" />
      </>
    ),
  },

  /* 13. 片尾 */
  {
    id: 'end',
    dur: 120,
    render: () => (
      <EndCard
        lines={[
          '黄子寿',
          '元末县兵 · 明初仓官 · 入祀乡贤',
          '本片史实据《明史》《高州府志》《信宜县志》重建，存疑处已标注',
        ]}
      />
    ),
  },
];

/* ---------- 计算带重叠的时间轴 ---------- */
const starts: number[] = [];
let acc = 0;
scenes.forEach((s, i) => {
  starts[i] = acc;
  acc += s.dur - (i < scenes.length - 1 ? OV : 0);
});
const TOTAL = acc;

export const HuangZishouComp: React.FC = () => {
  return (
    <>
      <Audio src={staticFile('audio/narration.mp3')} />
      {scenes.map((s, i) => {
        const dur = s.dur;
        return (
          <Sequence key={s.id} from={starts[i]} durationInFrames={dur}>
            <Shot dur={dur} fadeIn={i === 0 ? 0 : OV} fadeOut={i === scenes.length - 1 ? 0 : OV}>
              {s.render()}
            </Shot>
          </Sequence>
        );
      })}
    </>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SmokeTest"
        component={SmokeTest}
        durationInFrames={60}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="HuangZishou"
        component={HuangZishouComp}
        durationInFrames={TOTAL}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
