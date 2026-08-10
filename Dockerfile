FROM node:20 AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm clean-install

COPY . .

RUN npm run build

FROM node:20 AS runner

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm clean-install --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./

EXPOSE 3000

CMD ["npm", "start"]
