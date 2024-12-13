FROM node:18-slim

WORKDIR /app

# Install necessary dependencies for TensorFlow.js
RUN apt-get update && \
    apt-get install -y python3 build-essential && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy service account
COPY modelaccount.json ./

# Copy rest of the application
COPY . .

# Expose port 8080
EXPOSE 3123

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV GOOGLE_APPLICATION_CREDENTIALS=./modelaccount.json

# Start the server
CMD [ "npm", "start" ]