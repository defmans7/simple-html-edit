# Use official Bun image
FROM oven/bun:1.2

# Set working directory
WORKDIR /app

# Copy package and lock files first for better caching
COPY package.json bun.lock bunfig.toml ./

# Install dependencies
RUN bun install

# Copy the rest of the application code
COPY . .

RUN bun run build

# Expose the default port (change if your app uses a different port)
USER bun
EXPOSE 3000/tcp

# Start the appUSER bun
CMD ["bun", "start"]
