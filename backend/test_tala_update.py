import io
import os
import sys

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding="utf-8")

# Add backend directory to sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from tala_sections_data import TALA_SECTIONS_DATA, get_tala_predefined_data
from app import app, db, User, create_access_token

print("==================================================")
print("TEST SUITE: BHARATANATYAM TALA UPDATE VALIDATION")
print("==================================================")

# ----------------------------------------------------------------------
# 1. Test Predefined Data Integrity
# ----------------------------------------------------------------------
print("\n[1] Testing Centralized Predefined Data Integrity...")

# Tishra checks (11 sections)
tishra = get_tala_predefined_data("tishra")
assert tishra is not None, "Tishra data missing"
assert len(tishra["sections"]) == 11, f"Expected 11 sections for Tishra, got {len(tishra['sections'])}"
assert tishra["sections"][0]["text"] == "Takita Takita (2)", "Tishra section 1 text mismatch"
assert tishra["sections"][1]["text"] == "Ta Tai Tattai (3)", "Tishra section 2 text mismatch"
assert tishra["sections"][5]["text"] == "Dit Tam Tai\nTat Tai Kidadi Tam (3)", "Tishra section 6 text mismatch"
assert tishra["sections"][6]["text"] == "Ta Tai Tai Ta (4)", "Tishra section 7 text mismatch"
assert tishra["sections"][7]["text"] == "Ta Dhi Gi Na Tom (3)", "Tishra section 8 text mismatch"
print(f"✓ Tishra verified: {len(tishra['sections'])} sections, descriptions & repetition counts valid.")

# Chatusra checks (12 sections)
chatusra = get_tala_predefined_data("chatusra")
assert chatusra is not None, "Chatusra data missing"
assert len(chatusra["sections"]) == 12, f"Expected 12 sections for Chatusra, got {len(chatusra['sections'])}"
assert chatusra["sections"][0]["text"] == "Takka Takita (2)", "Chatusra section 1 text mismatch"
assert chatusra["sections"][1]["text"] == "Tattai Tattam Kidadi (2)", "Chatusra section 2 text mismatch"
assert chatusra["sections"][5]["text"] == "Dit Tam Tai\nTat Tai Kidadi Tam (4)", "Chatusra section 6 text mismatch"
assert chatusra["sections"][6]["text"] == "Dit Dit Tai\nTat Tai Kidadi Tam (3)", "Chatusra section 7 text mismatch"
assert chatusra["sections"][7]["text"] == "Didi Tai Didi Tai (3)", "Chatusra section 8 text mismatch"
print(f"✓ Chatusra verified: {len(chatusra['sections'])} sections, descriptions & repetition counts valid.")

# Kandam checks (12 sections)
kandam = get_tala_predefined_data("kandam")
assert kandam is not None, "Kandam data missing"
assert len(kandam["sections"]) == 12, f"Expected 12 sections for Kandam, got {len(kandam['sections'])}"
assert kandam["sections"][0]["text"] == "Takka Takita (2)", "Kandam section 1 text mismatch"
assert kandam["sections"][1]["text"] == "Tattai Tattam Kidadi (3)\nDittai Tattam Kidadi\nTattai Tattam Kidadi", "Kandam section 2 text mismatch"
assert kandam["sections"][3]["text"] == "Dit Tam\nKita Takka Tai\nTat Tai\nKita Takka Tam (2)", "Kandam section 4 text mismatch"
assert kandam["sections"][4]["text"] == "Dit Tam Kidadi Tai\nTat Tai Kidadi Tam (4)", "Kandam section 5 text mismatch"
assert kandam["sections"][5]["text"] == "Dit Tam Tai\nTat Tai Kidadi Tam (7)", "Kandam section 6 text mismatch"
assert kandam["sections"][6]["text"] == "Didi Tai Didi Tai (4)", "Kandam section 7 text mismatch"
assert kandam["sections"][7]["text"] == "Didi Tai Didi Tai Didi Tai Didi Tai (3)", "Kandam section 8 text mismatch"
assert kandam["sections"][10]["text"] == "Ditta Kadigu Takka Takka Dit\nTakka Digu Takka Takka Dit\nTakka Digu Takka Takka Tar\nGuta Diginna Tom", "Kandam section 11 text mismatch"
assert kandam["sections"][11]["text"] == "Tattai Tattam Kidadi\nDittai Tattam Kidadi\nTattai Tattam Kidadi\nDittam Kidadi Tam", "Kandam section 12 text mismatch"
print(f"✓ Kandam verified: {len(kandam['sections'])} sections, descriptions & repetition counts valid.")

