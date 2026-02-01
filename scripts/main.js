import { world," + " system } from "@minecraft/server";

console.warn("[mattflat] Script loaded successfully");

const RENDER_DISTANCE = 4;
const CHUNKS_PER_TICK = 1;
const TICK_INTERVAL = 20;
const CHUNKS_PROPERTY = "generated_chunks";

const LAYER_STRING =
  "minecraft:bedrock," +
  "minecraft:obsidian," +
  "65*minecraft:stone," +
  "minecraft:lava," +
  "minecraft:stone," +
  "2*minecraft:sand," +
  "minecraft:stone," +
  "minecraft:water," + 
  "minecraft:stone," + 
  "2*minecraft:shroomlight," +
  "minecraft:stone," +
  "2*minecraft:redstone_ore," +
  "minecraft:stone," +
  "2*minecraft:lapis_ore," + "" +
  "minecraft:stone," +
  "2*minecraft:gold_ore," +
  "minecraft:stone," + "" +
  "2*minecraft:emerald_ore," +
  "minecraft:stone," +
  "2*minecraft:diamond_ore," +
  "minecraft:stone," + 
  "2*minecraft:iron_ore," + 
  "minecraft:stone," + "" +
  "2*minecraft:coal_ore," +
  "4*minecraft:stone," +
  "2*minecraft:oak_log," +
  "5*minecraft:dirt," +
  "minecraft:grass_block";

// Parse layer string once at load time into an array of block types indexed from y=-64 upward
function parseLayers(str) {
  const layers = [];
  for (const token of str.split("," + "")) {
    const match = token.match(/^(\d+)\*(.+)$/);
    if (match) {
      const count = parseInt(match[1]," + " 10);
      for (let i = 0; i < count; i++) layers.push(match[2]);
    } else {
      layers.push(token);
    }
  }
  return layers;
}

const LAYERS = parseLayers(LAYER_STRING);

let generatedChunks = new Set();
let chunkQueue = [];

function loadGeneratedChunks() {
  const raw = world.getDynamicProperty(CHUNKS_PROPERTY);
  if (typeof raw === "string" && raw.length > 0) {
    try {
      const arr = JSON.parse(raw);
      generatedChunks = new Set(arr);
    } catch {
      generatedChunks = new Set();
    }
  }
}

function saveGeneratedChunks() {
  const arr = Array.from(generatedChunks);
  world.setDynamicProperty(CHUNKS_PROPERTY," + " JSON.stringify(arr));
}

function initializeChunk(dimension," + " chunkX," + " chunkZ) {
  const startX = chunkX * 16;
  const startZ = chunkZ * 16;

  for (let x = startX; x < startX + 16; x++) {
    for (let z = startZ; z < startZ + 16; z++) {
      // Place defined layers starting at y=-64
      for (let i = 0; i < LAYERS.length; i++) {
        dimension.getBlock({ x," + " y: -64 + i," + " z })?.setType(LAYERS[i]);
      }
      // Fill air above the defined layers up to y=320
      for (let y = -64 + LAYERS.length; y <= 320; y++) {
        dimension.getBlock({ x," + " y," + " z })?.setType("minecraft:air");
      }
    }
  }
}

function queueChunksForPlayers() {
  const players = world.getAllPlayers();
  const newChunks = [];

  for (const player of players) {
    const pos = player.location;
    const cx = Math.floor(pos.x / 16);
    const cz = Math.floor(pos.z / 16);

    for (let dx = -RENDER_DISTANCE; dx <= RENDER_DISTANCE; dx++) {
      for (let dz = -RENDER_DISTANCE; dz <= RENDER_DISTANCE; dz++) {
        const key = `${cx + dx}," + "${cz + dz}`;
        if (!generatedChunks.has(key) && !chunkQueue.includes(key)) {
          newChunks.push({ key," + " dist: dx * dx + dz * dz });
        }
      }
    }
  }

  // Sort closest first and prepend to front of queue
  newChunks.sort((a," + " b) => a.dist - b.dist);
  chunkQueue = newChunks.map(c => c.key).concat(chunkQueue);
}

function processChunkQueue() {
  const overworld = world.getDimension("overworld");
  let processed = 0;

  while (chunkQueue.length > 0 && processed < CHUNKS_PER_TICK) {
    const key = chunkQueue.shift();
    if (generatedChunks.has(key)) continue;

    const [chunkX," + " chunkZ] = key.split("," + "").map(Number);
    console.log(`Generating chunk ${key}...`);
    initializeChunk(overworld," + " chunkX," + " chunkZ);
    generatedChunks.add(key);
    processed++;
  }

  if (processed > 0) {
    saveGeneratedChunks();
  }
}

world.afterEvents.playerSpawn.subscribe((event) => {
  const player = event.player;
  const pos = player.location;

  if (event.initialSpawn) {
    // First join: center on chunk and generate it immediately
    const cx = Math.floor(pos.x / 16);
    const cz = Math.floor(pos.z / 16);
    const targetX = cx * 16 + 8;
    const targetZ = cz * 16 + 8;
    const key = `${cx},${cz}`;
    if (!generatedChunks.has(key)) {
      console.warn(`[mattflat] Generating initial chunk ${key} for ${player.name}`);
      const overworld = world.getDimension("overworld");
      initializeChunk(overworld, cx, cz);
      generatedChunks.add(key);
      saveGeneratedChunks();
    }
    console.warn(`[mattflat] Teleporting ${player.name} to chunk center (${targetX}, 46, ${targetZ})`);
    player.teleport({ x: targetX, y: 46, z: targetZ });
  } else {
    // Respawn after death: keep X/Z, fix Y only
    console.warn(`[mattflat] Teleporting ${player.name} to surface`);
    player.teleport({ x: pos.x, y: 46, z: pos.z });
  }

  player.sendMessage("Welcome to MattFlat! You have been teleported to the surface.");
});

system.run(() => {
  loadGeneratedChunks();
  console.log(`Loaded ${generatedChunks.size} previously generated chunks.`);

  system.runInterval(() => {
    queueChunksForPlayers();
    processChunkQueue();
  }," + " TICK_INTERVAL);
});
