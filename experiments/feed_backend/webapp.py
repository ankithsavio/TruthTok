from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from datetime import datetime
from typing import List
from uuid import uuid4
from chat import ChatApplication
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SQLALCHEMY_DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'tweets.db')}"
print(BASE_DIR)
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
# loads model into the GPU
chatbot = ChatApplication()


# Tweet model
class Tweet(Base):
    __tablename__ = "tweets"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String, index=True)
    user_name = Column(String, index=True)
    user_username = Column(String, index=True)
    user_avatar = Column(String)
    likes = Column(Integer, default=0)
    retweets = Column(Integer, default=0)
    replies = Column(Integer, default=0)
    timestamp = Column(DateTime, default=datetime.utcnow)


Base.metadata.create_all(bind=engine)


# Pydantic models
class TweetCreate(BaseModel):
    content: str
    user_name: str
    user_username: str
    user_avatar: str


class TweetResponse(BaseModel):
    id: int
    content: str
    user_name: str
    user_username: str
    user_avatar: str
    likes: int
    retweets: int
    replies: int
    timestamp: datetime

    class Config:
        from_attributes = True


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/tweets/", response_model=TweetResponse)
def create_tweet(tweet: TweetCreate, db: Session = Depends(get_db)):
    try:
        db_tweet = Tweet(**tweet.dict())
        db.add(db_tweet)
        db.commit()
        db.refresh(db_tweet)
        return db_tweet
    except Exception as e:
        # db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while creating the tweet: {str(e)}",
        )


@app.get("/tweets/", response_model=List[TweetResponse])
def read_tweets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    try:
        tweets = (
            db.query(Tweet)
            .order_by(Tweet.timestamp.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        return tweets
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"An error occurred while fetching tweets: {str(e)}"
        )


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]


@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        user_message = request.messages[-1].content  # Get the last user message
        bot_response = await chatbot.chat_response(user_message)
        print(f"server response : {bot_response}")
        return {"id": str(uuid4()), "role": "assistant", "content": bot_response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.on_event("shutdown")
def shutdown_event():
    chatbot.shutdown()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
