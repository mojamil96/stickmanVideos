import React from "react";
import type {Expression} from "./types";

type Eyes = "dot" | "wide" | "slit";
type Mouth = "tongue" | "flat" | "smile" | "frown" | "smallFrown" | "smallO" | "bigO" | "openSmile" | "wobble" | "smirk" | "wavy";

// Each expression is a few choices. Sizes and shifts are in head radii, so the
// face looks the same at any head size.
interface FaceSpec {
  eyes: Eyes;
  eyeScale?: number; // size of the eyes, 1 = normal
  pupil?: number; // pupil size for "wide" eyes
  gaze?: [number, number]; // pupil shift [x, y]; negative y = up
  lift: [number, number]; // left / right eyebrow height; negative = raised
  tilt: [number, number]; // left / right eyebrow tilt in degrees; positive = inner end raised
  mouth: Mouth;
  brows?: boolean; // false = no eyebrows (default true)
  bags?: boolean; // eye bags under the eyes
}

const TONGUE = "#ef8a9d";

const SPECS: Record<Expression, FaceSpec> = {
  neutral: {eyes: "dot", lift: [0, 0], tilt: [0, 0], mouth: "flat", brows: false},
  happy: {eyes: "dot", lift: [-0.04, -0.04], tilt: [0, 0], mouth: "smile"},
  sad: {eyes: "dot", gaze: [0, 0.06], lift: [-0.02, -0.02], tilt: [22, 22], mouth: "frown"},
  angry: {eyes: "dot", eyeScale: 0.9, lift: [0.04, 0.04], tilt: [-25, -25], mouth: "frown"},
  curious: {eyes: "dot", gaze: [0.07, -0.06], lift: [0, 0], tilt: [0, 0], mouth: "tongue", brows: false},
  surprised: {eyes: "wide", pupil: 0.07, lift: [-0.1, -0.1], tilt: [0, 0], mouth: "bigO"},
  scared: {eyes: "wide", pupil: 0.04, lift: [-0.08, -0.08], tilt: [25, 25], mouth: "wobble"},
  proud: {eyes: "dot", gaze: [0, -0.02], lift: [-0.04, -0.04], tilt: [-8, -8], mouth: "smirk"},
  tired: {eyes: "dot", gaze: [0, 0.05], lift: [0.05, 0.05], tilt: [14, 14], mouth: "smallFrown", bags: true},
  confused: {eyes: "dot", gaze: [-0.06, -0.03], lift: [-0.1, 0.02], tilt: [0, -10], mouth: "wavy"},
  excited: {eyes: "dot", eyeScale: 1.35, lift: [-0.1, -0.1], tilt: [0, 0], mouth: "openSmile"},
};

interface Props {
  expression: Expression;
  color: string;
  r: number; // radius of the head this face sits on; the face is centered at (0, 0)
  frame: number; // used for blinking
}

