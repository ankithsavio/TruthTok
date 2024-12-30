import requests

def post(content: str, user: str):

    url = "http://localhost:8000/tweets/"

    data = {
    "content": content,
    "user_name": user,
    "user_username": user,
    "user_avatar": ""
    }

    response = requests.post(url, json=data)

    if response.status_code == 200:
        print("Tweet posted successfully!")
        print(response.json())
    else:
        print("Failed to post tweet")



