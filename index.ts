import { Hono } from "hono";
import { VeSync } from "tsvesync";
import { VeSyncFan } from "tsvesync/dist/lib/vesyncFan";

const hostname = process.env.HOSTNAME;
const port = Number(process.env.PORT);

const email = process.env.EMAIL;
const password = process.env.PASSWORD;

const uuid = process.env.UUID;

if (!hostname || !port || !email || !password || !uuid) {
  console.error(
    "Please provide HOSTNAME and PORT and EMAIL and PASSWORD and UUID in the .env file",
  );
  process.exit(1);
}

const manager = new VeSync(email, password, "Asia/Tokyo", {
  countryCode: "JP",
});

console.info("[INFO] Logging in...");
await manager.login();
console.info("[INFO] Login successful!");

console.info("[INFO] Fetching devices...");
await manager.update();
if (!manager.devices) throw Error("[ERROR] Devices not found!");

console.info("\n\n");

const fan = await getFan(manager);
console.info("[INFO] Specific device found!");

fan.display();
console.info("[INFO] CID: " + fan.cid);
console.info("[INFO] UUID: " + fan.uuid);

const app = new Hono();

app.get("/", async (c) => {
  return c.text(fan.displayJSON());
});
app.get("/air-quality", async (c) => {
  return c.text(fan.airQualityValue.toString());
});
app.get("/filter-life", async (c) => {
  return c.text(fan.filterLife.toString());
});

app.get("/power", async (c) => {
  return c.text(fan.deviceStatus);
});
app.all("/power/:power", async (c) => {
  const power = c.req.param("power");

  console.info(
    "[INFO] Changing fan power to " + power + " for device " + fan.deviceName,
  );

  if (power === "on") {
    await fan.turnOn();
  } else {
    await fan.turnOff();
  }
  return c.text("OK");
});

app.get("/speed", async (c) => {
  return c.text(fan.speed.toString());
});
app.get("/speed-min", (c) => {
  return c.text("1");
});
app.get("/speed-max", (c) => {
  return c.text(fan.getMaxFanSpeed().toString());
});
app.all("/speed/:speed", async (c) => {
  const speed = c.req.param("speed");
  // log by vesync library
  switch (speed) {
    case "max":
      await fan.changeFanSpeed(fan.getMaxFanSpeed());
      break;
    case "min":
      await fan.changeFanSpeed(1);
      break;
    default:
      await fan.changeFanSpeed(Number(speed));
  }
  return c.text("OK");
});

app.get("/mode", async (c) => {
  return c.text(fan.mode);
});
app.all("/mode/:mode", async (c) => {
  const mode = c.req.param("mode");

  console.info(
    "[INFO] Changing fan mode to " + mode + " for device " + fan.deviceName,
  );

  await fan.setMode(mode);
  return c.text("OK");
});

async function getFan(manager: VeSync): Promise<VeSyncFan> {
  if (manager.fans) {
    const fan = manager.fans.find((d) => d.uuid === uuid);
    if (fan && fan instanceof VeSyncFan) {
      return fan;
    }
  }

  throw new Error("[ERROR] Device not found!");
}

export default {
  hostname,
  port,
  fetch: app.fetch,
};
