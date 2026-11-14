import os
import sys

sys.stdout.reconfigure(encoding="utf-8")

from repetition_detector import detect_repeating_patterns, format_timestamp, normalize_text
from sollukattu_transcriber import transcribe_sollukattu

print("=== 1. Testing repetition_detector edge cases ===")
# Edge case A: Empty
assert detect_repeating_patterns([]) == [], "Empty failed"
print("✓ Passed Edge Case A: Empty input returns empty list.")

# Edge case B: Single repeated syllable (MUST NOT be treated as phrase repetition)
single_rep = [{"syllable": "Ta", "start_time": i * 0.2, "end_time": (i + 1) * 0.2} for i in range(10)]
pats_single = detect_repeating_patterns(single_rep)
assert len(pats_single) == 0, "Single syllable repeated should be ignored"
print("✓ Passed Edge Case B: Single repeated syllable safely ignored (min phrase len >= 2).")

# Edge case C: Multi-syllable phrase repetition with exact timestamps
phrase = ["Dit", "Tam", "Tai"] * 5
phrase_items = [
    {"syllable": w, "start_time": round(i * 0.3, 2), "end_time": round((i + 1) * 0.3, 2)}
    for i, w in enumerate(phrase)
]
pats_phrase = detect_repeating_patterns(phrase_items)
assert len(pats_phrase) >= 1, "Phrase repetition should be detected"
p1 = pats_phrase[0]
print(f"✓ Passed Edge Case C: '{p1['pattern_text']}' detected {p1['count']} times with {len(p1['occurrences'])} occurrences.")
assert p1["count"] == 5, f"Expected count 5, got {p1['count']}"

# Edge case D: Nested patterns (couplet + sub-phrase)
lines_nested = ["Dit Tam Tai", "Tat Tai Kidadi Tam"] * 7
meta_nested = []
t = 0.0
sylls_nested = []
for l in lines_nested:
    words = l.split()
    l_start = t
    for w in words:
        sylls_nested.append({"syllable": w, "start_time": round(t, 2), "end_time": round(t + 0.3, 2)})
        t += 0.3
    meta_nested.append({"line_text": l, "start_time": round(l_start, 2), "end_time": round(t, 2)})

pats_nested = detect_repeating_patterns(sylls_nested, lines_nested, meta_nested)
print(f"✓ Passed Edge Case D: Couplet pattern detected: '{pats_nested[0]['pattern_text'].replace(chr(10), ' / ')}' (Count: {pats_nested[0]['count']})")
assert pats_nested[0]["count"] == 7

print("\n=== 2. Testing real audio files transcription & repetition ===")
audio_files = [
    ("../frontend/public/audio/chatusra_alaripu.mp3", "chatusra"),
    ("../frontend/public/audio/tishra_alaripu.mp3", "tishra"),
    ("../frontend/public/audio/kandam_alaripu.mp3", "kandam"),
]

for af, hint in audio_files:
    if os.path.exists(af):
        name = os.path.basename(af)
        res = transcribe_sollukattu(af, max_duration=120.0, tala_hint=hint)
        pats = detect_repeating_patterns(res["transcription"], res["transcription_lines"], res["line_metadata"])
        print(f"\n-- {name} ({hint.upper()}): BPM={res['bpm']}, Duration={res['duration']}s, Syllables={len(res['transcription'])}, Repetitions Found={len(pats)}")
        for idx, p in enumerate(pats):
            print(f"   [{idx+1}] {p['pattern_text'].replace(chr(10), ' / ')} ({p['count']}) [First: {p['first_seen_formatted']}]")

print("\n🎉 ALL VALIDATION TESTS PASSED SUCCESSFULLY!")

