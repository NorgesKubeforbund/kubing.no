FROM node:20 AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm i

COPY . .

RUN npm run build

FROM node:20 AS runner

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm i --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "start"]
