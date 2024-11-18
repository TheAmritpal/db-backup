FROM oven/bun

WORKDIR /app

COPY package.json bun.lockb ./

RUN bun install --frozen-lockfile

COPY . .

ENV HOST=0.0.0.0
ENV PORT=4321

EXPOSE 4321

CMD ["bun", "dev"]