import fs from "node:fs/promises";
import path from "node:path";

const SOURCE_BASE = "https://raw.githubusercontent.com/666OS/rules/release/mihomo";

const DOMAIN_RULES = [
    "Tracking",
    "Advertising",
    "Direct",
    "LocationDKS",
    "Private",
    "Download",
    "Speedtest",
    "AI",
    "Telegram",
    "Twitter",
    "SocialMedia",
    "NewsMedia",
    "Games",
    "Crypto",
    "Netflix",
    "YouTube",
    "XPTV",
    "Emby",
    "Streaming",
    "AppleCN",
    "Apple",
    "Google",
    "Microsoft",
    "Facebook",
    "Proxy",
    "China",
];

const IP_RULES = [
    "Advertising",
    "Private",
    "AI",
    "Telegram",
    "SocialMedia",
    "XPTV",
    "Emby",
    "Netflix",
    "Streaming",
    "Google",
    "Facebook",
    "Proxy",
    "China",
];

const outputRoot = path.resolve(process.argv[2] || "rules/666OS");

async function downloadRule(kind, name) {
    const url = `${SOURCE_BASE}/${kind}/${name}.mrs`;
    const targetPath = path.join(outputRoot, kind, `${name}.mrs`);
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to download ${url}: HTTP ${response.status}`);
    }

    const data = Buffer.from(await response.arrayBuffer());
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(targetPath, data);
    console.log(`[mirror] ${kind}/${name}.mrs ${data.length} bytes`);
}

await fs.rm(outputRoot, { recursive: true, force: true });

for (const name of DOMAIN_RULES) {
    await downloadRule("domain", name);
}

for (const name of IP_RULES) {
    await downloadRule("ip", name);
}

console.log(`[mirror] wrote ${DOMAIN_RULES.length + IP_RULES.length} files to ${outputRoot}`);
