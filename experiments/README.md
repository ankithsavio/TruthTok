
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

The `video_model` directory contains Python scripts for various video processing tasks.

-   **YouTube Video Downloader**

    - Use `youtube_dl.py` to download YouTube videos based on a search query, filters them by duration, and saves them along with their metadata.

        ```bash
        cd video_model
        python youtube_dl.py <search_query> [--max_duration] [--max_videos] [--output_dir]
        ```

-   **Running Inference:**

    -   Use `inference.py` to run inference on a video file stored in `data/videos/sample_video.mp4`and create a post in the web application.
        ```bash
        cd video_model
        python inference.py
        ```

    -   Use `inference_chat.py` for inference on a single video with an interactive chat feature.
        ```bash
         cd video_model
        python inference_chat.py
        ```
-   **Data**:
    -   Add mp4 videos in data/videos to run inference on.
    -   Additionally add metadata of the videos in video.json.

## Additional Notes

-   Follow intructions to download the VideoLLaMA2 from the local directory.
-   The `inference_chat.py` does not depend on the web application and can be run directly.


## WIP

-   Add Audio-To-Text : Whisper.

