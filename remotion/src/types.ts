// Types for the data Python passes to Remotion. Must match pipeline/schemas.py.

export type Hat = "none" | "cap" | "top_hat" | "cowboy_hat" | "helmet" | "crown" | "chef_hat";
export type Accessory = "none" | "glasses" | "tie" | "cape" | "backpack" | "scarf";
export type Action =
  | "idle" | "walk" | "run" | "wave" | "jump" | "point" | "sit" | "fall" | "think" | "shrug";
export type Background =
  | "meadow" | "forest" | "cave_inside" | "village" | "desert" | "beach" | "night_sky";
export type Prop = "fire" | "rock" | "tree" | "stick" | "hut" | "crops" | "box";
export type Position = "left" | "center" | "right";
export type Expression =
  | "neutral" | "happy" | "sad" | "angry" | "curious" | "surprised" | "scared"
  | "proud" | "tired" | "confused" | "excited";

export interface Character {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface Outfit {
  hat: Hat;
  accessory: Accessory;
  color: string;
  description: string;
}

export interface Actor {
  character_id: string;
  action: Action;
  expression: Expression;
  position: Position;
}

export interface Shot {
  scene: number;
  description: string;
  background: Background;
  props: Prop[];
  actors: Actor[];
}

// What Python hands to Remotion for the whole video
export interface RenderProps {
  bob: Character;
  outfit: Outfit;
  sideCharacters: Character[];
  shots: Array<Shot & { audioFile: string; seconds: number }>;
}
