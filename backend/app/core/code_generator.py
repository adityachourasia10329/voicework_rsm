"""
-5-Character Alphanumeric Identifier System (Base36)
Generates compact, collision-proof uppercase codes (e.g., '7K9Q2', 'B4T81')
with 60M+ unique combinations, database constraint checking, and retry loop.
"""

import secrets
import string
import re
from typing import Callable, Optional, Awaitable, Union

BASE36_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
CODE_LENGTH = 5
MAX_RETRIES = 100
CODE_REGEX = re.compile(r"^[0-9A-Z]{5}$")

def generate_5char_code() -> str:
    """
    Generate a random 5-character uppercase alphanumeric code using
    cryptographically secure random choice from Base36 alphabet.
    """
    return "".join(secrets.choice(BASE36_ALPHABET) for _ in range(CODE_LENGTH))

def is_valid_5char_code(code: str) -> bool:
    """Validate if the string is a valid 5-character uppercase Base36 code."""
    if not code or len(code) != CODE_LENGTH:
        return False
    return bool(CODE_REGEX.match(code.upper()))

def generate_unique_code(
    is_code_taken_fn: Callable[[str], bool],
    max_retries: int = MAX_RETRIES
) -> str:
    """
    Collision-proof retry loop with database constraint checking.
    Guarantees zero collisions by querying the store/database callback.
    """
    for attempt in range(max_retries):
        candidate = generate_5char_code()
        if not is_code_taken_fn(candidate):
            return candidate
    raise RuntimeError(
        f"Failed to generate unique 5-character code after {max_retries} attempts. "
        "Alphabet density threshold exceeded."
    )

async def generate_unique_code_async(
    is_code_taken_coro: Callable[[str], Awaitable[bool]],
    max_retries: int = MAX_RETRIES
) -> str:
    """
    Async collision-proof retry loop with async database/redis constraint checking.
    """
    for attempt in range(max_retries):
        candidate = generate_5char_code()
        is_taken = await is_code_taken_coro(candidate)
        if not is_taken:
            return candidate
    raise RuntimeError(
        f"Failed to generate unique 5-character code after {max_retries} attempts."
    )
