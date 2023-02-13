FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY dist .
COPY package*.json ./
COPY public ./public
COPY views ./views
COPY db ./db

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
# COPY . .

ENV NODE_ENV=production

EXPOSE 3000
CMD [ "node", "server.js" ]