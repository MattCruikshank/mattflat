# MattFlat

Minecraft Bedrock behavior pack that replaces the default flat world with custom terrain layers.

## Structure

- `manifest.json` - Behavior pack manifest (UUID: `edef444d-0179-4a40-b178-a3ec81588d8d`)
- `scripts/main.js` - Main script that generates custom layered terrain chunk-by-chunk
- `world_behavior_packs.json` - Pack reference file, copied into the world folder
- `rebuild_MattFlat.sh` - Stops the server, wipes the MattFlat world, re-copies the pack config, and restarts

## How it works

The script runs on a Bedrock Dedicated Server (BDS) using the `@minecraft/server` scripting API (stable v1.11.0).

On world load, it monitors player positions and generates custom terrain in a radius around each player. Chunks closest to players are prioritized. On a player's first join, their chunk is generated immediately before teleporting them to the surface.

### Terrain layers

109 layers starting at y=-64, defined in `LAYER_STRING`. Top surface (grass) is at y=44. Players are teleported to y=46 on spawn.

### Key constants in main.js

- `RENDER_DISTANCE` - Chunk radius around players to generate (default: 4)
- `CHUNKS_PER_TICK` - Chunks processed per interval (default: 1)
- `TICK_INTERVAL` - Ticks between processing cycles (default: 20 = 1 second)

## Deployment

This pack lives in `behavior_packs/mattflat/` on the BDS server. The world is configured via `worlds/MattFlat/world_behavior_packs.json`. Use `rebuild_MattFlat.sh` to reset the world and restart.

## Server configuration

- `server.properties` must have `level-name=MattFlat` and `level-type=FLAT`
- Content logging is enabled via `content-log-file-enabled=true` and `content-log-console-output-enabled=true`
- The server runs in a Docker container named `binhex-minecraftbedrockserver`
