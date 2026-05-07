"""
Transcription de KaraviaComprehension.wav avec Whisper.
Modèle : medium (bon compromis qualité/vitesse pour le français)
Output : transcription-karavia.txt avec timestamps
"""
import whisper
import numpy as np
import wave
import os

# Ajouter ffmpeg au PATH au cas où Whisper en a besoin
ffmpeg_dir = r"C:\Users\karim\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.0.1-full_build\bin"
os.environ["PATH"] = ffmpeg_dir + ";" + os.environ.get("PATH", "")

print("Chargement du modèle Whisper 'medium'...")
model = whisper.load_model("medium")

# Charger le WAV manuellement (déjà en 16kHz mono PCM16)
print("Chargement du fichier audio WAV...")
with wave.open("KaraviaComprehension.wav", "rb") as wf:
    frames = wf.readframes(wf.getnframes())
    audio = np.frombuffer(frames, dtype=np.int16).astype(np.float32) / 32768.0

print(f"Audio chargé : {len(audio)/16000/60:.1f} minutes")
print("Transcription en cours (1h26 d'audio, cela peut prendre 20-40 min sur CPU)...")

result = model.transcribe(
    audio,
    language="fr",
    verbose=True,
)

# Sauvegarder avec timestamps
with open("transcription-karavia.txt", "w", encoding="utf-8") as f:
    f.write("=== TRANSCRIPTION REUNION KARAVIA - 9 mars 2026 ===\n")
    f.write(f"Durée audio : ~1h26\n")
    f.write(f"Modèle : whisper medium\n")
    f.write(f"Langue : français\n\n")

    for seg in result["segments"]:
        start = seg["start"]
        end = seg["end"]
        text = seg["text"].strip()

        start_m, start_s = divmod(int(start), 60)
        end_m, end_s = divmod(int(end), 60)

        f.write(f"[{start_m:02d}:{start_s:02d} - {end_m:02d}:{end_s:02d}] {text}\n")

print("\nTranscription sauvegardée dans transcription-karavia.txt")
print(f"Nombre de segments : {len(result['segments'])}")
