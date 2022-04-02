import { PhraseResult } from "../phrase";
import { Effect, EffectComponent, EffectKind, EffectStrength } from "npc-emotional";
import { Sentence, Function, Cardinality, Individual } from "first-order-logic";

describe("PhraseResult should", () => {
    it("throw error if wrong input", () => {
        expect(() => new PhraseResult(null, new Effect("target", [
            EffectComponent.positive(EffectKind.Friend, EffectStrength.High)
        ]))).toThrowError();
        expect(() => new PhraseResult("content", null)).toThrowError();
    });

    it("create phrase result without sentence", () => {
        let result = new PhraseResult("content", new Effect("target", [
            EffectComponent.positive(EffectKind.Friend, EffectStrength.High)
        ]));

        expect(result.content).toBe("content");
        expect(result.effect.target).toBe("target");
        expect(result.effect.components.length).toBe(1);
        expect(result.hasSentence).toBe(false);
        expect(result.sentence).toBe(null);
    });

    it("create phrase result with sentence", () => {
        let result = new PhraseResult("content", new Effect("target", [
            EffectComponent.positive(EffectKind.Friend, EffectStrength.High)
        ]),
        Sentence.build("A", "First", "Second"));

        expect(result.content).toBe("content");
        expect(result.effect.target).toBe("target");
        expect(result.effect.components.length).toBe(1);
        expect(result.hasSentence).toBe(true);
        expect(result.sentence
            .equals(new Sentence(
                new Function("A", Cardinality.Two), 
                new Individual("First"), 
                new Individual("Second"))))
                .toBe(true);
    });
});