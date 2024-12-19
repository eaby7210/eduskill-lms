# Use an explicit Node.js Alpine image
FROM node:20-alpine3.19

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    gcc \
    g++ \
    libc6-compat

# Set working directory
WORKDIR /app

# Copy package files first
COPY package.json package-lock.json* ./

# Clear npm cache and force reinstall
RUN npm cache clean --force

# Install dependencies with specific flags
RUN npm install --verbose \
    --prefer-offline \
    --no-audit \
    --legacy-peer-deps \
    --force

# Copy the entire project
COPY . .

# Rebuild native dependencies
RUN npm rebuild

# Additional diagnostic step
RUN npm ls rollup || true

# Expose development port
EXPOSE 5173

# Development command
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]