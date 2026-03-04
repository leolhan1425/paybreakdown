#!/bin/bash
set -e

VPS="root@89.167.19.159"
REMOTE_DIR="/opt/paybreakdown"
SSH_KEY="$HOME/.ssh/id_ed25519_vps"
SSH_OPTS="-i $SSH_KEY"

echo "Building..."
npm run build

echo "Syncing to VPS..."
ssh $SSH_OPTS "$VPS" "mkdir -p $REMOTE_DIR"
rsync -avz --delete -e "ssh $SSH_OPTS" out/ "$VPS:$REMOTE_DIR/out/"

echo "Setting permissions..."
ssh $SSH_OPTS "$VPS" "chown -R bctracker:bctracker $REMOTE_DIR"

echo "Done. Site live at https://pay.hanlabnw.com"
