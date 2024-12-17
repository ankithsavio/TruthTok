from faster_whisper import WhisperModel


class CustomWhisper:

    def __init__(
        self,
        model_name="large-v2",
    ):
        """
        Initialize the CustomWhisper model.

        Parameters:
        model_name (str): The name/size of the Whisper model to use.
        """
        self.model = WhisperModel(model_name, device="cuda", compute_type="float16")

    def forward(self, video):
        segments, _ = self.model.transcribe(
            video,
            beam_size=5,
            chunk_length=30,
        )
        return "".join([segment.text for segment in segments])


if __name__ == "__main__":
    instance = CustomWhisper()
    print(instance.forward())
