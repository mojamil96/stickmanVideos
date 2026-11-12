"""Stage 1: topic -> story + characters (Claude)."""

from typing import get_args

from pipeline import config
from pipeline.llm import ask_claude
from pipeline.schemas import Accessory, Hat, Story
from pipeline.run import Run


def generate_story(topic: str) -> Story:
    template = (config.PROMPTS_DIR / "story.md").read_text()
    prompt = template.format(
        topic=topic,
        name=config.BOB.name,
        description=config.BOB.description,
        color=config.BOB.color,
        scene_count=config.SCENE_COUNT,
        min_seconds=config.MIN_SECONDS,
        max_seconds=config.MAX_SECONDS,
        hats=", ".join(get_args(Hat)),
        accessories=", ".join(get_args(Accessory)),
    )
    return ask_claude(prompt, Story)

def run_story(run: Run) -> Story:
    topic = (run.dir / "topic.txt").read_text()
    story = generate_story(topic)
    run.save("story", story)
    return story
