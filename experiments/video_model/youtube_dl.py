import os
import re
import json
import yt_dlp
import argparse


def sanitize_filename(filename):
    """
    Sanitize a string to create a valid filename.

    Args:
        filename (str): Original filename.

    Returns:
        str: Sanitized filename.
    """
    filename = re.sub(r"[^\w\s-]", "", filename)  # Remove special characters
    filename = re.sub(r"\s+", "_", filename)  # Replace spaces with underscores
    filename = filename.strip("_")  # Remove leading/trailing underscores
    return filename


def download_videos_from_search(
    search_query,
    max_duration=300,
    max_videos=10,
    output_dir="./data",
):
    """
    Download YouTube videos related to natural phenomena, filtering by duration.

    Args:
        search_query (str): The search query for the videos.
        max_duration (int): Maximum video duration in seconds (default is 300 seconds).
        max_videos (int): Maximum number of videos to download (default is 10).
        output_dir (str): Directory to save the downloaded videos.
    """
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(output_dir + "/videos", exist_ok=True)
    os.makedirs(output_dir + "/audios", exist_ok=True)

    ydl_opts = {
        "format": "bestvideo[height<=720][vcodec^=avc][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]",  # Limit quality to 720p and format to mp4
        "outtmpl": os.path.join(
            output_dir + "/videos", "%(title)s.%(ext)s"
        ),  # Output filename template for video
        "noplaylist": True,  # Only individual videos
        "quiet": True,
        "postprocessors": [
            {
                "key": "FFmpegVideoConvertor",
                "preferedformat": "mp4",
            }
        ],
        "postprocessor_args": {
            "FFmpegVideoConvertor": [
                "-c:v",
                "libx264",  # Use H.264 codec
                "-preset",
                "veryfast",  # Encoding preset
            ]
        },
    }

    metadata = []
    dl_count = 0

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        # YouTube search and extract video information
        search_results = ydl.extract_info(f"ytsearch10:{search_query}", download=False)

        for entry in search_results["entries"]:

            if dl_count >= max_videos:
                break

            video_title = entry.get("title")
            video_duration = entry.get("duration")
            video_url = entry.get("webpage_url")
            video_id = entry.get("id")
            video_uploader = entry.get("uploader")
            video_upload_date = entry.get("upload_date")
            video_description = entry.get("description")

            if video_duration and video_duration <= max_duration:
                sanitized_title = sanitize_filename(video_title)
                video_output_path = os.path.join(
                    output_dir + "/videos", f"{sanitized_title}.mp4"
                )
                audio_output_path = os.path.join(
                    output_dir + "/audios", f"{sanitized_title}.mp3"
                )

                ydl_opts["outtmpl"] = (
                    video_output_path  # Update output path for the sanitized filename
                )

                print(f"Downloading: {sanitized_title} ({video_duration}s)")
                try:
                    # Download the video
                    with yt_dlp.YoutubeDL(ydl_opts) as single_ydl:
                        single_ydl.download([video_url])

                    audio_ydl_opts = {
                        "format": "bestaudio[ext=m4a]/best[height<=720][ext=mp4]",
                        "noplaylist": True,
                        "quiet": True,
                        "outtmpl": audio_output_path,
                        "postprocessors": [
                            {
                                "key": "FFmpegExtractAudio",
                                "preferredcodec": "mp3",
                                "preferredquality": "128",
                            }
                        ],
                    }

                    with yt_dlp.YoutubeDL(audio_ydl_opts) as audio_ydl:
                        audio_ydl.download([video_url])

                    video_metadata = {
                        "id": video_id,
                        "title": sanitized_title,
                        "original_title": video_title,
                        "duration": video_duration,
                        "url": video_url,
                        "uploader": video_uploader,
                        "upload_date": video_upload_date,
                        "description": video_description,
                        "file_path": video_output_path,
                        "audio_path": audio_output_path,
                    }

                    metadata.append(video_metadata)
                    dl_count += 1

                except Exception as e:
                    print(f"Failed to download {sanitized_title}: {e}")

    os.makedirs(output_dir + "/metadata", exist_ok=True)
    metadata_path = os.path.join(output_dir + "/metadata", "video.json")

    if os.path.exists(metadata_path):
        with open(metadata_path, "r", encoding="utf-8") as f:
            existing_metadata = json.load(f)
    else:
        existing_metadata = []

    # Append new metadata and save
    existing_metadata.extend(metadata)
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(existing_metadata, f, indent=4, ensure_ascii=False)
        print(f"Metadata appended to {metadata_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Download YouTube videos based on a search query."
    )
    parser.add_argument(
        "search_query", type=str, help="The search query for the videos."
    )
    parser.add_argument(
        "--max_duration",
        type=int,
        default=300,
        help="Maximum video duration in seconds (default: 300).",
    )
    parser.add_argument(
        "--max_videos",
        type=int,
        default=10,
        help="Maximum number of videos to download (default: 10).",
    )
    parser.add_argument(
        "--output_dir",
        type=str,
        default="./data",
        help="Directory to save videos and metadata (default: ./data).",
    )

    args = parser.parse_args()

    download_videos_from_search(
        args.search_query, args.max_duration, args.max_videos, args.output_dir
    )
