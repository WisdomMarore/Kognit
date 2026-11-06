"""
Classic SuperMemo SM-2 algorithm, implemented as a pure function.

No Django imports here on purpose — this file has zero dependencies,
so it's easy to test in isolation and reuse elsewhere unchanged.

--- Rating -> SM-2 "quality" mapping ---
The original SM-2 takes a quality score q from 0-5. Our UI only has four
buttons (Again/Hard/Good/Easy), so we map them onto that scale:

    Again -> 0   (complete blackout)
    Hard  -> 3   (recalled, but with serious difficulty)
    Good  -> 4   (recalled after some hesitation)
    Easy  -> 5   (perfect recall)

Anything below q=3 counts as a "fail": repetitions resets and the
card is shown again starting tomorrow.
"""
from dataclasses import dataclass

AGAIN, HARD, GOOD, EASY = 0, 1, 2, 3

_RATING_TO_QUALITY = {
    AGAIN: 0,
    HARD: 3,
    GOOD: 4,
    EASY: 5,
}

MIN_EASE_FACTOR = 1.3


@dataclass
class SM2State:
    ease_factor: float
    interval_days: int
    repetitions: int


def review_card(rating: int, state: SM2State) -> SM2State:
    """Given a rating and the card's current SM-2 state, return the new
    state. Doesn't touch dates — the caller adds interval_days to today's
    date to get next_review_date."""
    if rating not in _RATING_TO_QUALITY:
        raise ValueError(f"Invalid rating: {rating}")

    q = _RATING_TO_QUALITY[rating]

    # EF is updated every review, pass or fail, per the SM-2 spec.
    new_ef = state.ease_factor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    new_ef = max(MIN_EASE_FACTOR, new_ef)

    if q < 3:
        # Failed recall: start the interval sequence over.
        return SM2State(ease_factor=new_ef, interval_days=1, repetitions=0)

    # Successful recall.
    new_repetitions = state.repetitions + 1
    if new_repetitions == 1:
        new_interval = 1
    elif new_repetitions == 2:
        new_interval = 6
    else:
        new_interval = round(state.interval_days * new_ef)

    return SM2State(ease_factor=new_ef, interval_days=new_interval, repetitions=new_repetitions)