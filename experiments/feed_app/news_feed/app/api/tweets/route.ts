import { NextResponse } from 'next/server'

let tweets = [
  {
    id: 1,
    user: {
      name: "John Doe",
      username: "johndoe",
      avatar: "/placeholder.svg?height=40&width=40"
    },
    content: "Check out this cool video! https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    likes: 5,
    retweets: 2,
    replies: 1,
    timestamp: "2023-05-20T12:00:00Z"
  }
]

export async function GET() {
  return NextResponse.json(tweets)
}

export async function POST(request: Request) {
  const tweet = await request.json()
  const newTweet = {
    id: tweets.length + 1,
    ...tweet
  }
  tweets.unshift(newTweet)
  return NextResponse.json(newTweet, { status: 201 })
}

