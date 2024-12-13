from videollama2 import model_init, mm_infer
from videollama2.utils import disable_torch_init
from .segment_generator import segment_video_generator
import re


class CustomVideoLLaMA2:

    def __init__(
        self,
        model_name="DAMO-NLP-SG/VideoLLaMA2.1-7B-16F",
        video_dir="experiments/data/videos/sample_video.mp4",
        segment_time=10,
    ):
        """
        Initialize the inference model for video processing.
        Parameters:
            model_name (str): The name of the model to be used for inference. Default is "DAMO-NLP-SG/VideoLLaMA2.1-7B-16F".
            video_dir (str): The directory path to the video file. Default is "experiments/data/videos/sample_video.mp4".
            segment_time (int): The time in seconds for each video segment to be processed. Default is 10.
        Attributes:
            model: The initialized model for video inference.
            processor: The processor associated with the model.
            tokenizer: The tokenizer associated with the model.
            video (str): The directory path to the video file.
            segment_time (int): The time in seconds for each video segment to be processed.
            modal (str): The type of data being processed, set to "video".
            prompt (str): The prompt used for video description.
        """

        self.model, self.processor, self.tokenizer = model_init(model_name)
        self.video = video_dir
        self.segment_time = segment_time
        self.modal = "video"
        self.prompt = "Can you describe the video in detail?"
        disable_torch_init()

    def sanitize_response(self, text):
        # TODO : update with experiments
        # detect "In the video, ..."
        pattern = r"(?i)\b(in the video,?\b.*?[\.;])\s?"
        cleaned_text = re.sub(pattern, "", text).strip()

        return cleaned_text

    def forward(self):
        description_list = []
        for segment in segment_video_generator(
            self.video, segment_time=self.segment_time
        ):
            processed_segment = self.processor[self.modal](segment)
            segment_description = mm_infer(
                processed_segment,
                self.prompt,
                model=self.model,
                tokenizer=self.tokenizer,
                do_sample=True,
                modal=self.modal,
            )

            description_list.append(self.sanitize_response(segment_description))
        return " ".join(description for description in description_list)


if __name__ == "__main__":
    instance = CustomVideoLLaMA2()
    print(instance.forward())
