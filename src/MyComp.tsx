import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from "remotion";

export const MyComp: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Animated title scale using spring
  const titleScale = spring({
    frame,
    fps,
    config: {
      damping: 200,
    },
  });

  // Fade in the subtitle
  const subtitleOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Animated background gradient position
  const gradientPosition = interpolate(frame, [0, 120], [0, 100]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${gradientPosition}deg, #667eea 0%, #764ba2 50%, #f093fb 100%)`,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Main Title */}
      <Sequence from={0}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h1
            style={{
              fontSize: 120,
              fontWeight: "bold",
              color: "white",
              textShadow: "4px 4px 8px rgba(0,0,0,0.3)",
              transform: `scale(${titleScale})`,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Welcome
          </h1>
        </AbsoluteFill>
      </Sequence>

      {/* Subtitle */}
      <Sequence from={30}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: 180,
          }}
        >
          <p
            style={{
              fontSize: 48,
              color: "white",
              opacity: subtitleOpacity,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Built with Remotion
          </p>
        </AbsoluteFill>
      </Sequence>

      {/* Animated circles */}
      <Sequence from={60}>
        <AbsoluteFill>
          {[0, 1, 2].map((i) => {
            const circleProgress = spring({
              frame: frame - 60 - i * 10,
              fps,
              config: {
                damping: 100,
              },
            });
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  bottom: 100,
                  left: `${25 + i * 25}%`,
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.8)",
                  transform: `scale(${circleProgress}) translateY(${(1 - circleProgress) * 100}px)`,
                }}
              />
            );
          })}
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
