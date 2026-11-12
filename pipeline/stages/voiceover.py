"""Stage 3: story + shots -> narration per shot (Claude)."""

from pipeline import config
from pipeline.llm import ask_claude
from pipeline.run import Run
from pipeline.schemas import ShotList, Story, Voiceover


def check_voiceover(voiceover: Voiceover, shot_list: ShotList) -> None:
    """Exactly one line per shot, in order, with a sensible length."""
    errors = []
    expected = list(range(1, len(shot_list.shots) + 1))
    actual = [line.shot for line in voiceover.lines]
    if actual != expected:
        errors.append(f"expected lines for shots 1-{len(expected)} in order, got {actual}")
    shortest = config.MIN_WORDS_PER_LINE - config.WORD_TOLERANCE
    longest = config.MAX_WORDS_PER_LINE + config.WORD_TOLERANCE
    for line in voiceover.lines:
        words = len(line.text.split())
        if not line.text.strip():
            errors.append(f"shot {line.shot}: empty line")
        elif not shortest <= words <= longest:
            errors.append(f"shot {line.shot}: {words} words (allowed {shortest}-{longest})")
    if errors:
        raise ValueError("Invalid voiceover:\n" + "\n".join(errors))


def generate_voiceover(topic: str, story: Story, shot_list: ShotList) -> Voiceover:
    template = (config.PROMPTS_DIR / "voiceover.md").read_text()
    scenes = "\n".join(
        f"Scene {i}: {scene.fact} (we see: {scene.visual})"
        for i, scene in enumerate(story.scenes, start=1)
    )
    shots = "\n".join(
        f"Shot {i} (scene {shot.scene}): {shot.description}"
        for i, shot in enumerate(shot_list.shots, start=1)
    )
    prompt = template.format(
        language=config.LANGUAGE,
        topic=topic,
        title=story.title,
        scenes=scenes,
        shots=shots,
        min_words=config.MIN_WORDS_PER_LINE,
        max_words=config.MAX_WORDS_PER_LINE,
    )
    voiceover = ask_claude(prompt, Voiceover)
    check_voiceover(voiceover, shot_list)
    return voiceover


def run_voiceover(run: Run) -> Voiceover:
    topic = (run.dir / "topic.txt").read_text()
    story = run.load("story", Story)
    shot_list = run.load("shots", ShotList)
    voiceover = generate_voiceover(topic, story, shot_list)
    run.save("voiceover", voiceover)
    return voiceover
