import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const rulesPath = path.join(repoRoot, "src", "rules.ts");
const userRulesPath = path.join(repoRoot, "custom", "user-rules.json");

const CUSTOM_BLOCK_START = "// CUSTOM_USER_RULES_START";
const CUSTOM_BLOCK_END = "// CUSTOM_USER_RULES_END";
const CUSTOM_SPREAD = "    ...customRules,";

function readUserRules() {
    const raw = readFileSync(userRulesPath, "utf8");
    const rules = JSON.parse(raw);
    if (!Array.isArray(rules)) {
        throw new Error("custom/user-rules.json must contain an array");
    }
    return rules;
}

function formatTarget(target) {
    if (target === "DIRECT" || target === "REJECT" || target === "REJECT-DROP") {
        return target;
    }
    if (!/^[A-Z0-9_]+$/.test(target)) {
        throw new Error(`Invalid proxy group target: ${target}`);
    }
    return `\${PROXY_GROUPS.${target}}`;
}

function formatRule(rule) {
    const { type, value, target } = rule;
    if (typeof type !== "string" || typeof value !== "string" || typeof target !== "string") {
        throw new Error(`Invalid user rule: ${JSON.stringify(rule)}`);
    }
    if (!/^[A-Z-]+$/.test(type)) {
        throw new Error(`Invalid rule type: ${type}`);
    }
    return `    \`${type},${value},${formatTarget(target)}\`,`;
}

function buildCustomBlock(rules) {
    return [
        "const customRules = [",
        `    ${CUSTOM_BLOCK_START}`,
        ...rules.map(formatRule),
        `    ${CUSTOM_BLOCK_END}`,
        "];",
    ].join("\n");
}

function replaceOrInsertCustomBlock(source, block) {
    const pattern = new RegExp(
        String.raw`const customRules = \[\n\s*${CUSTOM_BLOCK_START}[\s\S]*?\n\s*${CUSTOM_BLOCK_END}\n\];`
    );
    if (pattern.test(source)) {
        return source.replace(pattern, block);
    }

    return source.replace(
        'import { PROXY_GROUPS } from "./constants";\n',
        `import { PROXY_GROUPS } from "./constants";\n\n${block}\n`
    );
}

function ensureCustomSpread(source) {
    if (source.includes(CUSTOM_SPREAD)) {
        return source;
    }

    const insertionPoint = '    `RULE-SET,XPTVIP,DIRECT,no-resolve`,\n';
    if (source.includes(insertionPoint)) {
        return source.replace(insertionPoint, `${insertionPoint}\n${CUSTOM_SPREAD}\n`);
    }

    const baseRulesStart = "const baseRules = [\n";
    if (!source.includes(baseRulesStart)) {
        throw new Error("Could not find baseRules array in src/rules.ts");
    }
    return source.replace(baseRulesStart, `${baseRulesStart}${CUSTOM_SPREAD}\n`);
}

function removeInlineUserRules(source, rules) {
    let output = source;
    for (const rule of rules) {
        const target = formatTarget(rule.target);
        const inlineRule = `    \`${rule.type},${rule.value},${target}\`,\n`;
        output = output.replace(inlineRule, "");
    }
    return output;
}

const userRules = readUserRules();
let source = readFileSync(rulesPath, "utf8");
source = removeInlineUserRules(source, userRules);
source = replaceOrInsertCustomBlock(source, buildCustomBlock(userRules));
source = ensureCustomSpread(source);
writeFileSync(rulesPath, source, "utf8");

console.log(`Applied ${userRules.length} custom user rules to src/rules.ts`);
