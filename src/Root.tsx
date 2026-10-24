import React from 'react';
import {Composition, Sequence, Audio, staticFile} from 'remotion';
import {HuangZishou} from './components/HuangZishou';
import {SmokeTest} from './tests/SmokeTest';
import {MapPushIn, MapAnnotate} from './components/MapLayer';
import {CityWallScene, AppointScene, GranaryScene, ShrineScene} from './components/Scenes';
import {Subtitle, SourceTag, TitleCard, EndCard} from './components/UI';

/**
 * 正式合成：HuangZishou
 * 1080x1920 / 30fps / 约 85 秒。
 * 叙事严格依据 docs/03 史料核查表的校正结论：
 *  - "征南将军"非"征地大将军"；
 *  - 不出现"四品"，军储仓副使按正史为从九品基层仓官；
 *  - 麦福/廖永忠讨海寇均标"据县志载"；
 *  - 历史边界为"示意"，非精确绘制。
 */

const FPS = 30;
const TOTAL = 2560; // 85.3s

// 时间轴（帧）便于维护
const T = {
  title: [0, 120],
  mapRegion: [120, 400],
  mapXinyi: [400, 560],
  intro: [560, 720],
  defend: [720, 1080],
  appointTongzhi: [1080, 1320],
  mapAnnotate: [1320, 1560],
  mapMing: [1560, 1700],
  granary: [1700, 1980],
  appointOfficial: [1980, 2200],
  shrine: [2200, 2440],
  end: [2440, 2560],
};

const seq = (range: number[], content: React.ReactNode) => (
  <Sequence from={range[0]} durationInFrames={range[1] - range[0]}>
    {content}
  </Sequence>
);

export const HuangZishouComp: React.FC = () => {
  return (
    <>
      {/* 普通话旁白（edge-tts 生成，84s，与分镜同步） */}
      <Audio src={staticFile('audio/narration.mp3')} />

      {/* 片头 */}
      {seq(T.title, <TitleCard title="黄子寿" subtitle="元末明初 · 信宜 · 一个县兵的朝代" sub2="历史科普 · 据方志重建" />)}

      {/* 空间背景：从岭南大区域推进到信宜 */}
      {seq(
        T.mapRegion,
        <MapPushIn
          img="southchina"
          fromScale={1}
          toScale={2.6}
          focusX={0.5}
          focusY={0.5}
          durationInFrames={T.mapRegion[1] - T.mapRegion[0]}
          label="岭南 · 高州路（元）"
        />,
      )}
      {seq(T.mapRegion, <Subtitle text="故事发生在元末明初的岭南——今广东信宜一带" start={20} end={270} />)}

      {seq(
        T.mapXinyi,
        <MapPushIn
          img="xinyiSat"
          fromScale={1.1}
          toScale={2.2}
          focusX={0.5}
          focusY={0.5}
          durationInFrames={T.mapXinyi[1] - T.mapXinyi[0]}
          label="信宜 · 水口旺埇"
        />,
      )}
      {seq(T.mapXinyi, <Subtitle text="信宜水口旺埇村，黄氏聚居之地，奉子寿为始祖" start={10} end={150} />)}

      {/* 出场：县兵 */}
      {seq(
        T.intro,
        <AppointScene stage="soldier" />,
      )}
      {seq(T.intro, (
        <>
          <Subtitle text="黄子寿，元末信宜水口旺埇村人" start={0} end={80} />
          <Subtitle text="本县牌兵——元代军中十人为一牌，牌兵即最基层的兵卒" start={84} end={158} />
          <SourceTag kind="正史" text="牌兵建制见《元史·兵志》" />
        </>
      ))}

      {/* 守城：麦福破郡城 → 力战退敌 */}
      {seq(T.defend, <CityWallScene stage="soldier" action="defend" />)}
      {seq(T.defend, (
        <>
          <Subtitle text="据道光《高州府志》《信宜县志》载：至正十年，海寇麦福破郡城，掠信宜，夺县印" start={0} end={170} />
          <Subtitle text="子寿率本县牌兵力战，城得不陷" start={176} end={350} />
          <SourceTag kind="县志" />
        </>
      ))}

      {/* 授高州路同知 */}
      {seq(T.appointTongzhi, <AppointScene stage="tongzhi" />)}
      {seq(T.appointTongzhi, (
        <>
          <Subtitle text="方志称因功授高州路同知" start={0} end={120} />
          <Subtitle text="从县兵到路级佐贰，跨度极大——方志亦未言其实职虚实" start={126} end={236} />
          <SourceTag kind="县志" text="据《信宜县志》" />
        </>
      ))}

      {/* 历史地形示意：高州路/潘州/窦州 */}
      {seq(
        T.mapAnnotate,
        <MapAnnotate
          img="xinyiTerrain"
          durationInFrames={T.mapAnnotate[1] - T.mapAnnotate[0]}
          focusX={0.5}
          focusY={0.5}
          scale={1.3}
          marks={[
            {x: 0.42, y: 0.4, title: '高州路（元）', sub: '明洪武改高州府'},
            {x: 0.62, y: 0.55, title: '潘州', sub: '高州旧称'},
            {x: 0.5, y: 0.66, title: '窦州', sub: '信宜旧称（唐置）'},
          ]}
        />,
      )}
      {seq(T.mapAnnotate, <Subtitle text="元置高州路，信宜旧称窦州；明洪武改路为府" start={20} end={230} />)}

      {/* 明初：征南将军取广东（示意） */}
      {seq(
        T.mapMing,
        <MapPushIn
          img="southchina"
          fromScale={2.4}
          toScale={3.4}
          focusX={0.5}
          focusY={0.5}
          durationInFrames={T.mapMing[1] - T.mapMing[0]}
          label="明初 · 岭南底定"
        />,
      )}
      {seq(T.mapMing, <Subtitle text="洪武元年，征南将军廖永忠由海道取广东" start={10} end={130} />)}
      {seq(T.mapMing, <SourceTag kind="正史" text="据《明史·廖永忠传》" />)}

      {/* 接应军粮、县印复归 → 授军储仓副使 */}
      {seq(T.granary, <GranaryScene stage="official" />)}
      {seq(T.granary, (
        <>
          <Subtitle text="据县志载，明军讨海寇，子寿接应军粮，县印复归" start={0} end={150} />
          <Subtitle text="后授户部军储仓副使——掌管军粮仓储的基层仓官" start={156} end={276} />
          <SourceTag kind="县志" />
        </>
      ))}

      {/* 授任落点（点粮/受印） */}
      {seq(T.appointOfficial, <AppointScene stage="official" />)}
      {seq(T.appointOfficial, (
        <>
          <Subtitle text="官不大，却是他从县兵走向朝廷的落点" start={0} end={120} />
          <SourceTag kind="正史" text="军储仓副使从九品 ·《明史·职官志》" />
        </>
      ))}

      {/* 入祀乡贤祠收尾 */}
      {seq(T.shrine, <ShrineScene />)}
      {seq(T.shrine, <Subtitle text="卒于官，入祀信宜乡贤祠，春秋仲月上丁致祭" start={10} end={230} />)}

      {/* 片尾 */}
      {seq(
        T.end,
        <EndCard
          lines={[
            '黄子寿',
            '元末县兵 · 明初仓官 · 入祀乡贤',
            '本片史实据《明史》《高州府志》《信宜县志》重建，存疑处已标注',
          ]}
        />,
      )}
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
