#!/bin/bash
# Generate a batch of 20 blog topics and append to the topic queue.
# Usage: ANTHROPIC_API_KEY=sk-... ./scripts/generate-topics.sh
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TOPIC_FILE="$SCRIPT_DIR/blog-topics.txt"
PROMPT_FILE="$SCRIPT_DIR/topic-gen-prompt.txt"

if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "Error: ANTHROPIC_API_KEY not set"
  exit 1
fi

command -v jq >/dev/null 2>&1 || { echo "Error: jq is required (brew install jq)"; exit 1; }

# Check how many topics remain
REMAINING=0
if [ -s "$TOPIC_FILE" ]; then
  REMAINING=$(wc -l < "$TOPIC_FILE" | tr -d ' ')
fi
echo "Topics remaining in queue: $REMAINING"

echo "Generating 20 new topics..."

PAYLOAD=$(mktemp)
jq -n \
  --rawfile system "$PROMPT_FILE" \
  '{"model":"claude-sonnet-4-5-20250929","max_tokens":4096,"system":$system,"messages":[{"role":"user","content":"Generate 20 blog post topics."}]}' \
  > "$PAYLOAD"

RESPONSE=$(curl -s https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "content-type: application/json" \
  -H "anthropic-version: 2023-06-01" \
  -d @"$PAYLOAD")
rm -f "$PAYLOAD"

CONTENT=$(echo "$RESPONSE" | jq -r '.content[0].text // empty')

if [ -z "$CONTENT" ]; then
  echo "Error: Empty response from API"
  echo "$RESPONSE" | jq .
  exit 1
fi

# Extract just the title from each numbered line (before the | delimiter)
echo "$CONTENT" | grep -E '^[0-9]+\.' | while IFS= read -r line; do
  # Get everything between "N. " and " | KEYWORD:" (the title)
  TITLE=$(echo "$line" | sed 's/^[0-9]*\. //' | sed 's/ *|.*//')
  echo "$TITLE"
done >> "$TOPIC_FILE"

NEW_COUNT=$(wc -l < "$TOPIC_FILE" | tr -d ' ')
echo "Topic queue now has $NEW_COUNT topics."
echo ""
echo "Preview (first 5):"
head -n5 "$TOPIC_FILE"
