#!/bin/bash

# Ensure script fails on any error
set -e

# Start test environment with build and logs
docker compose -f docker-compose.test.yml up \
  --build \
  --abort-on-container-exit \
  --exit-code-from test \
  --remove-orphans \
  --force-recreate

# Clean up
docker compose -f docker-compose.test.yml down -v