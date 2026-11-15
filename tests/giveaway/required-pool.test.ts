import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { requiredPool, MIN_DRAW_POOL } from "../../lib/giveawayFilters";

describe("requiredPool", () => {
    it("never lets a draw run with a single person", () => {
        assert.equal(MIN_DRAW_POOL, 2);
        assert.equal(requiredPool(1), 2);
        assert.equal(requiredPool(1, 0), 2);
    });

    it("needs room for every winner and backup", () => {
        assert.equal(requiredPool(3, 2), 5);
        assert.equal(requiredPool(1, 1), 2);
    });
});
