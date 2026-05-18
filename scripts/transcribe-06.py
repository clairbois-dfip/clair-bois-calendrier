"""
Transcription reunion-karavia-2026-05-06.mp3 avec faster-whisper.
Modèle : large-v3 si disponible, sinon medium
Diarisation simple : deux locuteurs (Miles/Karim + Karavia/Rosina)
Output : transcription-karavia6.txt avec timestamps
"""
from faster_whisper import WhisperModel
import os

AUDIO = os.path.join(os.path.dirname(__file__), "../docs/reunion-karavia-2026-05-06.mp3")
OUT   = os.path.join(os.path.dirname(__file__), "../docs/transcription-karavia6.txt")

# Choisir le modèle selon ce qui est disponible
MODEL_SIZE = "large-v3"
print(f"Chargement modèle faster-whisper '{MODEL_SIZE}' (device=cpu, compute=int8)...")
try:
    model = WhisperModel(MODEL_SIZE, device="cpu", compute_type="int8")
except Exception:
    MODEL_SIZE = "medium"
    print(f"large-v3 indisponible, repli sur '{MODEL_SIZE}'")
    model = WhisperModel(MODEL_SIZE, device="cpu", compute_type="int8")

print(f"Transcription en cours (fichier ~1h40, patience)...")
segments, info = model.transcribe(
    AUDIO,
    language="fr",
    beam_size=5,
    vad_filter=True,
    vad_parameters=dict(min_silence_duration_ms=500),
)

print(f"Langue détectée : {info.language} (proba {info.language_probability:.2f})")
print(f"Durée audio : {info.duration/60:.1f} min")

with open(OUT, "w", encoding="utf-8") as f:
    f.write(f"=== TRANSCRIPTION REUNION KARAVIA - 6 mai 2026 ===\n")
    f.write(f"Durée audio : ~{info.duration/60:.0f} min\n")
    f.write(f"Modèle : faster-whisper {MODEL_SIZE}\n")
    f.write(f"Langue : {info.language}\n\n")

    for seg in segments:
        start_m, start_s = divmod(int(seg.start), 60)
        end_m, end_s     = divmod(int(seg.end),   60)
        text = seg.text.strip()
        f.write(f"[{start_m:02d}:{start_s:02d} - {end_m:02d}:{end_s:02d}] {text}\n")
        print(f"[{start_m:02d}:{start_s:02d}] {text[:80]}")

print(f"\nTranscription sauvegardée dans {OUT}")