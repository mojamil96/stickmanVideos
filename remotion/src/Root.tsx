import React from "react";
import {Composition, useCurrentFrame} from "remotion";
import {Face} from "./Face";
import {StickFigure} from "./StickFigure";
import type {Expression} from "./types";

const WIDTH = 1920;
const HEIGHT = 1080;
const FPS = 30;

const EXPRESSIONS: Expression[] = [
  "neutral", "happy", "sad", "angry", "curious", "surprised",
  "scared", "proud", "tired", "confused", "excited",
];

// Temporary: all faces large, to judge each expression.
const FaceSheet: React.FC = () => (
  <svg width={WIDTH} height={HEIGHT} style={{background: "#f4f1ea"}}>
    {EXPRESSIONS.map((e, i) => {
      const x = 240 + (i % 4) * 480;
      const y = 200 + Math.floor(i / 4) * 340;
      return (
        <g key={e} transform={`translate(${x} ${y})`}>
          <circle r={110} fill="white" stroke="#222" strokeWidth={14} />
          <Face expression={e} color="#222" r={110} frame={50} />
          <text y={160} textAnchor="middle" fontSize={34} fontFamily="sans-serif" fill="#444">{e}</text>
        </g>
      );
    })}
  </svg>
);

// Temporary: all expressions at the size they have in the video.
const FaceRow: React.FC = () => (
  <svg width={WIDTH} height={HEIGHT} style={{background: "#f4f1ea"}}>
    <line x1={0} y1={800} x2={WIDTH} y2={800} stroke="#999" strokeWidth={4} />
    {EXPRESSIONS.map((e, i) => (
      <g key={e}>
        <StickFigure color="#222222" action="idle" expression={e} x={110 + i * 170} y={800} scale={2} />
        <text x={110 + i * 170} y={860} textAnchor="middle" fontSize={22} fontFamily="sans-serif" fill="#444">{e}</text>
      </g>
    ))}
  </svg>
);

// Temporary test scene: one stickman on a line. Replaced by StickVideo later.
// 18 px per frame matches the walk's stride at scale 2, so the feet do not slide.
const StickTest: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg width={WIDTH} height={HEIGHT} style={{background: "#f4f1ea"}}>
      <line x1={0} y1={800} x2={WIDTH} y2={800} stroke="#999" strokeWidth={4} />
      <StickFigure color="#222222" action="walk" x={150 + frame * 18} y={800} scale={2} />
    </svg>
  );
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="StickTest" component={StickTest} durationInFrames={90} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="FaceSheet" component={FaceSheet} durationInFrames={30} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="FaceRow" component={FaceRow} durationInFrames={30} fps={FPS} width={WIDTH} height={HEIGHT} />
  </>
);
