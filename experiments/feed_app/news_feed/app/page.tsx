import TwitterFeed from '../components/twitter-feed'

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Demo News Feed</h1>
      <TwitterFeed />
    </main>
  )
}

