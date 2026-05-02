#!/bin/sh

# Replace the placeholder with the actual environment variable in the built JS files
echo "Injecting runtime environment variables..."

if [ -n "$GEMINI_API_KEY" ]; then
    find /usr/share/nginx/html/assets -type f -name "*.js" -exec sed -i "s|___GEMINI_API_KEY_PLACEHOLDER___|${GEMINI_API_KEY}|g" {} +
    echo "Injected GEMINI_API_KEY."
else
    echo "Warning: GEMINI_API_KEY is not set!"
fi

# Execute the CMD from the Dockerfile
exec "$@"
