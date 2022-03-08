FROM node:14-alpine

WORKDIR /app

# copy package.json
COPY package.json ./

# Restore modules and install pm2
RUN npm install
RUN npm i -g pm2

# Add build to container
ADD ./dist/apps/api-gateway /app
RUN ls -lah

EXPOSE 80 8080

# Provide KEYMETRICS_PUBLIC KEYMETRICS_SECRET for monitoring
CMD ["pm2-runtime", "start", "/app/main.js"]
