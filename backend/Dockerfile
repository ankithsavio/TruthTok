FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Create startup script
RUN echo "#!/bin/sh\n\
npx prisma migrate deploy\n\
npm start" > /app/start.sh && \
chmod +x /app/start.sh

CMD ["/app/start.sh"] 