#!/bin/bash
# Generate one blog post from the topic queue via Claude API.
#
# Usage:
#   ANTHROPIC_API_KEY=sk-... ./scripts/generate-blog.sh              # generate only
#   ANTHROPIC_API_KEY=sk-... ./scripts/generate-blog.sh --deploy     # generate + build + deploy
#   ANTHROPIC_API_KEY=sk-... ./scripts/generate-blog.sh --drafts     # save to drafts/ for review
#
# Cron example (every Monday 9am):
#   0 9 * * 1 ANTHROPIC_API_KEY=sk-... /Users/hanl/projects/paybreakdown/scripts/generate-blog.sh --deploy >> /tmp/salaryhog-blog.log 2>&1
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BLOG_DIR="$PROJECT_DIR/content/blog"
DRAFTS_DIR="$PROJECT_DIR/content/drafts"
TOPIC_FILE="$SCRIPT_DIR/blog-topics.txt"
SYSTEM_PROMPT_FILE="$SCRIPT_DIR/salaryhog-system-prompt.txt"
DATE=$(date +%Y-%m-%d)

# --- Preflight checks ---

if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "Error: ANTHROPIC_API_KEY not set"
  exit 1
fi

command -v jq >/dev/null 2>&1 || { echo "Error: jq is required (brew install jq)"; exit 1; }

if [ ! -s "$TOPIC_FILE" ]; then
  echo "Error: No topics in $TOPIC_FILE"
  echo "Run ./scripts/generate-topics.sh first to fill the queue."
  exit 1
fi

# --- Pull next topic ---

TOPIC=$(head -n1 "$TOPIC_FILE")
# Remove used topic from queue
tail -n +2 "$TOPIC_FILE" > "$TOPIC_FILE.tmp" && mv "$TOPIC_FILE.tmp" "$TOPIC_FILE"

REMAINING=$(wc -l < "$TOPIC_FILE" | tr -d ' ')
echo "[$DATE] Generating: $TOPIC"
echo "Topics remaining: $REMAINING"

if [ "$REMAINING" -le 3 ]; then
  echo "Warning: Only $REMAINING topics left. Run generate-topics.sh soon."
fi

# --- Call Claude API ---

PAYLOAD=$(mktemp)
jq -n \
  --rawfile system "$SYSTEM_PROMPT_FILE" \
  --arg topic "Today's date is $DATE. Write a blog post about: $TOPIC" \
  '{"model":"claude-sonnet-4-5-20250929","max_tokens":4096,"system":$system,"messages":[{"role":"user","content":$topic}]}' \
  > "$PAYLOAD"

RESPONSE=$(curl -s https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "content-type: application/json" \
  -H "anthropic-version: 2023-06-01" \
  -d @"$PAYLOAD")
rm -f "$PAYLOAD"

# --- Extract and clean content ---

CONTENT=$(echo "$RESPONSE" | jq -r '.content[0].text // empty')

if [ -z "$CONTENT" ]; then
  echo "Error: Empty response from API"
  echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
  # Put the topic back at the top of the queue
  { echo "$TOPIC"; cat "$TOPIC_FILE"; } > "$TOPIC_FILE.tmp" && mv "$TOPIC_FILE.tmp" "$TOPIC_FILE"
  echo "Topic returned to queue."
  exit 1
fi

# Strip code fences if model wraps response in ```markdown ... ```
CONTENT=$(echo "$CONTENT" | sed -E '1{/^```/d;}' | sed -E '${/^```$/d;}')

# Force correct date in frontmatter (model may hallucinate dates)
CONTENT=$(echo "$CONTENT" | sed -E "s/^date: *\"[0-9]{4}-[0-9]{2}-[0-9]{2}\"/date: \"$DATE\"/")

# --- Extract slug from frontmatter ---

SLUG=$(echo "$CONTENT" | sed -n '/^---$/,/^---$/p' | grep -m1 '^slug:' | sed -E 's/slug: *"?([^"]*)"?/\1/' | xargs)

if [ -z "$SLUG" ]; then
  # Fallback: generate slug from topic
  SLUG=$(echo "$TOPIC" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')
fi

# --- Save ---

if [ "$1" = "--drafts" ]; then
  mkdir -p "$DRAFTS_DIR"
  OUTPUT_FILE="$DRAFTS_DIR/$SLUG.md"
  echo "$CONTENT" > "$OUTPUT_FILE"
  echo "Saved draft: $OUTPUT_FILE"
  echo "Review and move to content/blog/ when ready."
  exit 0
fi

OUTPUT_FILE="$BLOG_DIR/$SLUG.md"
echo "$CONTENT" > "$OUTPUT_FILE"
echo "Saved: $OUTPUT_FILE"

# --- Auto-replenish topics if running low ---

if [ "$REMAINING" -le 3 ]; then
  echo "Auto-replenishing topic queue..."
  bash "$SCRIPT_DIR/generate-topics.sh"
fi

# --- Build and deploy ---

if [ "$1" = "--deploy" ]; then
  echo "Deploying..."
  cd "$PROJECT_DIR"
  bash deploy.sh
  echo "Live at https://salaryhog.com/blog/$SLUG"
fi

echo "Done: $SLUG"
