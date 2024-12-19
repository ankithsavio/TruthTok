from inference import CustomVideoLLaMA2
import time

client = CustomVideoLLaMA2(segment_time=10, batch_size=24)

video_dir = "experiments/data/videos/sample_video.mp4"

start_time = time.time()
response = client.batch_forward(video_dir)
end_time = time.time()
forward_time = end_time - start_time

print(f"Forward response: {response}")

print(f"Forward time: {forward_time} seconds")

# start_time = time.time()
# response = client.parallel_forward(video_dir, 5)
# end_time = time.time()
# parallel_forward_time = end_time - start_time

# print(f"Parallel forward response: {response}")
# print(f"Parallel forward time: {parallel_forward_time} seconds")

# time_difference = parallel_forward_time - forward_time
# print(f"Time difference: {time_difference} seconds")


# from transformers import LlamaTokenizer, AutoModelForCausalLM
# import torch

# tokenizer = LlamaTokenizer.from_pretrained("openlm-research/open_llama_3b")
# # model = AutoModelForCausalLM.from_pretrained("openlm-research/open_llama_3b", torch_dtype=torch.float16, device_map="auto")

# tokenizer.padding_side = "left"

# # Define PAD Token = EOS Token
# tokenizer.pad_token = tokenizer.eos_token
# # model.config.pad_token_id = model.config.eos_token_id

# # use different length sentences to test batching
# sentences = [
#          "Hello, my dog is a little",
#           "Today, I",
#  ]

# inputs = tokenizer(sentences, return_tensors="pt", padding=True)


# print(tokenizer.batch_decode(output_sequences, skip_special_tokens=True))
