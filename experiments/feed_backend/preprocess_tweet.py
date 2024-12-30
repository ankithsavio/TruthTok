# from experiments.feed_backend.webapp import TweetCreate
from experiments.video_model.youtube_dl import download_video_by_url
from experiments.language_model.inference import LlamaModel
from experiments.video_model.inference import CustomVideoLLaMA2
from experiments.audio_model.inference import CustomWhisper
import re
import os
import shutil
import json
import asyncio
from logging import Logger
from functools import partial
from pydantic import BaseModel


class TweetCreate(BaseModel):
    content: str
    user_name: str
    user_username: str
    user_avatar: str


logger = Logger("experiments/data/temp/logg.log")

temp_dir = "experiments/data/temp"
feed_content = """ 
Title: {title}\n
Description: {description}\n
Link: {link}\n
"""


def detect_youtube_links(text):
    youtube_regex = re.compile(
        r"(https?://)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)/[^\s]+",
        re.IGNORECASE,
    )
    match = youtube_regex.search(text)
    return match.group(0) if match else None


async def preprocess_tweet(tweet, language_model, video_model, audio_model):
    content = tweet.content
    # breakpoint()
    if link := detect_youtube_links(content):
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
        os.makedirs(temp_dir, exist_ok=True)
        video_file = download_video_by_url(link, temp_dir)
        # video_dir = "experiments/data/videos/"
        metadata_dir = "experiments/data/temp/metadata/video.json"
        with open(metadata_dir, "r") as f:
            metadata_list = json.load(f)

        file_name = os.path.splitext(os.path.basename(video_file))[0]

        if not os.path.exists(metadata_dir):
            raise FileNotFoundError(f"Metadata file not found: {metadata_dir}")

        for metadata in metadata_list:
            if file_name == metadata["title"]:
                title = metadata["original_title"]
                link = metadata["url"]

                video_content = await asyncio.get_event_loop().run_in_executor(
                    None, video_model.batch_forward, video_file
                )
                audio_content = await asyncio.get_event_loop().run_in_executor(
                    None, audio_model.forward, video_file
                )
                summary = await asyncio.get_event_loop().run_in_executor(
                    None,
                    language_model.summarize_video,
                    *(video_content, audio_content),
                )

                tweet = TweetCreate(
                    content=feed_content.format(
                        title=title, description=summary, link=link
                    ),
                    user_username="userprompt",
                    user_name="User Prompt",
                    user_avatar="/placeholder.svg?height=40&width=40",
                )
                return tweet
    else:
        return tweet
