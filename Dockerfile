FROM oven/bun

WORKDIR /app

# Install MySQL client tools
RUN apt-get update && apt-get install -y \
    default-mysql-client \
    && rm -rf /var/lib/apt/lists/*

COPY package.json bun.lockb ./

RUN bun install --frozen-lockfile

COPY . .

# Create databases directory
RUN mkdir -p /app/databases

ENV HOST=0.0.0.0
ENV PORT=4321

EXPOSE 4321

CMD ["bun", "dev"]
