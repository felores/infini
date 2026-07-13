import assert from "node:assert/strict";
import test from "node:test";

import { redactAgentLog } from "../src/agents.js";

test("redacts credentials from agent stderr", () => {
    const result = redactAgentLog("Authorization: Bearer secret-token\napi_key=sk-example123456\nToken: local-secret\n/path/to/workspace");

    assert.equal(result.includes("secret-token"), false);
    assert.equal(result.includes("sk-example123456"), false);
    assert.equal(result.includes("local-secret"), false);
    assert.equal(result.includes("/path/to/workspace"), true);
});
