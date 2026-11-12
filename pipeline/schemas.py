"""Data formats exchanged between the stages (story, shots, voiceover, audio, render props)."""

from typing import Literal

from pydantic import BaseModel, Field

# Outfit parts the stickman renderer knows how to draw. Add new items here
# only together with their drawing code in Remotion.
Hat = Literal["none", "cap", "top_hat", "cowboy_hat", "helmet", "crown", "chef_hat"]
Accessory = Literal["none", "glasses", "tie", "cape", "backpack", "scarf"]
Action = Literal["idle", "walk", "run", "wave", "jump", "point", "sit", "fall", "think", "shrug"]
Background = Literal["meadow", "forest", "cave_inside", "village", "desert", "beach", "night_sky"]
Prop = Literal["fire", "rock", "tree", "stick", "hut", "crops", "box"]
Position = Literal["left", "center", "right"]
Expression = Literal[
    "neutral", "happy", "sad", "angry", "curious", "surprised", "scared",
    "proud", "tired", "confused", "excited",
]


class Character(BaseModel):
    id: str = Field(description="Short lowercase id used to refer to the character, e.g. 'bob'")
    name: str
    description: str = Field(description="Personality and role in the story")
    color: str = Field(description="Hex color of the stickman, e.g. '#e63946'")


class Outfit(BaseModel):
    hat: Hat = "none"
    accessory: Accessory = "none"
    color: str = Field(description="Main outfit color as hex, e.g. '#2a9d8f'")
    description: str = Field(description="One sentence explaining the outfit choice for this video")
    wished_items: list[str] = Field(
        default_factory=list,
        description="Outfit items that would fit this story better but are not available",
    )


class Scene(BaseModel):
    visual: str = Field(description="What we see: the action, only things a stickman can show")
    fact: str = Field(description="The one thing the viewer learns in this scene")


class Story(BaseModel):
    title: str
    logline: str = Field(description="The story in one sentence")
    outfit: Outfit = Field(description="What Bob wears in this video")
    side_characters: list[Character] = Field(default_factory=list)
    scenes: list[Scene] = Field(description="The story in order; scene 1 is the hook")


class Actor(BaseModel):
    character_id: str = Field(description="Id of Bob or a side character")
    action: Action
    expression: Expression = Field(
        default="neutral", description="How the character feels in this shot"
    )
    position: Position


class Shot(BaseModel):
    scene: int = Field(description="Number of the scene (1-based) this shot belongs to")
    description: str = Field(description="One sentence: what happens in this clip")
    background: Background
    props: list[Prop] = Field(default_factory=list)
    actors: list[Actor]
    wished_items: list[str] = Field(
        default_factory=list,
        description="Actions, props or backgrounds that would fit better but are not available",
    )


class ShotList(BaseModel):
    shots: list[Shot]


class VoiceLine(BaseModel):
    shot: int = Field(description="Number of the shot (1-based) this line belongs to")
    text: str = Field(description="What the narrator says during this shot")


class Voiceover(BaseModel):
    lines: list[VoiceLine]


class AudioClip(BaseModel):
    shot: int = Field(description="Number of the shot (1-based) this audio belongs to")
    file: str = Field(description="Path of the mp3, relative to the run folder")
    seconds: float = Field(description="Length of the audio; it sets the length of the shot")


class AudioManifest(BaseModel):
    clips: list[AudioClip]
