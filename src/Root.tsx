import React from 'react';
import {Composition} from 'remotion';
import {SmokeTest} from './tests/SmokeTest';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SmokeTest"
        component={SmokeTest}
        durationInFrames={60}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
