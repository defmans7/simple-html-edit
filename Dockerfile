# Use official Bun image
FROM oven/bun:latest

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json bun.lock ./
RUN bun install

# BUILD
RUN bun run build

# Copy the rest of the project files
COPY . .

# Expose the port (change if needed)
EXPOSE 3032

# Health check to ensure the app is running
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3032/ || exit 1

# Default command: run the HTML file with Bun
CMD ["bun", "run", "start"]