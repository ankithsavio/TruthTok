import subprocess
import os

def segment_video(input_file, output_pattern, segment_time=60, overlap_time=10):
    base_dir = os.path.dirname(output_pattern)
    if not os.path.exists(base_dir):
        os.makedirs(base_dir)

    # Get video duration
    duration_command = [
        "ffprobe",
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        input_file,
    ]
    result = subprocess.run(
        duration_command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
    )
    duration = float(result.stdout.strip())

    current_start = 0
    segment_index = 0

    while current_start < duration:
        output_file = output_pattern + str(segment_index) + ".mp4"
        command = [
            "ffmpeg",
            "-i",
            input_file,
            "-ss",
            str(current_start),
            "-t",
            str(segment_time),
            "-c",
            "copy",
            output_file,
        ]
        subprocess.run(command, check=True)
        current_start += segment_time - overlap_time
        segment_index += 1


if __name__ == "__main__":
    input_video = "./data/videos/sample_video.mp4"
    output_directory = "./data/videos/segments/"
    segment_video(input_video, output_directory)
