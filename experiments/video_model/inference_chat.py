import sys
sys.path.append('./')
from videollama2 import model_init, mm_infer
from videollama2.utils import disable_torch_init
import os

def inference():
    disable_torch_init()

    modal = 'video'
    video_dir = 'video_model/data/videos/'

    video_dir = 'video_model/data/videos/sample_video.mp4'
    model_path = 'DAMO-NLP-SG/VideoLLaMA2.1-7B-16F'

    model, processor, tokenizer = model_init(model_path)

    try:
        modal_path = video_dir
        while True:
            
            instruct = input('\nEnter your prompt for the video\nuser: ')

            output = mm_infer(processor[modal](modal_path), instruct, model=model, tokenizer=tokenizer, do_sample=True, modal=modal)

            print(f'assistant: {output}')
    except KeyboardInterrupt as e:
        print('\nEnd of Video Chat\n')

if __name__ == "__main__":
    inference()