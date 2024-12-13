import os
from ollama import Client


class LlamaModel:

    def __init__(self, model_name="llama3.3:70b-instruct-q6_K"):
        self.client = Client()
        self.model = model_name
        self.system_prompt = """
        You are an advanced language model tasked with synthesizing accurate video descriptions by combining outputs from both a video-to-text model and an audio-to-text model. Each video is segmented into shorter segments (around 10 seconds), which are individually analyzed by the video-to-text model and audio-to-text model. Your primary goal is to create a cohesive and accurate description for each segment while addressing any potential inaccuracies or hallucinations from the video-to-text model.

        Guidelines:
        1. **Combine Information**: Merge the output from the video-to-text model and the audio-to-text model for each video segment. Use the audio transcription as the primary anchor for accuracy, supplementing it with visual cues from the video-to-text model.
        2. **Minimize Hallucinations**: Be cautious of any overly detailed or speculative content from the video-to-text model that isn't supported by the audio transcription. If inconsistencies arise, prioritize the audio transcription unless visual details add non-contradictory and meaningful context.
        3. **Enhance Clarity**: Ensure the final description for each segment is clear, concise, and provides a comprehensive understanding of the segment without unnecessary embellishment.
        4. **Maintain Consistency**: Create descriptions that flow logically between segments to form an overall coherent narrative for the entire video.

        Remember, the goal is to combine the strengths of both models: the accuracy of the audio transcription and the detailed imagery of the video-to-text model. Generate descriptions that are informative, accurate, and succinct.
        """
        self.input_prompt = """
        You are provided with the outputs from two models for a video segment:  
        1. **Video-to-Text Model Output**: A description of the visual content in all the segment.  
        2. **Audio-to-Text Model Output**: A transcription of the audio content in all the segment.  

        Your task is to combine these outputs into a single, cohesive, and accurate description of the segment. Use the audio transcription as the primary anchor for factual accuracy, and only include visual details from the video-to-text model if they are consistent with or enhance the audio content.

        Here is the input for the current segment:  

        **Video-to-Text Model Output**:  
        `{video_content}`  

        **Audio-to-Text Model Output**:  
        `{audio_content}`  

        Based on the provided information, generate a single, accurate, and clear description of the video. Ensure the description is detailed, concise, avoids any speculative content, and maintains factual accuracy.
        """

    def summmarize_video(self, video_content, audio_content):
        response = self.client.chat(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": self.system_prompt,
                },
                {
                    "role": "user",
                    "content": self.input_prompt.format(
                        video_content=video_content, audio_content=audio_content
                    ),
                },
            ],
        )
        return response.message.content

    def summarize_content(self):
        # TODO : to avoid context window problem
        pass
