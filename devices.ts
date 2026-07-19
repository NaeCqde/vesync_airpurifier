import { VeSync } from "tsvesync";

const email = process.env.EMAIL;
const password = process.env.PASSWORD;

if (!email || !password) {
    console.error("Please provide EMAIL and PASSWORD in the .env file");
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
if (!manager.devices) throw new Error("[ERROR] Devices not found!");

console.info("[INFO] Devices:");
for (const d of manager.devices) {
    d.display();
    console.info(`[INFO] UUID: ${d.uuid}\n`);
}
