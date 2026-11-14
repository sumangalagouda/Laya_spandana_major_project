"""
Meaningful Sollukattu Phrase-Level Repetition Detection Module
Identifies complete repeating rhythmic phrases, couplets, and avartanams,
suppresses sub-phrase nested fragments (maximal-pattern selection),
counts non-overlapping occurrences, and orders patterns chronologically.
"""

from typing import Any, Dict, List, Optional, Set, Tuple


def format_timestamp(seconds: float) -> str:
    """Formats seconds as MM:SS."""
    if seconds is None or seconds < 0:
        return "00:00"
    m = int(seconds // 60)
    s = int(seconds % 60)
    return f"{m:02d}:{s:02d}"


def normalize_text(text: str) -> str:
    """Normalizes syllable text for approximate comparison while preserving phrase semantics."""
    if not text:
        return ""
    t = text.lower().strip()
    replacements = [
        ("tattai", "tat tai"),
        ("tattam", "tat tam"),
        ("dittam", "dit tam"),
        ("dittai", "dit tai"),
        ("thaka", "takka"),
        ("taka", "takka"),
        ("thakita", "takita"),
        ("tha", "ta"),
        ("tei", "tai"),
        ("thei", "tai"),
        ("dhim", "tom"),
        ("thom", "tom"),
        ("jum", "tom"),
    ]
    for old, new in replacements:
        t = t.replace(old, new)
    return " ".join(t.split())


def get_primitive_period(block: List[str]) -> List[str]:
    """
    Reduces an artificial composite repetition (e.g. A B A B) to its true fundamental primitive phrase (A B).
    """
    n = len(block)
    for p_len in range(1, n // 2 + 1):
        if n % p_len == 0:
            p = block[:p_len]
            k = n // p_len
            if [normalize_text(l) for l in block] == [normalize_text(l) for l in p * k]:
                return p
    return block


def align_couplet_orientation(block: List[str]) -> List[str]:
    """
    Aligns standard Bharatanatyam couplets to begin on the opening call and conclude on the cadential stroke.
    e.g. ['Tat Tai Kidadi Tam', 'Dit Tam Tai'] -> ['Dit Tam Tai', 'Tat Tai Kidadi Tam']
    """
    if len(block) == 2:
        l0 = block[0].strip().lower()
        l1 = block[1].strip().lower()
        # If line 0 is a terminal cadential stroke ('kidadi tam') and line 1 is an opening call ('tai')
        if "kidadi tam" in l0 and "kidadi tam" not in l1:
            return [block[1], block[0]]
    return block


def detect_repeating_patterns(
    transcription_items: List[Dict[str, Any]],
    transcription_lines: Optional[List[str]] = None,
    line_metadata: Optional[List[Dict[str, Any]]] = None,
    min_phrase_len: int = 2,
    min_repetitions: int = 2,
) -> List[Dict[str, Any]]:
    """
    Detects complete meaningful repeating Sollukattu rhythmic phrases.
    Applies maximal-pattern selection to suppress isolated sub-fragments (e.g., 'Tai Thom',
    'Dit Tam', 'Tat Tai') while preserving complete multi-line phrases and distinct short phrases.

    Args:
        transcription_items: List of syllable dicts.
        transcription_lines: List of segmented rhythmic phrase lines.
        line_metadata: Metadata for each phrase line with start_time, end_time, and syllables.
        min_phrase_len: Minimum word count for a single-line phrase (default 2).
        min_repetitions: Minimum occurrences to be classified as a repetition (default 2).

    Returns:
        Chronologically ordered list of complete repeating phrases with occurrences and timestamps.
    """
    # -------------------------------------------------------------
    # Case A: Phrase-level repetition from structured lines
    # -------------------------------------------------------------
    if transcription_lines and line_metadata and len(transcription_lines) >= 2:
        clean_lines = [l.strip() for l in transcription_lines if l.strip()]
        num_lines = len(clean_lines)
        candidate_map: Dict[str, Dict[str, Any]] = {}
        seen_keys: Set[str] = set()

        # 1. Consecutive identical single lines (e.g. Takka Takita x2, Tattai Tattam Kidadi x3, Didi Tai x4)
        i = 0
        while i < num_lines:
            line = clean_lines[i]
            all_sylls = [s for s in line.split() if s and s != "|"]
            if len(all_sylls) >= min_phrase_len and len(set(normalize_text(s) for s in all_sylls)) >= 2:
                streak = 1
                while i + streak < num_lines and normalize_text(clean_lines[i + streak]) == normalize_text(line):
                    streak += 1

                if streak >= min_repetitions:
                    block_key = f"{normalize_text(line)}__streak_{i}"
                    occs: List[Dict[str, Any]] = []
                    for s_idx in range(streak):
                        line_idx = i + s_idx
                        start_t = float(line_metadata[line_idx].get("start_time", 0.0))
                        end_t = float(line_metadata[line_idx].get("end_time", 0.0))
                        occs.append(
                            {
                                "repetition_number": s_idx + 1,
                                "start_time": round(start_t, 2),
                                "end_time": round(end_t, 2),
                                "start_formatted": format_timestamp(start_t),
                                "end_formatted": format_timestamp(end_t),
                                "duration": round(max(0.0, end_t - start_t), 2),
                                "line_start": line_idx,
                                "line_end": line_idx,
                                "line_indices": {line_idx},
                                "is_exact": True,
                            }
                        )
                    candidate_map[block_key] = {
                        "pattern": [line],
                        "pattern_text": line,
                        "count": streak,
                        "line_count": 1,
                        "syllable_count": len(all_sylls),
                        "coverage": streak,
                        "first_seen": occs[0]["start_time"],
                        "first_seen_formatted": occs[0]["start_formatted"],
                        "is_exact": True,
                        "match_type": "exact",
                        "occurrences": occs,
                        "is_consecutive_single": True,
                    }
                    seen_keys.add(normalize_text(line))
                    i += streak
                    continue
            i += 1

        # 2. Multi-line blocks (4-line stanzas and 2-line couplets)
        for block_size in [4, 2]:
            for b_idx in range(num_lines - block_size + 1):
                raw_block = clean_lines[b_idx : b_idx + block_size]
                prim_block = get_primitive_period(raw_block)
                prim_block = align_couplet_orientation(prim_block)
                p_len = len(prim_block)

                if p_len < 2:
                    continue

                all_sylls = [s for l in prim_block for s in l.split() if s and s != "|"]
                block_key = "\n".join(normalize_text(l) for l in prim_block)
                if block_key in seen_keys:
                    continue
                seen_keys.add(block_key)

                # Suppress circular phase shift
                circ_key = "\n".join(normalize_text(l) for l in (prim_block[1:] + prim_block[:1]))
                seen_keys.add(circ_key)

                occs = []
                j = 0
                while j <= num_lines - p_len:
                    curr = clean_lines[j : j + p_len]
                    exact_match = ([l.lower().strip() for l in curr] == [l.lower().strip() for l in prim_block])
                    approx_match = False
                    if not exact_match:
                        exact_norm = [normalize_text(l) for l in prim_block]
                        curr_norm = [normalize_text(l) for l in curr]
                        approx_match = (exact_norm == curr_norm)

                    if exact_match or approx_match:
                        start_t = float(line_metadata[j].get("start_time", 0.0))
                        end_t = float(line_metadata[j + p_len - 1].get("end_time", 0.0))
                        occs.append(
                            {
                                "repetition_number": len(occs) + 1,
                                "start_time": round(start_t, 2),
                                "end_time": round(end_t, 2),
                                "start_formatted": format_timestamp(start_t),
                                "end_formatted": format_timestamp(end_t),
                                "duration": round(max(0.0, end_t - start_t), 2),
                                "line_start": j,
                                "line_end": j + p_len - 1,
                                "line_indices": set(range(j, j + p_len)),
                                "is_exact": exact_match,
                            }
                        )
                        j += p_len  # Non-overlapping forward step
                    else:
                        j += 1

                if len(occs) >= min_repetitions:
                    is_all_exact = all(o.get("is_exact", True) for o in occs)
                    candidate_map[block_key] = {
                        "pattern": prim_block,
                        "pattern_text": "\n".join(prim_block),
                        "count": len(occs),
                        "line_count": p_len,
                        "syllable_count": len(all_sylls),
                        "coverage": p_len * len(occs),
                        "first_seen": occs[0]["start_time"],
                        "first_seen_formatted": occs[0]["start_formatted"],
                        "is_exact": is_all_exact,
                        "match_type": "exact" if is_all_exact else "approximate",
                        "occurrences": occs,
                        "is_consecutive_single": False,
                    }

        raw_candidates = list(candidate_map.values())
        if not raw_candidates:
            return []

        # Candidate Priority:
        # Prioritize consecutive intentional single-line repetitions (Avritti) and high-coverage couplets/stanzas
        def candidate_priority(c: Dict[str, Any]) -> Tuple[int, int, int]:
            is_streak = c.get("is_consecutive_single", False)
            is_multiline = c["line_count"] > 1
            if is_streak:
                return (4, c["coverage"], c["count"])
            elif is_multiline and c["coverage"] >= 6:
                return (3, c["coverage"], c["count"])
            elif is_multiline:
                return (2, c["coverage"], c["count"])
            else:
                return (1, c["coverage"], c["count"])

        raw_candidates.sort(key=candidate_priority, reverse=True)

        final_patterns: List[Dict[str, Any]] = []
        covered_line_indices: Set[int] = set()

        for cand in raw_candidates:
            cand_occs = cand["occurrences"]
            # Disjoint check: occurrences must not intersect already covered lines
            independent_occs = [occ for occ in cand_occs if not (occ["line_indices"] & covered_line_indices)]

            if len(independent_occs) >= min_repetitions:
                for r_idx, occ in enumerate(independent_occs):
                    occ["repetition_number"] = r_idx + 1

                cand["count"] = len(independent_occs)
                cand["occurrences"] = independent_occs
                cand["first_seen"] = independent_occs[0]["start_time"]
                cand["first_seen_formatted"] = independent_occs[0]["start_formatted"]

                for occ in independent_occs:
                    covered_line_indices.update(occ["line_indices"])

                final_patterns.append(cand)

        # Chronological Sequencing (Requirement E)
        final_patterns.sort(key=lambda p: p["first_seen"])

        for idx, pat in enumerate(final_patterns):
            pat["id"] = f"pattern-{idx + 1}"
            pat["label"] = f"Pattern {idx + 1}"
            for occ in pat.get("occurrences", []):
                if "line_indices" in occ:
                    occ["line_indices"] = sorted(list(occ["line_indices"]))

        return final_patterns

    # -------------------------------------------------------------
    # Case B: Token-level repetition when raw syllable items are passed
    # -------------------------------------------------------------
    if not transcription_items or len(transcription_items) < 2:
        return []

    tokens = [item.get("syllable", "") for item in transcription_items]
    num_tokens = len(tokens)
    token_cands: Dict[str, Dict[str, Any]] = {}
    seen_token_keys: Set[str] = set()

    max_n = min(12, num_tokens // 2)
    for n in range(max_n, min_phrase_len - 1, -1):
        for i in range(num_tokens - n + 1):
            raw_ngram = tokens[i : i + n]
            # Avoid single repeated syllable phrases (e.g. 'Ta Ta Ta')
            if len(set(normalize_text(s) for s in raw_ngram)) < 2:
                continue

            prim_ngram = get_primitive_period(raw_ngram)
            p_len = len(prim_ngram)
            if p_len < min_phrase_len:
                continue

            key = " ".join(normalize_text(s) for s in prim_ngram)
            if key in seen_token_keys:
                continue
            seen_token_keys.add(key)

            occs: List[Dict[str, Any]] = []
            j = 0
            while j <= num_tokens - p_len:
                curr = tokens[j : j + p_len]
                exact_m = [s.lower().strip() for s in curr] == [s.lower().strip() for s in prim_ngram]
                norm_m = [normalize_text(s) for s in curr] == [normalize_text(s) for s in prim_ngram]

                if exact_m or norm_m:
                    start_t = float(transcription_items[j].get("start_time", 0.0))
                    end_t = float(transcription_items[j + p_len - 1].get("end_time", 0.0))
                    occs.append(
                        {
                            "repetition_number": len(occs) + 1,
                            "start_time": round(start_t, 2),
                            "end_time": round(end_t, 2),
                            "start_formatted": format_timestamp(start_t),
                            "end_formatted": format_timestamp(end_t),
                            "duration": round(max(0.0, end_t - start_t), 2),
                            "token_indices": set(range(j, j + p_len)),
                            "is_exact": exact_m,
                        }
                    )
                    j += p_len  # Non-overlapping greedy jump
                else:
                    j += 1

            if len(occs) >= min_repetitions:
                is_all_exact = all(o.get("is_exact", True) for o in occs)
                phrase_str = " ".join(prim_ngram)
                token_cands[key] = {
                    "pattern": [phrase_str],
                    "pattern_text": phrase_str,
                    "count": len(occs),
                    "line_count": 1,
                    "syllable_count": p_len,
                    "coverage": p_len * len(occs),
                    "first_seen": occs[0]["start_time"],
                    "first_seen_formatted": occs[0]["start_formatted"],
                    "is_exact": is_all_exact,
                    "match_type": "exact" if is_all_exact else "approximate",
                    "occurrences": occs,
                }

    raw_token_cands = list(token_cands.values())
    raw_token_cands.sort(key=lambda c: (c["coverage"], c["count"], c["syllable_count"]), reverse=True)

    final_token_patterns: List[Dict[str, Any]] = []
    covered_tokens: Set[int] = set()

    for cand in raw_token_cands:
        cand_occs = cand["occurrences"]
        independent_occs = [occ for occ in cand_occs if not (occ["token_indices"] & covered_tokens)]
        if len(independent_occs) >= min_repetitions:
            for r_idx, occ in enumerate(independent_occs):
                occ["repetition_number"] = r_idx + 1

            cand["count"] = len(independent_occs)
            cand["occurrences"] = independent_occs
            cand["first_seen"] = independent_occs[0]["start_time"]
            cand["first_seen_formatted"] = independent_occs[0]["start_formatted"]

            for occ in independent_occs:
                covered_tokens.update(occ["token_indices"])

            final_token_patterns.append(cand)

    final_token_patterns.sort(key=lambda p: p["first_seen"])
    for idx, pat in enumerate(final_token_patterns):
        pat["id"] = f"pattern-{idx + 1}"
        pat["label"] = f"Pattern {idx + 1}"
        for occ in pat.get("occurrences", []):
            if "token_indices" in occ:
                occ["token_indices"] = sorted(list(occ["token_indices"]))

    return final_token_patterns
