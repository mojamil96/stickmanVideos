"""Shared helper: send a prompt to Claude and get back a validated Pydantic object."""

from typing import TypeVar

import anthropic
from pydantic import BaseModel

from pipeline import config

T = TypeVar("T", bound=BaseModel)


def ask_claude(prompt: str, output_model: type[T]) -> T:
    client = anthropic.Anthropic(api_key=config.ANTHROPIC_API_KEY)
    response = client.beta.messages.parse(
        model=config.CLAUDE_MODEL,
        max_tokens=16000,
        output_config={"effort": "medium"},
        output_format=output_model,
        betas=["server-side-fallback-2026-07-01"],
        fallbacks="default",
        messages=[{"role": "user", "content": prompt}],
    )
    if response.stop_reason == "refusal":
        raise RuntimeError(f"Claude declined the request: {response.stop_details}")
    if response.stop_reason == "max_tokens":
        raise RuntimeError("Claude's answer was cut off (max_tokens reached)")
    return response.parsed_output
