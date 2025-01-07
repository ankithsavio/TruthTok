FROM nvidia/cuda:12.6.3-devel-ubuntu22.04

# Set py environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Install Python and other system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    build-essential \
    cmake \
    git \
    wget \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgstreamer1.0-dev \
    libgstreamer-plugins-base1.0-dev \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN python3 -m pip install --upgrade pip

# Set Python alias
RUN ln -s /usr/bin/python3 /usr/bin/python

# Set the working directory
WORKDIR /app

# backend requirements
COPY ./requirements.txt /app/experiments/requirements.txt

WORKDIR /app/experiments

# Install Python dependencies
RUN pip install --no-cache-dir -r /app/experiments/requirements.txt

# Clone and set up VideoLLaMA2
RUN git clone https://github.com/DAMO-NLP-SG/VideoLLaMA2

WORKDIR /app/experiments/VideoLLaMA2

RUN pip install --no-cache-dir -r /app/experiments/VideoLLaMA2/requirements.txt && \
    pip install -e . &&\
    pip install --no-cache-dir --no-build-isolation flash-attn==2.5.8

# app directory
WORKDIR /app

# copy backend code
COPY ./feed_backend /app/experiments/feed_backend
COPY ./video_model /app/experiments/video_model
COPY ./audio_model /app/experiments/audio_model
COPY ./language_model /app/experiments/language_model
COPY ./__init__.py /app/experiments

EXPOSE 8000

# CMD ["ls", "-R", "/app"]

# CMD ["python", "-m", "experiments.feed_backend.webapp"]
