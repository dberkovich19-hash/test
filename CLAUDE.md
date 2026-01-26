# Re-motion Video Application

This is a Remotion-based video application using React to render videos. Full documentation available at https://www.remotion.dev/docs/

## Project Structure

The Root file (src/Root.tsx) defines compositions:

```javascript
<Composition
  id="MyComp"
  component={MyComp}
  durationInFrames={120}
  width={1920}
  height={1080}
  fps={30}
  defaultProps={{}}
/>
```

Default settings: 30 fps, 1920x1080 resolution, "MyComp" id. Components access frame numbers via `useCurrentFrame()` hook (starting at 0).

## Media Components

**Video:** Use `<OffthreadVideo>` with props like `startFrom`, `endAt`, and `volume` (0-1 range).

**Images:** Static images use `<Img>` tag; animated GIFs require `@remotion/gif` package with `<Gif>` component.

**Audio:** `<Audio>` tag with `startFrom`, `endAt`, volume controls. Use `staticFile()` API for assets in "public/" folder.

## Layout & Timing

**Layering:** `<AbsoluteFill>` component stacks elements. **Sequential timing:** `<Sequence>` positions elements at specific frames; `<Series>` displays elements sequentially; `<TransitionSeries>` adds transitions between sequences.

## Animation Helpers

- `interpolate()`: Maps frame ranges to output values
- `spring()`: Physics-based animations with dampening config
- `random()`: Deterministic randomness with seed parameter

Retrieve composition settings via `useVideoConfig()` hook.

## UI Component Differences

Remotion components differ fundamentally from interactive React: they're frame-driven, deterministic, non-interactive, and animation-focused—no `useState`, no event handlers, no async operations.
