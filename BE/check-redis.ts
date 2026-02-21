import redis from "./src/dbs/redis";

async function run() {
  const keys = await redis.keys("online:user:*");
  console.log("Found keys:", keys);
  process.exit(0);
}

run();
