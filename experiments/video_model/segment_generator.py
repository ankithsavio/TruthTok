import subprocess
import io

def segment_video_generator(input_file, segment_time=60, overlap_time=10):
    # get video duration
    duration_command = [
        "ffprobe",
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        input_file
    ]
    result = subprocess.run(duration_command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    duration = float(result.stdout.strip())

    current_start = 0

    while current_start < duration:
        command = [
            "ffmpeg",
            "-i", input_file,
            "-ss", str(current_start),
            "-t", str(segment_time),
            "-c", "copy",
            "-f", "matroska",
            "pipe:1"
        ]
        process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        yield io.BytesIO(process.stdout.read())
        process.stdout.close()
        process.wait()
        current_start += segment_time - overlap_time

