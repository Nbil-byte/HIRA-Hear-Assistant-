FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production
ENV DB_PATH=./database.sqlite


# Copy application code
COPY . .

# Expose port
ENV PORT=5000
EXPOSE 5000

# Start command
CMD [ "npm", "start" ]