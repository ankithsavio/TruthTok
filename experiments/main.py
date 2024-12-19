from language_model.inference import LlamaModel
from video_model.inference import CustomVideoLLaMA2
from audio_model.inference import CustomWhisper
from feed_backend.post_tweet import post
import os
import json

feed_content = """ 
Title: {title}\n
Description: {description}\n
Link: {link}\n
"""


def main():
    # video_dir = "experiments/data/videos/sample_video.mp4"
    video_dir = "experiments/data/videos/"
    metadata_dir = "experiments/data/metadata/video.json"
    with open(metadata_dir, "r") as f:
        metadata_list = json.load(f)

    language_model = LlamaModel()
    video_model = CustomVideoLLaMA2(segment_time=10)
    audio_model = CustomWhisper()

    for file in os.listdir(video_dir)[2:]:
        video_file = video_dir + file
        file_name = os.path.splitext(file)[0]

        for metadata in metadata_list:
            if file_name == metadata["title"]:
                title = metadata["original_title"]
                link = metadata["url"]

                video_content = video_model.batch_forward(video_file)
                audio_content = audio_model.forward(video_file)

                summary = language_model.summarize_video(video_content, audio_content)

                post(
                    content=feed_content.format(
                        title=title, description=summary, link=link
                    ),
                    user="ankithsavio",
                )


if __name__ == "__main__":
    main()