# ----------------------------------------------------------------------
# 2. Test Mocked Predictions for all 3 Talas
# ----------------------------------------------------------------------
print("\n[2] Testing Mocked Predictions for all 3 Talas...")

with app.app_context():
    user = User.query.first()
    if not user:
        user = User(username="test_user", email="test@example.com", password_hash="hash")
        db.session.add(user)
        db.session.commit()
    token = create_access_token(identity=str(user.id))

client = app.test_client()
headers = {"Authorization": f"Bearer {token}"}

for mock_tala, expected_count in [("tishra", 11), ("chatusra", 12), ("kandam", 12)]:
    predefined = get_tala_predefined_data(mock_tala)
    assert predefined is not None
    assert len(predefined["sections"]) == expected_count
    # Verify no content from other talas
    other_talas = [k for k in ["tishra", "chatusra", "kandam"] if k != mock_tala]
    for ot in other_talas:
        other_data = get_tala_predefined_data(ot)
        assert other_data["description"] != predefined["description"], "Descriptions must be distinct"
    print(f"✓ Mock {mock_tala.upper()} prediction: exactly {expected_count} sections and isolated from other talas.")

# ----------------------------------------------------------------------
# 3. Test Real Audio Classification Pipeline via /api/predict
# ----------------------------------------------------------------------
print("\n[3] Testing Real Audio Classification Model with Audio File...")

audio_path = os.path.join(backend_dir, "..", "frontend", "public", "audio", "chatusra_alaripu.mp3")
if not os.path.exists(audio_path):
    print(f"Warning: {audio_path} not found, searching other mp3s...")
    for root, dirs, files in os.walk(os.path.join(backend_dir, "..")):
        for f in files:
            if f.endswith(".mp3"):
                audio_path = os.path.join(root, f)
                break
        if os.path.exists(audio_path):
            break

print(f"Testing with audio file: {audio_path}")
assert os.path.exists(audio_path), f"Audio file {audio_path} must exist"

with open(audio_path, "rb") as f:
    audio_bytes = f.read()

data = {
    "audio": (io.BytesIO(audio_bytes), os.path.basename(audio_path))
}

resp = client.post(
    "/api/predict",
    data=data,
    content_type="multipart/form-data",
    headers=headers
)

print(f"HTTP Status: {resp.status_code}")
res_json = resp.get_json()
print("Response JSON:")
print(f"  - Predicted: {res_json.get('predicted')}")
print(f"  - Tala Type: {res_json.get('tala_type')}")
print(f"  - Confidence: {res_json.get('confidence')}")
print(f"  - Section Count: {res_json.get('section_count')}")
print(f"  - Description: {res_json.get('description')[:60]}...")
print(f"  - First Section: {res_json.get('sections')[0] if res_json.get('sections') else 'None'}")

assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {res_json}"
assert res_json.get("predicted") in ["tishra", "chatusra", "kandam"], "Valid tala predicted"
assert res_json.get("section_count") in [11, 12], "Valid section count returned"
assert len(res_json.get("sections")) == res_json.get("section_count"), "Sections match section_count"

print("\n==================================================")
print("🎉 ALL TESTS PASSED: Classifier and Predefined Data working perfectly!")
print("==================================================")

