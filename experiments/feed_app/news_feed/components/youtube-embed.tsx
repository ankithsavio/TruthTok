import React from 'react'

interface YouTubeEmbedProps {
  content: string
}

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ content }) => {
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/g
  const matches = content.match(youtubeRegex)

  if (!matches) return null

  return (
    <div className="mt-4 space-y-4">
      {matches.map((url, index) => {
        const videoId = url.split('v=')[1] || url.split('/').pop()
        return (
          <div key={index} className="aspect-video max-w-[560px] mx-auto">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full rounded-lg"
              title={`YouTube video embed ${index + 1}`}
            />
          </div>
        )
      })}
    </div>
  )
}

export default YouTubeEmbed

