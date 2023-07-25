#!/bin/bash

# Check if Node.js is installed
if ! command -v node >/dev/null 2>&1; then
    echo "Node.js is not installed. Please install it from https://nodejs.org/ and run this script again."
    exit 1
fi

# Check if npm is installed. If the user has installed Node.js, they should have npm as well, but this provides more specific error message if they somehow don't.
if ! command -v npm >/dev/null 2>&1; then
    echo "npm is not installed. Please install it from https://nodejs.org/ and run this script again."
    exit 1
fi

# Install project dependencies
echo "Installing project dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "An error occurred while installing the project dependencies."
    exit 1
fi

# Compile TypeScript to JavaScript
echo "Compiling TypeScript to JavaScript..."
npx tsc
if [ $? -ne 0 ]; then
    echo "An error occurred while compiling TypeScript."
    exit 1
fi

# Run the JavaScript code
echo "Running JavaScript code..."
node dist/index.js
if [ $? -ne 0 ]; then
    echo "An error occurred while running the JavaScript code."
    exit 1
fi

echo "Success! Your feed URLs have been generated."
