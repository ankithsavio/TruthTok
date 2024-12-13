import cv2
from videollama2.mm_utils import frame_sample


def segment_video_generator(input_file, segment_time=60):
    """
    Generator that yields segmented chunks of a video.
    """
    cap = cv2.VideoCapture(input_file)
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    total_duration = frame_count // fps

    chunk_frames = []
    start_time = 0
    frame_indices = list(range(frame_count - 1))
    sample_indices = [
        frame_indices[i]
        for i in frame_sample(total_duration, mode="uniform", num_frames=16)
    ]  # 16 frames for videollama2.1

    frame_index = 0
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        current_time = len(chunk_frames) / fps + start_time
        if frame_index in sample_indices:
            chunk_frames.append(frame)

        if current_time >= start_time + segment_time or not ret:
            yield chunk_frames
            chunk_frames = []
            start_time += segment_time

        frame_index += 1
    cap.release()
