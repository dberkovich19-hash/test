import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
  Easing,
} from "remotion";

// Color palette based on WithAbroad branding
const COLORS = {
  green: "#2D7D46",
  greenLight: "#4A9D64",
  greenDark: "#1E5C32",
  offWhite: "#F5F3EF",
  cream: "#FAF8F5",
  black: "#1A1A1A",
  gray: "#6B7280",
  accent: "#E8B923",
};

// Globe icon component
const GlobeIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

// Plane icon component
const PlaneIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
  </svg>
);

// Map pin icon
const MapPinIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);

// Calendar icon
const CalendarIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z" />
  </svg>
);

// Feature card component
const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}> = ({ icon, title, description, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 100, stiffness: 200 },
  });

  const opacity = interpolate(frame - delay, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: 20,
        padding: 40,
        width: 340,
        boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
        transform: `translateY(${(1 - progress) * 50}px)`,
        opacity,
      }}
    >
      <div
        style={{
          backgroundColor: COLORS.green,
          width: 70,
          height: 70,
          borderRadius: 16,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontSize: 28,
          fontWeight: "bold",
          color: COLORS.black,
          marginBottom: 12,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 18,
          color: COLORS.gray,
          lineHeight: 1.5,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {description}
      </p>
    </div>
  );
};

