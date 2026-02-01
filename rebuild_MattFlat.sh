#!/bin/bash
echo "Stopping server..."
docker stop binhex-minecraftbedrockserver
echo "...done"
# read

echo "Removing world data..."
rm -rf minecraft/worlds/MattFlat/*
echo "...done"
# read

echo "Copying world_behavior_packs.json..."
mkdir -p minecraft/worlds/MattFlat
cp minecraft/behavior_packs/mattflat/world_behavior_packs.json minecraft/worlds/MattFlat/
echo "...done"
# read

echo "Starting server..."
docker start binhex-minecraftbedrockserver
echo "...done"

