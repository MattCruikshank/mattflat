#!/bin/bash

# cd /mnt/disk1/appdata/binhex-minecraftbedrockserver/minecraft/behavior_packs/mattflat
# ./rebuilt_MattFlat.sh

echo "Stopping server..."
docker stop binhex-minecraftbedrockserver
echo "...done"
# read

echo "Removing world data..."
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WORLDS_DIR="$SCRIPT_DIR/../../worlds/MattFlat"

# echo "$SCRIPT_DIR"
# echo "$WORLDS_DIR"

# read

rm -rf "$WORLDS_DIR"/*
echo "...done"

echo "Copying world_behavior_packs.json..."
mkdir -p "$WORLDS_DIR"
cp "$SCRIPT_DIR/world_behavior_packs.json" "$WORLDS_DIR/"
echo "...done"

echo "Starting server..."
docker start binhex-minecraftbedrockserver
echo "...done"
