from videollama2 import model_init, mm_infer
from videollama2.utils import disable_torch_init
from experiments.video_model.segment_generator import segment_video_generator
import re
import asyncio
from functools import partial


class CustomVideoLLaMA2:

    def __init__(
        self,
        model_name="DAMO-NLP-SG/VideoLLaMA2.1-7B-16F",
        segment_time=10,
    ):
        """
        Initialize the inference model for video processing.
        Parameters:
            model_name (str): The name of the model to be used for inference. Default is "DAMO-NLP-SG/VideoLLaMA2.1-7B-16F".
            segment_time (int): The time in seconds for each video segment to be processed. Default is 10.
        Attributes:
            model: The initialized model for video inference.
            processor: The processor associated with the model.
            tokenizer: The tokenizer associated with the model.
            segment_time (int): The time in seconds for each video segment to be processed.
            modal (str): The type of data being processed, set to "video".
            prompt (str): The prompt used for video description.
        """

        self.model, self.processor, self.tokenizer = model_init(model_name)
        self.segment_time = segment_time
        self.modal = "video"
        self.prompt = "Can you describe the video in detail?"
        disable_torch_init()
        self.init_chat = False

    def sanitize_response(self, text):
        # TODO : update with experiments
        # detect "In the video, ..."
        pattern = r"(?i)\b(in the video,?\b.*?[\.;])\s?"
        cleaned_text = re.sub(pattern, "", text).strip()

        return cleaned_text

    def forward(self, video):
        description_list = []
        for segment in segment_video_generator(video, segment_time=self.segment_time):
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

    def _init_chat_forward(self, video_dir):
        self.init_chat = True
        self.processed_video = self.processor["video"](video_dir)
        self.partial_infer = partial(
            mm_infer,
            self.processed_video,
            model=self.model,
            tokenizer=self.tokenizer,
            modal="video",
            do_sample=True,
        )

    async def chat_forward(self, instruct, video_dir):
        if not self.init_chat:
            self._init_chat_forward(video_dir)

        # Use the current event loop directly
        output = await asyncio.get_event_loop().run_in_executor(
            None, self.partial_infer, instruct
        )
        return output


if __name__ == "__main__":
    instance = CustomVideoLLaMA2()
    print(instance.forward())
