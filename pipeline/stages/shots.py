"""Stage 2: story -> shot list (Claude)."""

from typing import get_args

from pipeline import config
from pipeline.llm import ask_claude
from pipeline.run import Run
from pipeline.schemas import Action, Background, Expression, Prop, ShotList, Story


def check_shots(shot_list: ShotList, story: Story) -> None:
    """Catch mistakes the schema cannot: unknown characters, bad scene numbers."""
    valid_ids = {config.BOB.id} | {c.id for c in story.side_characters}
    errors = []
    previous_scene = 1
    seen_scenes = set()
    for i, shot in enumerate(shot_list.shots, start=1):
        if not 1 <= shot.scene <= len(story.scenes):
            errors.append(f"shot {i}: scene {shot.scene} does not exist")
        elif shot.scene < previous_scene:
            errors.append(f"shot {i}: scene {shot.scene} comes after scene {previous_scene}")
        previous_scene = max(previous_scene, shot.scene)
        seen_scenes.add(shot.scene)

        if not shot.actors:
            errors.append(f"shot {i}: no actors")
        positions = [a.position for a in shot.actors]
        if len(positions) != len(set(positions)):
            errors.append(f"shot {i}: two actors share a position")
        for actor in shot.actors:
            if actor.character_id not in valid_ids:
                errors.append(f"shot {i}: unknown character '{actor.character_id}'")

    for number in range(1, len(story.scenes) + 1):
        if number not in seen_scenes:
            errors.append(f"scene {number} has no shots")
    if errors:
        raise ValueError("Invalid shot list:\n" + "\n".join(errors))


def generate_shots(story: Story) -> ShotList:
    template = (config.PROMPTS_DIR / "shots.md").read_text()
    characters = [config.BOB, *story.side_characters]
    prompt = template.format(
        story_json=story.model_dump_json(indent=2),
        characters="\n".join(f"- {c.id} ({c.name}): {c.description}" for c in characters),
        min_shots=config.MIN_SHOTS_PER_SCENE,
        max_shots=config.MAX_SHOTS_PER_SCENE,
        actions=", ".join(get_args(Action)),
        backgrounds=", ".join(get_args(Background)),
        props=", ".join(get_args(Prop)),
        expressions=", ".join(get_args(Expression)),
    )
    shot_list = ask_claude(prompt, ShotList)
    check_shots(shot_list, story)
    return shot_list


def run_shots(run: Run) -> ShotList:
    story = run.load("story", Story)
    shot_list = generate_shots(story)
    run.save("shots", shot_list)
    return shot_list
