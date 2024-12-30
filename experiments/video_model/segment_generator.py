import cv2
import numpy as np
from videollama2.mm_utils import frame_sample


def _frame_sample(duration, mode="uniform", num_frames=None, fps=None):
    if mode == "uniform":
        assert (
            num_frames is not None
        ), "Number of frames must be provided for uniform sampling."
        return np.round(np.linspace(0, duration - 1, num_frames)).astype(int)
    else:
        raise UserWarning("Unsupported mode")


def segment_video_generator(input_file, segment_time=60):
    """
    Generator that yields segmented chunks of a video.
    """
    cap = cv2.VideoCapture(input_file)
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    segment_counter = 0
    chunk_frames = []
    frame_indices = list(range(frame_count))

    segment_frame_count = segment_time * fps

    def update_segment_indices(counter):
        start_index = counter * segment_frame_count
        end_index = min((counter + 1) * segment_frame_count, frame_count)
        segment_slice = slice(start_index, end_index)

        indices = [
            frame_indices[segment_slice][i]
            for i in frame_sample(
                end_index - start_index, mode="uniform", num_frames=16
            )
        ]  # 16 frames for videollama2.1

        return indices

    sample_indices = update_segment_indices(segment_counter)

    frame_index = 0
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        if frame_index in sample_indices:
            chunk_frames.append(frame)

        if frame_index >= (segment_counter + 1) * segment_frame_count or not ret:
            if chunk_frames:
                yield chunk_frames
            segment_counter += 1
            if segment_counter * segment_frame_count < frame_count:
                sample_indices = update_segment_indices(segment_counter)
            chunk_frames = []

        frame_index += 1

    if chunk_frames:
        yield chunk_frames

    cap.release()

def batch_segment_video_generator(input_file, segment_time=60, batch_size=5):
    """
    Generator that yields segmented chunks of a video in a batch.
    """
    cap = cv2.VideoCapture(input_file)
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    segment_frame_count = segment_time * fps
    num_segments = (frame_count + segment_frame_count - 1) // segment_frame_count

    segment_indices = []
    for i in range(num_segments):
        start = i * segment_frame_count
        end = min((i + 1) * segment_frame_count, frame_count)
        segment_indices.append(_frame_sample(end - start, num_frames=16) + start)

    batch = []
    frame_index = 0
    segment_index = 0
    chunk_frames = []

    current_segment_indices = segment_indices[segment_index] if segment_indices else []

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        if frame_index in current_segment_indices:
            chunk_frames.append(frame)

        frame_index += 1
        if frame_index >= (segment_index + 1) * segment_frame_count or not ret:
            if chunk_frames:
                batch.append(chunk_frames)
                if len(batch) == batch_size:
                    yield batch
                    batch = []
                chunk_frames = []  # Reset chunk_frames

            segment_index += 1
            if segment_index < num_segments:
                current_segment_indices = segment_indices[segment_index]
            else:
                current_segment_indices = []

    if batch:
        yield batch

    cap.release()
