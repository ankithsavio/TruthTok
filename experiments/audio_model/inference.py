from faster_whisper import WhisperModel

def inference():

    model_size = 'large-v2'

    model = WhisperModel(model_size, device="cuda", compute_type="float16")

    segments, info = model.transcribe("audio.mp3", beam_size=5)

    print("Detected language '%s' with probability %f" % (info.language, info.language_probability))

    for segment in segments:
        print("[%.2fs -> %.2fs] %s" % (segment.start, segment.end, segment.text))


if __name__ == "__main__":
    inference()