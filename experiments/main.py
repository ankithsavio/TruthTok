from language_model.inference import LlamaModel
from video_model.inference import CustomVideoLLaMA2
from audio_model.inference import CustomWhisper


def main():
    # video_dir = "experiments/data/videos/sample_video.mp4"
    video_dir = "experiments/data/videos/M3_MacBook_Pro_Review_-_Space_Black.mp4"
    language_model = LlamaModel()
    video_model = CustomVideoLLaMA2(video_dir=video_dir, segment_time=15)
    audio_model = CustomWhisper(video_dir=video_dir)

    video_content = video_model.forward()
    audio_content = audio_model.forward()

    summary = language_model.summarize_video(video_content, audio_content)

    print(summary)


if __name__ == "__main__":
    main()
