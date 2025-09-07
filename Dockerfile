# Stage 1: Build the React application
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package.json bun.lockb ./
# Using npm install, adjust if you strictly use bun
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the application
RUN npm run build

EXPOSE 80

CMD ["npm", "run", "preview"]
