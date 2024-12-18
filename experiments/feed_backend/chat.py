import re
import os
from experiments.video_model.youtube_dl import download_video_by_url
from experiments.video_model.inference import CustomVideoLLaMA2


class ChatApplication:
    def __init__(self):
        self.video_chat = False
        self.video_model = CustomVideoLLaMA2()
        self.temp_dir = "experiments/data/temp"

    def detect_youtube_links(self, text):
        youtube_regex = re.compile(
            r"(https?://)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)/[^\s]+",
            re.IGNORECASE,
        )
        match = youtube_regex.search(text)
        return match.group(0) if match else None

    async def chat_response(self, message):
        response = "{content}"

        # Detect YouTube links and process video
        if link := self.detect_youtube_links(message):
            self.video_chat = True
            os.makedirs(self.temp_dir, exist_ok=True)

            # Ensure video is downloaded correctly
            self.video_dir = download_video_by_url(link, self.temp_dir)
            self.video_model.init_chat = False  # Reset video model chat initialization

            return response.format(
                content="Video has been processed. Enter a prompt for the VideoLLaMA2 model."
            )

        # Handle subsequent video chat responses
        elif self.video_chat:
            content = await self.video_model.chat_forward(message, self.video_dir)
            return response.format(content=content)

        # Default message when no video link is provided
        else:
            return response.format(
                content="Hi, Please send a Youtube Video URL to start the Chat interface with the VideoLLaMA2 model."
            )

    def shutdown(self):
        os.rmdir(self.temp_dir)
