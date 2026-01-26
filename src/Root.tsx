import { Composition } from "remotion";
import { MyComp } from "./MyComp";
import { WithAbroadDemo } from "./WithAbroadDemo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyComp"
        component={MyComp}
        durationInFrames={120}
        width={1920}
        height={1080}
        fps={30}
        defaultProps={{}}
      />
      <Composition
        id="WithAbroadDemo"
        component={WithAbroadDemo}
        durationInFrames={540}
        width={1920}
        height={1080}
        fps={30}
        defaultProps={{}}
      />
    </>
  );
};