export const Face: React.FC<Props> = ({expression, color, r, frame}) => {
  const spec = SPECS[expression];
  const sw = r * 0.11; // line width of the features
  const eyeX = 0.38 * r;
  const eyeY = -0.12 * r;
  const browY = eyeY - 0.3 * r;
  const my = 0.42 * r; // mouth height

  // A short blink every 3.2 seconds.
  const blink = frame % 96 < 4 ? 0.1 : 1;

  const eye = (side: -1 | 1) => {
    const gx = (spec.gaze?.[0] ?? 0) * r;
    const gy = (spec.gaze?.[1] ?? 0) * r;
    const cx = side * eyeX;
    if (spec.eyes === "slit") {
      return <line key={side} x1={cx - 0.13 * r} y1={eyeY + 0.04 * r} x2={cx + 0.13 * r} y2={eyeY + 0.04 * r} />;
    }
    return (
      <g key={side} transform={`translate(${cx} ${eyeY}) scale(1 ${blink})`}>
        {spec.eyes === "wide" ? (
          <>
            <circle r={0.17 * r} fill="white" />
            <circle cx={gx} cy={gy} r={(spec.pupil ?? 0.06) * r} fill={color} stroke="none" />
          </>
        ) : (
          <circle cx={gx} cy={gy} r={0.085 * r * (spec.eyeScale ?? 1)} fill={color} stroke="none" />
        )}
      </g>
    );
  };

  const bag = (side: -1 | 1) => {
    const cx = side * eyeX;
    const y = eyeY + 0.2 * r;
    return <path key={side} strokeWidth={sw * 0.6} d={`M ${cx - 0.1 * r} ${y} Q ${cx} ${y + 0.07 * r} ${cx + 0.1 * r} ${y}`} />;
  };

  const brow = (side: -1 | 1) => {
    const i = side < 0 ? 0 : 1;
    return (
      <line
        key={side}
        x1={-0.16 * r}
        y1={0}
        x2={0.16 * r}
        y2={0}
        transform={`translate(${side * eyeX} ${browY + spec.lift[i] * r}) rotate(${side * spec.tilt[i]})`}
      />
    );
  };

  const mouth = () => {
    switch (spec.mouth) {
      case "tongue":
        return (
          <>
            <ellipse cx={0.05 * r} cy={my + 0.09 * r} rx={0.08 * r} ry={0.1 * r} fill={TONGUE} strokeWidth={sw * 0.6} />
            <path d={`M ${-0.18 * r} ${my - 0.02 * r} Q 0 ${my + 0.08 * r} ${0.2 * r} ${my - 0.02 * r}`} />
          </>
        );
      case "flat":
        return <path d={`M ${-0.22 * r} ${my} L ${0.22 * r} ${my}`} />;
      case "smile":
        return <path d={`M ${-0.3 * r} ${my - 0.04 * r} Q 0 ${my + 0.36 * r} ${0.3 * r} ${my - 0.04 * r}`} />;
      case "frown":
        return <path d={`M ${-0.26 * r} ${my + 0.08 * r} Q 0 ${my - 0.2 * r} ${0.26 * r} ${my + 0.08 * r}`} />;
      case "smallFrown":
        return <path d={`M ${-0.15 * r} ${my + 0.03 * r} Q 0 ${my - 0.05 * r} ${0.15 * r} ${my + 0.03 * r}`} />;
      case "smallO":
        return <circle cx={0} cy={my} r={0.1 * r} />;
      case "bigO":
        return <ellipse cx={0} cy={my + 0.02 * r} rx={0.13 * r} ry={0.17 * r} />;
      case "openSmile":
        return (
          <path
            d={`M ${-0.3 * r} ${my - 0.06 * r} Q 0 ${my + 0.5 * r} ${0.3 * r} ${my - 0.06 * r} Z`}
            fill={color}
          />
        );
      case "wobble":
        return (
          <path
            d={`M ${-0.28 * r} ${my} L ${-0.14 * r} ${my - 0.06 * r} L 0 ${my + 0.06 * r} L ${0.14 * r} ${my - 0.06 * r} L ${0.28 * r} ${my}`}
          />
        );
      case "smirk":
        return <path d={`M ${-0.22 * r} ${my + 0.04 * r} Q ${0.05 * r} ${my + 0.08 * r} ${0.3 * r} ${my - 0.1 * r}`} />;
      case "wavy":
        return (
          <path d={`M ${-0.3 * r} ${my} Q ${-0.15 * r} ${my - 0.14 * r} 0 ${my} T ${0.3 * r} ${my}`} />
        );
    }
  };

  return (
    <g stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none">
      {/* features sit a little towards the front, which gives the head volume */}
      <g transform={`translate(${0.14 * r} 0)`}>
        {/* brows sit higher where the head curves away, so they shift less */}
        <g transform={`translate(${-0.07 * r} 0)`}>
          {spec.brows !== false && brow(-1)}
          {spec.brows !== false && brow(1)}
        </g>
        {eye(-1)}
        {eye(1)}
        {spec.bags && bag(-1)}
        {spec.bags && bag(1)}
        {mouth()}
      </g>
    </g>
  );
};
