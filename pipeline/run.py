"""A run = one video project, stored as a folder under runs/ with every stage's output."""
"""A run = one video project, stored as a folder under runs/ with every stage's output."""

import re
from datetime import datetime

from pydantic import BaseModel

from pipeline import config


class Run:
    def __init__(self, run_id: str):
        self.id = run_id
        self.dir = config.RUNS_DIR / run_id

    @classmethod
    def create(cls, topic: str) -> "Run":
        slug = re.sub(r"[^a-z0-9]+", "-", topic.lower()).strip("-")[:40]
        run = cls(f"{datetime.now():%Y%m%d-%H%M%S}-{slug}")
        run.dir.mkdir(parents=True)
        (run.dir / "topic.txt").write_text(topic)
        return run

    def has(self, name: str) -> bool:
        return (self.dir / f"{name}.json").exists()

    def save(self, name: str, model: BaseModel) -> None:
        (self.dir / f"{name}.json").write_text(model.model_dump_json(indent=2))

    def load(self, name: str, model_class: type[BaseModel]):
        return model_class.model_validate_json((self.dir / f"{name}.json").read_text())
