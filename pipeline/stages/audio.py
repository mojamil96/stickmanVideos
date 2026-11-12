"""Stage 4: narration -> audio files + durations (ElevenLabs)."""

from elevenlabs.client import ElevenLabs
from mutagen.mp3 import MP3

from pipeline import config
from pipeline.run import Run
from pipeline.schemas import AudioClip, AudioManifest, Voiceover


def generate_audio(run: Run, voiceover: Voiceover, limit: int | None = None) -> AudioManifest:
    if not config.ELEVENLABS_API_KEY or not config.ELEVENLABS_VOICE_ID:
        raise RuntimeError("ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID must be set in .env")

    client = ElevenLabs(api_key=config.ELEVENLABS_API_KEY)
    audio_dir = run.dir / "audio"
    audio_dir.mkdir(exist_ok=True)

    lines = voiceover.lines
    clips = []
    for i, line in enumerate(lines[:limit]):
        path = audio_dir / f"shot_{line.shot:02d}.mp3"
        # A line that already has a file is not generated (and paid for) again.
        if not path.exists():
            chunks = client.text_to_speech.convert(
                voice_id=config.ELEVENLABS_VOICE_ID,
                text=line.text,
                model_id=config.ELEVENLABS_MODEL,
                output_format="mp3_44100_128",
                # Neighbouring lines help the voice keep one consistent tone.
                previous_text=lines[i - 1].text if i > 0 else None,
                next_text=lines[i + 1].text if i + 1 < len(lines) else None,
            )
            path.write_bytes(b"".join(chunks))
        clips.append(
            AudioClip(
                shot=line.shot,
                file=str(path.relative_to(run.dir)),
                seconds=MP3(path).info.length,
            )
        )
    return AudioManifest(clips=clips)


def run_audio(run: Run) -> AudioManifest:
    voiceover = run.load("voiceover", Voiceover)
    manifest = generate_audio(run, voiceover)
    run.save("audio", manifest)
    return manifest
