import React from "react";
import {useCurrentFrame} from "remotion";
import {Face} from "./Face";
import type {Action, Expression} from "./types";

// A pose is a set of angles in degrees. 0 = limb hangs straight down,
// positive = swings towards the figure's front (the right side of the screen).
interface Pose {
  armL: number;
  armR: number;
  legL: number;
  legR: number;
  bodyY: number; // moves the whole figure down (+) or up (-), in body units
}

const rad = (degrees: number) => (degrees * Math.PI) / 180;

// Frame number in, pose out. Every action is one case here.
const poseFor = (action: Action, frame: number): Pose => {
  switch (action) {
    case "walk": {
      const STEP_FRAMES = 10; // frames per step (a full cycle is two steps)
      const SWING = 35; // how far the legs swing, in degrees
      const wave = Math.sin((frame * Math.PI) / STEP_FRAMES);
      return {
        legL: SWING * wave,
        legR: -SWING * wave,
        // Arms swing against the legs on the same side.
        armL: -SWING * 0.8 * wave,
        armR: SWING * 0.8 * wave,
        // Swung legs are shorter vertically; lowering the body keeps the front
        // foot on the ground instead of floating.
        bodyY: LEG * (1 - Math.cos(rad(SWING * Math.abs(wave)))),
      };
    }
    default:
      // The other actions follow step by step; until then they stand like idle.
      return {armL: 10, armR: -10, legL: 6, legR: -6, bodyY: 0};
  }
};

// Body measurements. The origin (0, 0) is the middle of the feet, y points down.
const HEAD_R = 34;
const BODY = 90;
const ARM = 65;
const LEG = 80;
const HIP_Y = -LEG;
const SHOULDER_Y = HIP_Y - BODY;
const HEAD_Y = SHOULDER_Y - HEAD_R - 6;

interface Props {
  color: string;
  action: Action;
  expression?: Expression;
  x: number; // horizontal position of the feet in the video, in pixels
  y: number; // ground level in the video, in pixels
  scale?: number;
  facing?: "right" | "left";
}

export const StickFigure: React.FC<Props> = ({color, action, expression = "neutral", x, y, scale = 1, facing = "right"}) => {
  const frame = useCurrentFrame();
  const pose = poseFor(action, frame);
  const flip = facing === "left" ? -1 : 1;

  // A limb is a line from its joint, hanging down and rotated by its angle.
  // SVG rotates clockwise, so the angle is negated to make positive = front.
  const limb = (jointX: number, jointY: number, length: number, angle: number) => (
    <g transform={`translate(${jointX} ${jointY}) rotate(${-angle})`}>
      <line x1={0} y1={0} x2={0} y2={length} />
    </g>
  );

  return (
    <g transform={`translate(${x} ${y}) scale(${scale * flip} ${scale})`}>
      <g transform={`translate(0 ${pose.bodyY})`}>
      <g stroke={color} strokeWidth={7} strokeLinecap="round" fill="none">
        {/* body */}
        <line x1={0} y1={HIP_Y} x2={0} y2={SHOULDER_Y} />
        {limb(0, HIP_Y, LEG, pose.legL)}
        {limb(0, HIP_Y, LEG, pose.legR)}
        {limb(0, SHOULDER_Y, ARM, pose.armL)}
        {limb(0, SHOULDER_Y, ARM, pose.armR)}
        {/* head */}
        <circle cx={0} cy={HEAD_Y} r={HEAD_R} fill="white" />
      </g>
      <g transform={`translate(0 ${HEAD_Y})`}>
        <Face expression={expression} color={color} r={HEAD_R} frame={frame} />
      </g>
      </g>
    </g>
  );
};
