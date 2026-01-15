FROM node:22-alpine

ARG ENV_MODE
ENV ENV_MODE $ENV_MODE

ARG JWT_SECRET
ENV JWT_SECRET $JWT_SECRET

ARG DATABASE_URL
ENV DATABASE_URL $DATABASE_URL

RUN apk add --no-cache bash curl

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

RUN npm run prisma:deploy
RUN npm run generate

RUN if [ "$ENV_MODE" = "production" ] ; then yarn build ; fi

# Expose ports
EXPOSE 3000 4000
