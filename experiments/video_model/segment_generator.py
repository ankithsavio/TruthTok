import cv2


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

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        current_time = len(chunk_frames) / fps + start_time
        chunk_frames.append(frame)

        if current_time >= start_time + segment_time or not ret:
            yield chunk_frames
            chunk_frames = []
            start_time += segment_time

    cap.release()
