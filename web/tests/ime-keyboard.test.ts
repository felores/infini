import { describe, expect, it } from "vitest";

import { isImeComposing, isPlainEnterKey } from "../src/lib/keyboard-event";

type KeyboardEventLike = Parameters<typeof isPlainEnterKey>[0];

function enterEvent(overrides: Partial<KeyboardEventLike> = {}): KeyboardEventLike {
    return {
        key: "Enter",
        shiftKey: false,
        ctrlKey: false,
        metaKey: false,
        ...overrides,
    };
}

describe("isPlainEnterKey", () => {
    it("submits on plain Enter", () => {
        expect(isPlainEnterKey(enterEvent())).toBe(true);
    });
    it("does not submit on Shift+Enter", () => {
        expect(isPlainEnterKey(enterEvent({ shiftKey: true }))).toBe(false);
    });
    it("does not submit on Ctrl+Enter", () => {
        expect(isPlainEnterKey(enterEvent({ ctrlKey: true }))).toBe(false);
    });
    it("does not submit on Meta+Enter", () => {
        expect(isPlainEnterKey(enterEvent({ metaKey: true }))).toBe(false);
    });
    it("does not submit on IME composition Enter", () => {
        expect(isPlainEnterKey(enterEvent({ nativeEvent: { isComposing: true } }))).toBe(false);
    });
    it("does not submit on legacy IME Enter", () => {
        expect(isPlainEnterKey(enterEvent({ nativeEvent: { keyCode: 229 } }))).toBe(false);
    });
    it("does not submit on non-Enter keys", () => {
        expect(isPlainEnterKey(enterEvent({ key: "a" }))).toBe(false);
    });
});

describe("isImeComposing", () => {
    it("detects direct composition flag", () => {
        expect(isImeComposing(enterEvent({ isComposing: true }))).toBe(true);
    });
    it("detects native composition flag", () => {
        expect(isImeComposing(enterEvent({ nativeEvent: { isComposing: true } }))).toBe(true);
    });
    it("detects direct legacy keyCode composition", () => {
        expect(isImeComposing(enterEvent({ keyCode: 229 }))).toBe(true);
    });
    it("detects native legacy keyCode composition", () => {
        expect(isImeComposing(enterEvent({ nativeEvent: { keyCode: 229 } }))).toBe(true);
    });
    it("returns false for plain Enter", () => {
        expect(isImeComposing(enterEvent())).toBe(false);
    });
});
