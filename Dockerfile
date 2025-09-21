# Use official Bun image
FROM oven/bun:latest

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json bun.lock bunfig.toml ./
RUN bun install

# Copy the rest of the project files
COPY . .

# Build the application to dist/
RUN bun run build

# Expose the port (change if needed)
EXPOSE 3001

# Health check using Bun's built-in fetch capability
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD bun -e "fetch('http://localhost:3001/').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Default command: run the HTML file with Bun
CMD ["bun", "start"]