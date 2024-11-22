import amqp, { Channel, Connection, Message } from 'amqplib'

export class QueueService {
  private channels!: {
    highPriority: Channel
    lowPriority: Channel
    archival: Channel
  }
  private connection!: Connection

  constructor() {
    this.initializeChannels()
  }

  private async initializeChannels() {
    this.connection = await amqp.connect(process.env.RABBITMQ_URL!)
    this.channels = {
      highPriority: await this.connection.createChannel(),
      lowPriority: await this.connection.createChannel(),
      archival: await this.connection.createChannel()
    }
  }

  async processVideo(videoId: string, priority: 'high' | 'low') {
    const channel = priority === 'high' 
      ? this.channels.highPriority 
      : this.channels.lowPriority

    await channel.sendToQueue('video-processing', Buffer.from(videoId), {
      persistent: true,
      priority: priority === 'high' ? 10 : 1
    })
  }

  async setupConsumers(concurrency: number) {
    for (let i = 0; i < concurrency; i++) {
      this.channels.highPriority.prefetch(1)
      this.channels.highPriority.consume('video-processing', async (msg) => {
        if (msg) {
          // Process video
          this.channels.highPriority.ack(msg)
        }
      })
    }
  }
} 