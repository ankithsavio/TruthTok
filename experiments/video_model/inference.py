from videollama2 import model_init, mm_infer
from videollama2.utils import disable_torch_init
from videollama2.mm_utils import tokenizer_multimodal_token, KeywordsStoppingCriteria
from videollama2.constants import DEFAULT_VIDEO_TOKEN

# from experiments.video_model.segment_generator import segment_video_generator, batch_segment_video_generator
from segment_generator import segment_video_generator, batch_segment_video_generator
import re
import asyncio
from functools import partial
import torch
import copy


class CustomVideoLLaMA2:

    def __init__(
        self,
        model_name="DAMO-NLP-SG/VideoLLaMA2.1-7B-16F",
        segment_time=10,
        batch_size=5,
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
        self.batch_size = batch_size

    def sanitize_response(self, text):
        # TODO : update with experiments
        # detect "In the video, ..."
        pattern = r"(?i)\b(in the video,?\b.*?[\.;])\s?"
        cleaned_text = re.sub(pattern, "", text).strip()

        return cleaned_text

    def forward(self, video):
        description_list = []
        for segment in segment_video_generator(video, segment_time=self.segment_time):
            print(f"Forward Iter")
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
        return " ".join(description_list)

    def batch_forward(self, video):
        description_list = []
        for segments in batch_segment_video_generator(
            video, segment_time=self.segment_time, batch_size=self.batch_size
        ):
            processed_segment = [
                self.processor[self.modal](segment) for segment in segments
            ]
            segment_description = self.batch_video_infer(
                processed_segment,
                self.prompt,
                model=self.model,
                tokenizer=self.tokenizer,
                do_sample=True,
                batch_size=self.batch_size,
            )

            description_list.append(segment_description)

        return " ".join(description_list)

    def batch_video_infer(
        self, batch_video, instruct, model, tokenizer, batch_size, **kwargs
    ):

        modal = "video"
        modal_token = DEFAULT_VIDEO_TOKEN

        tensor_list = []
        for video in batch_video:
            tensor = video.half().cuda()
            tensor_list.append((tensor, modal))

        batch_size = len(
            tensor_list
        )  ## the final batch can be smaller than pre-defined batch_size

        if isinstance(instruct, str):
            message = [{"role": "user", "content": modal_token + "\n" + instruct}]
        elif isinstance(instruct, list):
            message = copy.deepcopy(instruct)
            message[0]["content"] = modal_token + "\n" + message[0]["content"]
        else:
            raise ValueError(f"Unsupported type of instruct: {type(instruct)}")

        system_message = []

        message = system_message + message
        prompt = tokenizer.apply_chat_template(
            message, tokenize=False, add_generation_prompt=True
        )

        input_ids = (
            tokenizer_multimodal_token(
                prompt, tokenizer, modal_token, return_tensors="pt"
            )
            .unsqueeze(0)
            .long()
            .cuda()
        )
        attention_masks = input_ids.ne(tokenizer.pad_token_id).long().cuda()

        keywords = [tokenizer.eos_token]
        stopping_criteria = KeywordsStoppingCriteria(keywords, tokenizer, input_ids)

        do_sample = kwargs.get("do_sample", False)
        temperature = kwargs.get("temperature", 0.2 if do_sample else 0.0)
        top_p = kwargs.get("top_p", 0.9)
        max_new_tokens = kwargs.get("max_new_tokens", 2048)

        with torch.inference_mode():
            output_ids = model.generate(
                input_ids.repeat(batch_size, 1),
                attention_mask=attention_masks.repeat(batch_size, 1),
                images=tensor_list,
                do_sample=do_sample,
                temperature=temperature,
                max_new_tokens=max_new_tokens,
                top_p=top_p,
                use_cache=True,
                stopping_criteria=[stopping_criteria],
                pad_token_id=tokenizer.eos_token_id,
            )

        outputs = tokenizer.batch_decode(output_ids, skip_special_tokens=True)

        return " ".join(outputs)

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
