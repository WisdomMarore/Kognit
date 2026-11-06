import json
import time
from google import genai
from google.genai import types
from django.conf import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)

FLASHCARD_SCHEMA = types.Schema(
    type=types.Type.OBJECT,
    properties={
        "flashcards": types.Schema(
            type=types.Type.ARRAY,
            items=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "front": types.Schema(type=types.Type.STRING),
                    "back": types.Schema(type=types.Type.STRING),
                },
                required=["front", "back"],
            ),
        )
    },
    required=["flashcards"],
)

MC_SCHEMA = types.Schema(
    type=types.Type.OBJECT,
    properties={
        "questions": types.Schema(
            type=types.Type.ARRAY,
            items=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "index": types.Schema(type=types.Type.INTEGER),
                    "distractors": types.Schema(
                        type=types.Type.ARRAY,
                        items=types.Schema(type=types.Type.STRING),
                    ),
                },
                required=["index", "distractors"],
            ),
        )
    },
    required=["questions"],
)


def generate_distractors(cards):
    """cards: list of {'index': int, 'front': str, 'back': str}.
    Returns a dict mapping index -> list of 3 wrong-but-plausible answers."""
    cards_text = "\n".join(f"{c['index']}. Q: {c['front']} A: {c['back']}" for c in cards)
    prompt = (
        "For each numbered question below, generate exactly 3 incorrect but plausible answer "
        "options (distractors) — wrong answers on the same topic that someone could reasonably "
        "mistake for correct, but are clearly wrong given the actual question. Match the length "
        "and style of the correct answer. Never repeat the correct answer as a distractor.\n\n"
        + cards_text
    )

    for attempt in range(2):
        try:
            response = client.models.generate_content(
                model="gemini-3.1-flash-lite",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=MC_SCHEMA,
                ),
            )
            data = json.loads(response.text)
            return {q["index"]: q.get("distractors", [])[:3] for q in data.get("questions", [])}
        except Exception:
            if attempt == 0:
                time.sleep(3)
                continue
            raise

PROMPT = (
    "Create up to {max_cards} high-quality spaced-repetition flashcards from this "
    "material. Each card should test one discrete fact or concept. Keep answers concise. "
    "If the material contains mathematical notation, write it out in plain text "
    "(e.g. 'x^2', 'sqrt(x)', '(a+b)/c') rather than trying to use special symbols."
)

CHUNK_SIZE = 8000       # characters per chunk sent to Gemini
MAX_CHUNKS = 6          # hard cap — keeps cost/time/rate-limits predictable
CARDS_PER_CHUNK = 15


def _generate(contents, max_cards):
    for attempt in range(2):
        try:
            response = client.models.generate_content(
                model="gemini-3.1-flash-lite",
                contents=contents,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=FLASHCARD_SCHEMA,
                ),
            )
            data = json.loads(response.text)
            return data.get("flashcards", [])
        except Exception:
            if attempt == 0:
                time.sleep(3)
                continue
            raise


def _split_into_chunks(text, chunk_size):
    """Splits on paragraph breaks where possible, so we don't cut a sentence
    in half mid-chunk. Falls back to a hard cut if a single paragraph is huge."""
    paragraphs = text.split("\n\n")
    chunks = []
    current = ""
    for para in paragraphs:
        if len(current) + len(para) + 2 <= chunk_size:
            current += para + "\n\n"
        else:
            if current:
                chunks.append(current)
            current = para[:chunk_size] + "\n\n" if len(para) > chunk_size else para + "\n\n"
    if current:
        chunks.append(current)
    return chunks[:MAX_CHUNKS]


def generate_flashcards_from_text(text, max_cards=None):
    """Sends notes to Gemini, chunking long text so nothing gets silently
    truncated. Returns a combined list of {front, back} dicts."""
    chunks = _split_into_chunks(text.strip(), CHUNK_SIZE)
    all_flashcards = []
    for chunk in chunks:
        prompt = PROMPT.format(max_cards=CARDS_PER_CHUNK) + f"\n\nNotes:\n{chunk}"
        all_flashcards.extend(_generate(prompt, CARDS_PER_CHUNK))
    return all_flashcards


def generate_flashcards_from_image(image_bytes, mime_type, max_cards=20):
    """Sends a photo (notes, textbook page, whiteboard) to Gemini, returns {front, back} dicts."""
    image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
    prompt = PROMPT.format(max_cards=max_cards)
    return _generate([image_part, prompt], max_cards)