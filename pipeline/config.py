"""Settings: project paths, API keys and options loaded from .env."""

import os
from pathlib import Path

from dotenv import load_dotenv

from pipeline.schemas import Character

# pipeline/config.py -> parent is pipeline/, parent.parent is the project root
ROOT = Path(__file__).resolve().parent.parent
RUNS_DIR = ROOT / "runs"
PROMPTS_DIR = ROOT / "pipeline" / "prompts"
REMOTION_DIR = ROOT / "remotion"

load_dotenv(ROOT / ".env")

# Claude
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "claude-sonnet-5-5")

# ElevenLabs
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID")
ELEVENLABS_MODEL = os.getenv("ELEVENLABS_MODEL", "eleven_multilingual_v2")

# Main character: appears in every video. Claude only picks his outfit per video.
BOB = Character(
    id="bob",
    name="Bob",
    description=(
        "A cheerful, curious stickman who always gets into small adventures. "
        "He has no fixed home; every video can take place somewhere new."
    ),
    color="#222222",
)

# Video format (16:9 landscape, shared with Remotion later)
FPS = 30
WIDTH = 1920
HEIGHT = 1080

# Video length: a scene is a story beat; each scene is later split into shots
SCENE_COUNT = 15
MIN_SECONDS = 60
MAX_SECONDS = 240

MIN_SHOTS_PER_SCENE = 2
MAX_SHOTS_PER_SCENE = 3

# Narration
LANGUAGE = "English"
MIN_WORDS_PER_LINE = 12
MAX_WORDS_PER_LINE = 17
WORD_TOLERANCE = 2  # lines this far outside the range still pass the check
