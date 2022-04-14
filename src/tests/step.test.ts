import { Choices, Step } from "../step";
import { StringBuilder } from "builder-of-strings";
import { Reactions } from "npc-emotional";

describe("Choices should", () => {
    it("throw error when incorrect input", () => {
        expect(() => new Choices(null)).toThrowError();
        expect(() => new Choices([])).toThrowError();
    });

    it("create valid choices", () => {
        let choices = new Choices([ "first", "second" ]);

        expect(choices.count).toBe(2);
        expect(choices.isValidItem(-1)).toBe(false);
        expect(choices.isValidItem(0)).toBe(true);
        expect(choices.isValidItem(1)).toBe(true);
        expect(choices.isValidItem(2)).toBe(false);

        expect(choices.toString()).toBe(`${StringBuilder.Line}[0 - first]${StringBuilder.Line}[1 - second]`);
    });
});

describe("Step should", () => {
    it("throw exception if wrong input", () => {
        expect(() => Step.fromContent(null)).toThrowError();
        expect(() => Step.fromContent("")).toThrowError();
        expect(() => Step.fromContent(" ")).toThrowError();
        expect(() => Step.fromContent("      ")).toThrowError();
        expect(() => Step.fromChoices(null)).toThrowError();
        expect(() => Step.fromChoices([])).toThrowError();
    });

    it("be created from content", () => {
        let step = Step.fromContent("content", true);

        expect(step.content).toBe(`content`);
        expect(step.isEnder).toBe(true);
        expect(step.hasChoices).toBe(false);
        expect(step.hasReactions).toBe(false);

        step.append("more");

        expect(step.content.toString()).toBe(`content${StringBuilder.Line}more`);
    });

    it("be created from choices", () => {
        let step = Step.fromChoices(["first", "second"]);

        expect(step.content).toBe("");
        expect(step.isEnder).toBe(false);
        expect(step.hasChoices).toBe(true);
        expect(step.hasReactions).toBe(false);

        expect(step.toString()).toBe(`${StringBuilder.Line}[0 - first]${StringBuilder.Line}[1 - second]`);
    });

    it("be created from reactions", () => {
        let step = Step.fromReactions(new Reactions());

        expect(step.content).toBe("");
        expect(step.isEnder).toBe(false);
        expect(step.hasChoices).toBe(false);
        expect(step.hasReactions).toBe(true);

        expect(step.reactions.any).toBe(false);
    });
});