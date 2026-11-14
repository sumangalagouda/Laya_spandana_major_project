"""
Centralized Predefined Bharatanatyam Sollukattu Sections Data
Contains the canonical Sollukattu sections, descriptions, and repetition counts
for Tishra (11 sections), Chatusra (12 sections), and Kandam (12 sections).
"""

from typing import Any, Dict, List, Optional

TALA_SECTIONS_DATA: Dict[str, Dict[str, Any]] = {
    "tishra": {
        "key": "tishra",
        "name": "Tishra",
        "beats": 3,
        "description": "Tishra Nadai uses three subdivisions per beat creating a flowing meditative rhythm. Rooted in ancient Natya Shastra, it is the most devotional of the three Alaripu nadais.",
        "section_count": 11,
        "sections": [
            {
                "section_number": 1,
                "title": "Section 1",
                "text": "Ta tai tai\nTa tam \nKita taka \nTa tai tai talangu juma taka tarigin taam",
                "repetition": 1,
            },
            {
                "section_number": 2,
                "title": "Section 2",
                "text": "Dit tam Kita taka tai \nTa tai Kita taka taam",
                "repetition": 2,
            },
            {
                "section_number": 3,
                "title": "Section 3",
                "text": "Dit taam tai\ntatai taam",
                "repetition": 4,
            },
            {
                "section_number": 4,
                "title": "Section 4",
                "text": "Ta tai taam didam tai(8)\nTa tai ",
                "repetition": 8,
            },
            {
                "section_number": 5,
                "title": "Section 5",
                "text": "Dit tai dit tai",
                "repetition": 4,
            },
            {
                "section_number": 6,
                "title": "Section 6",
                "text": "Dit tai Dit tai Dit tai",
                "repetition": 3,
            },
            {
                "section_number": 7,
                "title": "Section 7",
                "text": "Tai tai dit tai taam",
                "repetition": 2,
            },
            {
                "section_number": 8,
                "title": "Section 8",
                "text": "Tai dit tai tai",
                "repetition": 2,
            },
            {
                "section_number": 9,
                "title": "Section 9",
                "text": "Ta tai tai \nTa tam kita taku",
                "repetition": 1,
            },
            {
                "section_number": 10,
                "title": "Section 10",
                "text": "dit digutaka digutaka digutaka",
                "repetition": 3,
            },
            {
                "section_number": 11,
                "title": "Section 11",
                "text": "Telangu jun \nTarigino ta tai tai\nTa tam kita taka\nTa tai tai \nTam kita taka tam",
                "repetition": 1,
            },
        ],
    },
    "chatusra": {
        "key": "chatusra",
        "name": "Chatusra",
        "beats": 4,
        "description": "Chatusra Nadai is the most fundamental rhythm in Bharatanatyam with four equal subdivisions per beat. It forms the backbone of most classical compositions.",
        "section_count": 12,
        "sections": [
            {
                "section_number": 1,
                "title": "Section 1",
                "text": "Ta tai tayum\nTa ka  taam kita taka\nTa tai tayum talangu taka digutaka  tarigino tom tam ",
                "repetition": 1,
            },
            {
                "section_number": 2,
                "title": "Section 2",
                "text": "Tadit tam dit tam  dit tai \nTa ki ta ta ka tam",
                "repetition": 2,
            },
            {
                "section_number": 3,
                "title": "Section 3",
                "text": "Ta ki ta ta ka tam \nDit tam dit tai",
                "repetition": 3,
            },
            {
                "section_number": 4,
                "title": "Section 4",
                "text": "Ta ki ta ta ka tam dit taa tai\nTarigita taka tai dit tatai\nTarigita taka tam dit taak tai\nTarigita taka tai dit tatai (3)",
                "repetition": 1,
            },
            {
                "section_number": 5,
                "title": "Section 5",
                "text": "Tarigin taka dit tai dit tai (4)\nTarigin taka",
                "repetition": 1,
            },
            {
                "section_number": 6,
                "title": "Section 6",
                "text": "Dit tai dit tai dit tai dit tai",
                "repetition": 2,
            },
            {
                "section_number": 7,
                "title": "Section 7",
                "text": "Tai tai dit tai taam",
                "repetition": 2,
            },
            {
                "section_number": 8,
                "title": "Section 8",
                "text": "Tai ya tai hi",
                "repetition": 2,
            },
            {
                "section_number": 9,
                "title": "Section 9",
                "text": "Tai dit tai (2)\nTai tai dit tai ",
                "repetition": 1,
            },
            {
                "section_number": 10,
                "title": "Section 10",
                "text": "Ta tai tayum \nTaka taam kita taka ",
                "repetition": 1,
            },
            {
                "section_number": 11,
                "title": "Section 11",
                "text": "Dit digutaka digutaka digutaka (4)\nTalangu takadigu taka tarigino tom ",
                "repetition": 1,
            },
            {
                "section_number": 12,
                "title": "Section 12",
                "text": "Ta tai tayum\nTaak ka taam kita tak tam(2)",
                "repetition": 1,
            },
        ],
    },
    "kandam": {
        "key": "kandam",
        "name": "Kandam",
        "beats": 5,
        "description": "Kandam Nadai uses five subdivisions creating a syncopated dynamic rhythm. The word Khanda means broken in Sanskrit reflecting the irregular powerful feel.",
        "section_count": 12,
        "sections": [
            {
                "section_number": 1,
                "title": "Section 1",
                "text": "Takka Takita (2)",
                "repetition": 2,
            },
            {
                "section_number": 2,
                "title": "Section 2",
                "text": "Taa tai tak taam kita taka \nDit tai Tak tam kita taka \nTa tai Tat tam kita taka \nTalangu tarigino tom \nTam",
                "repetition": 1,
            },
            {
                "section_number": 3,
                "title": "Section 3",
                "text": " Dit tam kita taka tai \nTa tai kita taka tam",
                "repetition": 2,
            },
            {
                "section_number": 4,
                "title": "Section 4",
                "text": " Dit tam kita taka tai \n Ta tai kita taka tam",
                "repetition": 4,
            },
            {
                "section_number": 5,
                "title": "Section 5",
                "text": "Ta tai kita tam dita tam tai",
                "repetition": 8,
            },
            {
                "section_number": 6,
                "title": "Section 6",
                "text": "Ta tai kita tam \n Dit tai (4)",
                "repetition": 1,
            },
            {
                "section_number": 7,
                "title": "Section 7",
                "text": "Dit tai dit tai dit tai dit tai dit tai",
                "repetition": 2,
            },
            {
                "section_number": 8,
                "title": "Section 8",
                "text": " Tadim tarikita taka \nTakadim tarikita taka\nTarikita jum\nTaka takadigu tarikita jum \nTaka digu taka tarikita jum ",
                "repetition": 1,
            },
            {
                "section_number": 9,
                "title": "Section 9",
                "text": "Ta tai tat tam takita tatai \nTat tam ",
                "repetition": 1,
            },
            {
                "section_number": 10,
                "title": "Section 10",
                "text": "Dit taka digutaka taka",
                "repetition": 3,
            },
            {
                "section_number": 11,
                "title": "Section 11",
                "text": "talangu tarigin tom ta tai ta tam kita taka tai tam",
                "repetition": 1,
            },
            {
                "section_number": 12,
                "title": "Section 12",
                "text": "Ta tai tatam kita taka \nTa tai tatam kita taka tam",
                "repetition": 1,
            },
        ],
    },
}


def get_tala_predefined_data(tala_name: Optional[str]) -> Optional[Dict[str, Any]]:
    """
    Retrieve centralized predefined Sollukattu sections and description for a given Tala.
    Returns None if the Tala is not recognized or not detected.
    """
    if not tala_name:
        return None
    key = str(tala_name).strip().lower()
    if key in ("khanda", "khandam"):
        key = "kandam"
    elif key in ("tisra", "tishram"):
        key = "tishra"
    elif key in ("chatusram", "chaturasra"):
        key = "chatusra"

    return TALA_SECTIONS_DATA.get(key)

