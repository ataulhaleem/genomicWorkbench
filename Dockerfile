# Use the official Node.js 14 image as the base
FROM node:18.13.0

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install application dependencies
RUN npm install --force

# Copy the application code to the working directory
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the desired port (e.g., 3000)
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "run", "start"]
