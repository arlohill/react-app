import { checkPropTypes } from 'prop-types';
import React from 'react';
import { Player,
    ControlBar,
    ReplayControl,
    ForwardControl,
    CurrentTimeDisplay,
    TimeDivider,
    PlaybackRateMenuButton,
    VolumeMenuButton,
    BigPlayButton,
} from 'video-react';
import HLSSource from './HLSSource.js';


export default props => {
  // Add customized HLSSource component into video-react Player
  // The Component with `isVideoChild` attribute will be added into `Video` component
  // Please use this url if you test it from local:
  // http://www.streambox.fr/playlists/x36xhzz/x36xhzz.m3u8
  return (
    <Player>
      <HLSSource
        isVideoChild
        src={props.src} />
       <BigPlayButton position="center" />
        <ControlBar>
            {/* <ReplayControl seconds={10} order={1.1} />
            <ForwardControl seconds={30} order={1.2} /> */}
            <CurrentTimeDisplay order={4.1} />
            <TimeDivider order={4.2} />
            <PlaybackRateMenuButton rates={[2, 1.5, 1, 0.75, 0.5]} order={7.1} />
            <VolumeMenuButton />
      </ControlBar>
     
    </Player>
  );
};