from faster_whisper import WhisperModel


class CustomWhisper:

    def __init__(
        self,
        model_name="large-v2",
        video_dir="experiments/data/videos/sample_video.mp4",
    ):
        """
        Initialize the CustomWhisper model.

        Parameters:
        model_name (str): The name/size of the Whisper model to use.
        video_dir (str): Path to the video.
        """
        self.model = WhisperModel(model_name, device="cuda", compute_type="float16")
        self.video = video_dir

    def forward(self):
        segments, _ = self.model.transcribe(
            self.video,
            beam_size=5,
            chunk_length=30,
        )
        return "".join([segment.text for segment in segments])


if __name__ == "__main__":
    instance = CustomWhisper()
    print(instance.forward())
