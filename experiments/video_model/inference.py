import sys
sys.path.append('./')
from videollama2 import model_init, mm_infer
from videollama2.utils import disable_torch_init
import os
import json
from backend.post_tweet import post

def inference():
    disable_torch_init()

    modal = 'video'
    video_dir = 'video_model/data/videos/'
    instruct = 'Create a descriptive story about this video'

    metadata_path = 'video_model/data/metadata/video.json'
    model_path = 'DAMO-NLP-SG/VideoLLaMA2.1-7B-16F'

    model, processor, tokenizer = model_init(model_path)
    for file in  os.listdir(video_dir):
        modal_path = video_dir + file
        filename = os.path.splitext(file)[0]
        description = mm_infer(processor[modal](modal_path), instruct, model=model, tokenizer=tokenizer, do_sample=True, modal=modal)

        print(description)

        with open(metadata_path, 'r') as file:
            json_data = json.load(file)

            for json_object in json_data:
                if json_object.get('title') == filename:
                    title = json_object.get('original_title')
                    url = json_object.get('url')

        content = f'Video Title : {title}\n Description of the video : {description}\n Link :{url}'

        post(content= content, user= 'johndoe')

if __name__ == "__main__":
    inference()