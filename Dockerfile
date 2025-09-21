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

# Expose the default port (change if your app uses a different port)
USER bun
EXPOSE 3000/tcp

# Health check using Bun's built-in fetch capability
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD bun -e "fetch('http://localhost:3000/').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Start the appUSER bun
CMD ["bun", "start"]
