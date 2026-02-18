#!/bin/sh

set -e

OUTPUT_DIR=.vercel/output
INDEX_FUNCTION_DIR=${OUTPUT_DIR}/functions/index.func

#=============================================================================#
# Set up project
#=============================================================================#

rm -rf "${OUTPUT_DIR}"
mkdir -p "${OUTPUT_DIR}"

echo '
{
  "version": 3,
  "routes": [
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index"
    }
  ]
}
' > "${OUTPUT_DIR}/config.json"

#=============================================================================#
# Create server function
#=============================================================================#

pnpm install
pnpm --filter=server build:vercel

mkdir -p "${INDEX_FUNCTION_DIR}"
cp -v ./apps/server/dist/* "${INDEX_FUNCTION_DIR}"
echo '{ "type": "module" }' > "${INDEX_FUNCTION_DIR}/package.json"

echo '
{
  "runtime": "nodejs22.x",
  "handler": "vercel.js",
  "launcherType": "Nodejs"
}
' > "${INDEX_FUNCTION_DIR}/.vc-config.json"

#=============================================================================#
# Deploy server
#=============================================================================#

pnpm vercel deploy --prebuilt --prod