export const WithAbroadDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Logo animation
  const logoScale = spring({
    frame,
    fps,
    config: { damping: 100, stiffness: 200 },
  });

  const logoRotation = interpolate(frame, [0, 30], [-10, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Tagline fade in
  const taglineOpacity = interpolate(frame, [25, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Screen transition
  const screenTransition = (startFrame: number) => {
    return interpolate(frame, [startFrame, startFrame + 20], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    });
  };

  // Floating animation for decorative elements
  const floatY = Math.sin(frame * 0.05) * 10;
  const floatY2 = Math.cos(frame * 0.04) * 15;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.offWhite }}>
      {/* Scene 1: Logo Intro (frames 0-90) */}
      <Sequence from={0} durationInFrames={90}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            background: `linear-gradient(135deg, ${COLORS.offWhite} 0%, ${COLORS.cream} 100%)`,
          }}
        >
          {/* Decorative circles */}
          <div
            style={{
              position: "absolute",
              top: 100,
              right: 200,
              width: 300,
              height: 300,
              borderRadius: "50%",
              backgroundColor: COLORS.green,
              opacity: 0.1,
              transform: `translateY(${floatY}px)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 150,
              left: 150,
              width: 200,
              height: 200,
              borderRadius: "50%",
              backgroundColor: COLORS.greenLight,
              opacity: 0.15,
              transform: `translateY(${floatY2}px)`,
            }}
          />

          {/* Logo */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              transform: `scale(${logoScale}) rotate(${logoRotation}deg)`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                marginBottom: 30,
              }}
            >
              <div
                style={{
                  backgroundColor: COLORS.green,
                  padding: 20,
                  borderRadius: 20,
                }}
              >
                <GlobeIcon size={80} color="white" />
              </div>
              <h1
                style={{
                  fontSize: 120,
                  fontWeight: "bold",
                  color: COLORS.black,
                  fontFamily: "system-ui, sans-serif",
                  margin: 0,
                }}
              >
                with<span style={{ color: COLORS.green }}>abroad</span>
              </h1>
            </div>
          </div>

          {/* Tagline */}
          <p
            style={{
              fontSize: 42,
              color: COLORS.gray,
              fontFamily: "system-ui, sans-serif",
              opacity: taglineOpacity,
              marginTop: 20,
            }}
          >
            Your journey starts here
          </p>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: Problem Statement (frames 90-180) */}
      <Sequence from={90} durationInFrames={90}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: COLORS.green,
          }}
        >
          <div style={{ textAlign: "center", maxWidth: 1400, padding: 80 }}>
            <h2
              style={{
                fontSize: 72,
                fontWeight: "bold",
                color: "white",
                fontFamily: "system-ui, sans-serif",
                marginBottom: 40,
                opacity: interpolate(frame - 90, [0, 20], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
                transform: `translateY(${interpolate(frame - 90, [0, 20], [30, 0], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                })}px)`,
              }}
            >
              Planning travel is overwhelming.
            </h2>
            <p
              style={{
                fontSize: 36,
                color: COLORS.cream,
                fontFamily: "system-ui, sans-serif",
                lineHeight: 1.6,
                opacity: interpolate(frame - 90, [15, 35], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              Endless tabs. Conflicting advice. Hours of research.
              <br />
              There has to be a better way.
            </p>
          </div>

          {/* Animated plane */}
          <div
            style={{
              position: "absolute",
              top: 150,
              transform: `translateX(${interpolate(frame - 90, [0, 90], [-200, width + 200])}px) rotate(-15deg)`,
            }}
          >
            <PlaneIcon size={80} color="rgba(255,255,255,0.3)" />
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3: Solution Introduction (frames 180-270) */}
      <Sequence from={180} durationInFrames={90}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            background: `linear-gradient(135deg, ${COLORS.offWhite} 0%, ${COLORS.cream} 100%)`,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h2
              style={{
                fontSize: 80,
                fontWeight: "bold",
                color: COLORS.black,
                fontFamily: "system-ui, sans-serif",
                marginBottom: 30,
                opacity: interpolate(frame - 180, [0, 20], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              Meet <span style={{ color: COLORS.green }}>withabroad</span>
            </h2>
            <p
              style={{
                fontSize: 40,
                color: COLORS.gray,
                fontFamily: "system-ui, sans-serif",
                opacity: interpolate(frame - 180, [20, 40], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              Smart travel planning, simplified.
            </p>

            {/* App mockup */}
            <div
              style={{
                marginTop: 60,
                transform: `scale(${spring({
                  frame: frame - 210,
                  fps,
                  config: { damping: 100 },
                })})`,
              }}
            >
              <div
                style={{
                  width: 350,
                  height: 700,
                  backgroundColor: "white",
                  borderRadius: 40,
                  boxShadow: "0 30px 60px rgba(0,0,0,0.2)",
                  margin: "0 auto",
                  padding: 15,
                  border: `3px solid ${COLORS.black}`,
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: COLORS.cream,
                    borderRadius: 28,
                    display: "flex",
                    flexDirection: "column",
                    padding: 20,
                  }}
                >
                  <div
                    style={{
                      backgroundColor: COLORS.green,
                      padding: 20,
                      borderRadius: 16,
                      marginBottom: 20,
                    }}
                  >
                    <p style={{ color: "white", fontSize: 18, fontWeight: "bold", margin: 0 }}>
                      Your Next Trip
                    </p>
                    <p style={{ color: COLORS.cream, fontSize: 28, fontWeight: "bold", margin: "10px 0 0 0" }}>
                      Tokyo, Japan
                    </p>
                  </div>
                  {["Day 1: Shibuya", "Day 2: Senso-ji", "Day 3: Mt. Fuji"].map((item, i) => (
                    <div
                      key={i}
                      style={{
                        backgroundColor: "white",
                        padding: 16,
                        borderRadius: 12,
                        marginBottom: 10,
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <MapPinIcon size={24} color={COLORS.green} />
                      <span style={{ fontSize: 16, color: COLORS.black }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 4: Features (frames 270-420) */}
      <Sequence from={270} durationInFrames={150}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: COLORS.cream,
          }}
        >
          <h2
            style={{
              position: "absolute",
              top: 80,
              fontSize: 64,
              fontWeight: "bold",
              color: COLORS.black,
              fontFamily: "system-ui, sans-serif",
              opacity: interpolate(frame - 270, [0, 20], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            Everything you need
          </h2>

          <div
            style={{
              display: "flex",
              gap: 40,
              marginTop: 80,
            }}
          >
            <FeatureCard
              icon={<MapPinIcon size={36} color="white" />}
              title="Smart Itineraries"
              description="AI-powered suggestions based on your preferences and travel style."
              delay={290 - 270}
            />
            <FeatureCard
              icon={<CalendarIcon size={36} color="white" />}
              title="Easy Scheduling"
              description="Drag and drop planning with automatic time optimization."
              delay={310 - 270}
            />
            <FeatureCard
              icon={<GlobeIcon size={36} color="white" />}
              title="Local Insights"
              description="Curated recommendations from travelers and locals alike."
              delay={330 - 270}
            />
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 5: Call to Action (frames 420-540) */}
      <Sequence from={420} durationInFrames={120}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            background: `linear-gradient(135deg, ${COLORS.green} 0%, ${COLORS.greenDark} 100%)`,
          }}
        >
          {/* Decorative elements */}
          <div
            style={{
              position: "absolute",
              top: -100,
              left: -100,
              width: 400,
              height: 400,
              borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.1)",
              transform: `translateY(${floatY}px)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -150,
              right: -150,
              width: 500,
              height: 500,
              borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.1)",
              transform: `translateY(${floatY2}px)`,
            }}
          />

          <div style={{ textAlign: "center", zIndex: 1 }}>
            <h2
              style={{
                fontSize: 90,
                fontWeight: "bold",
                color: "white",
                fontFamily: "system-ui, sans-serif",
                marginBottom: 30,
                transform: `scale(${spring({
                  frame: frame - 420,
                  fps,
                  config: { damping: 100 },
                })})`,
              }}
            >
              Start your adventure
            </h2>
            <p
              style={{
                fontSize: 36,
                color: COLORS.cream,
                fontFamily: "system-ui, sans-serif",
                marginBottom: 50,
                opacity: interpolate(frame - 420, [20, 40], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              Join thousands of happy travelers
            </p>

            {/* CTA Button */}
            <div
              style={{
                display: "inline-block",
                backgroundColor: "white",
                padding: "24px 60px",
                borderRadius: 50,
                transform: `scale(${spring({
                  frame: frame - 460,
                  fps,
                  config: { damping: 80, stiffness: 200 },
                })})`,
              }}
            >
              <span
                style={{
                  fontSize: 32,
                  fontWeight: "bold",
                  color: COLORS.green,
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                Get Started Free
              </span>
            </div>

            {/* Website URL */}
            <p
              style={{
                fontSize: 28,
                color: "rgba(255,255,255,0.8)",
                fontFamily: "system-ui, sans-serif",
                marginTop: 40,
                opacity: interpolate(frame - 480, [0, 20], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              withabroad.com
            </p>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
