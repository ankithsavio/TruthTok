
## Getting Started

### Prerequisites

-   Node.js and npm (for the frontend)
-   Python 3 (for the backend and video model)
-   Required Python packages:
    -   videollama2
-   ffmpeg to process mp4 files

### 1. Frontend (feed\_app/news\_feed)

1. Navigate to the frontend directory:

    ```bash
    cd feed_app/news_feed
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Start the development server:

    ```bash
    npm run dev
    ```

    The frontend will be accessible at `http://localhost:3000`.

### 2. Backend (feed\_backend)

1. Navigate to the backend directory:

    ```bash
    cd feed_backend
    ```

2. Start the backend server:

    ```bash
    python webapp.py
    ```

### 3. Video Model (video\_model)

-   **YouTube Video Downloader**

    - Use `youtube_dl.py` to download YouTube videos based on a search query, filters them by duration, and saves them along with their metadata.

        ```bash
        python experiments/video_model/youtube_dl.py <search_query> [--max_duration] [--max_videos] [--output_dir]
        ```

-   **Running Inference:**

    -   Use `inference.py` to run inference on a video file stored in `data/videos/sample_video.mp4` using the `CustomVideoLLaMA2` class, which can describe the video based on its visual content.
        ```bash
        python experiments/video_model/inference.py
        ```

### 3. Audio Model (audio\_model)

-   **Running Inference:**

    -   Use `inference.py` to run inference on a video file stored in `data/videos/sample_video.mp4` using the `CustomWhisper` class, which can transcribe the video based on its audio content.
        ```bash
        python experiments/audio_model/inference.py
        ```

### 3. Language Model (language\_model)

-   **Running Inference:**

    -   `inference.py` implements the `LlamaModel` class, which can summarize the content from both video_model and the audio_model.

    - The `experiments/main.py` script combines all the models to summarize `data/videos/sample_video.mp4`.

## Additional Notes

-   Follow instructions to download the VideoLLaMA2 from the local directory.
-   The `inference_chat.py` does not depend on the web application and can be run directly.

## WIP

-   Robust experimentation