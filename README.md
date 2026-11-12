# Stickman video pipeline

Topic → story → shot list → voiceover → audio → stickman video.

- **Claude**: story, characters, shots, narration
- **ElevenLabs**: voice
- **Remotion**: draws, animates and renders the stickmen

## Setup

```bash
cp .env.example .env        # add your API keys
uv sync                     # Python dependencies
cd remotion && npm install  # needs Node.js 18+
```

