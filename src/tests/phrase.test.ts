import { PhraseResult, Alternative, Phrase } from "../phrase";
import { Effect, EffectComponent, EffectDirection, EffectKind, EffectStrength } from "npc-emotional";
import { Sentence, Function, Cardinality, Individual } from "first-order-logic";
import { RelationFactory, RelationKind } from "npc-relations";
import { Roles } from "../roles";
import { generateAgent } from "./agentBuilder";
import { Crowd, Desire } from "../agent";

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

describe("Alternative should", () => {
    it("throw error when incorrect input", () => {
        expect(() => new Alternative(null)).toThrowError();
    });

    it("create a valid instance", () => {
        let alternative = new Alternative(
            roles => "Hello",
            roles => Effect.null(),
            roles => Sentence.build("A")
        );

        let roles = new Roles();

        expect(alternative.text(roles)).toBe("Hello");
        expect(alternative.effect(roles).isNull).toBe(true);
        expect(alternative.sentence(roles).equals(Sentence.build("A"))).toBe(true);
    });
});

describe("Phrase should", () => {
    it("throw error when wrong input", () => {
        expect(() => new Phrase(null)).toThrowError();
        expect(() => new Phrase("")).toThrowError();
        expect(() => new Phrase("   ")).toThrowError();
        expect(() => new Phrase("performer", "")).toThrowError();
        expect(() => new Phrase("performer", "     ")).toThrowError();
    });

    it("create a valid instance", () => {
        let phrase = new Phrase("performer", "receiver")
            .withAlternative((roles) => "[performer]: - Hello.")
            .withAlternative((roles) => "[performer]: - Hi.");

        let roles = new Roles();

        expect(phrase.performerRole).toBe("performer");
        expect(phrase.targetRole).toBe("receiver");
        expect(phrase.isIntimate).toBe(false);
        expect(phrase.isMultialternative).toBe(true);
        expect(phrase.allAlternatives(roles).length).toBe(2);
        expect(phrase.allAlternatives(roles)[0]).toBe("[performer]: - Hello.");
        expect(phrase.allAlternatives(roles)[1]).toBe("[performer]: - Hi.");

        phrase.intimate();
        expect(phrase.isIntimate).toBe(true);
    });

    it("return single alternative in action", () => {
        let phrase = new Phrase("performer", "receiver")
            .withAlternative((roles) => "[performer]:Hello [receiver].");

        let agent1 = generateAgent("First");
        let agent2 = generateAgent("Second");
        let roles = new Roles();
        roles.match("performer", agent1);
        roles.match("receiver", agent2);

        let crowd = new Crowd([ agent1, agent2 ]);

        let alternative = phrase.action(roles, crowd);

        expect(alternative.content).toBe("First: - Hello Second.");
    });

    it("return indexed alternative in action", () => {
        let phrase = new Phrase("performer", "receiver")
            .withAlternative((roles) => "[performer]:Hello [receiver].")
            .withAlternative((roles) => "[performer]:Hi [receiver].");

        let agent1 = generateAgent("First");
        let agent2 = generateAgent("Second");
        let roles = new Roles();
        roles.match("performer", agent1);
        roles.match("receiver", agent2);

        let crowd = new Crowd([ agent1, agent2 ]);

        let alternative = phrase.action(roles, crowd, 1);

        expect(alternative.content).toBe("First: - Hi Second.");
    });

    it("return single alternative in action with effect and sentence", () => {
        let phrase = new Phrase("performer", "receiver")
            .withAlternative(
                (roles) => "[performer]:Hello [receiver].",
                (roles) => new Effect("receiver", [ EffectComponent.positive(EffectKind.Happiness, EffectStrength.Medium) ]),
                (roles) => Sentence.build("Moon"));

        let agent1 = generateAgent("First");
        let agent2 = generateAgent("Second");
        let roles = new Roles();
        roles.match("performer", agent1);
        roles.match("receiver", agent2);

        let crowd = new Crowd([ agent1, agent2 ]);

        let alternative = phrase.action(roles, crowd);

        expect(alternative.content).toBe("First: - Hello Second.");
        expect(alternative.effect.direction).toBe(EffectDirection.Positive);
        expect(alternative.effect.components.length).toBe(1);
        expect(alternative.effect.components[0].kind).toBe(EffectKind.Happiness);
        expect(alternative.sentence.equals(Sentence.build("Moon"))).toBe(true);
    });

    it("return single alternative in action based on emotions", () => {
        let phrase = new Phrase("performer", "receiver")
            .withAlternative(
                (roles) => "[performer]:Nice [receiver].",
                (roles) => new Effect("receiver", [ EffectComponent.positive(EffectKind.Happiness, EffectStrength.Medium) ]),
                (roles) => Sentence.build("Moon"))
            .withAlternative(
                (roles) => "[performer]:Bad [receiver].",
                (roles) => new Effect("receiver", [ EffectComponent.negative(EffectKind.Happiness, EffectStrength.Medium) ]),
                (roles) => Sentence.build("Moon"));

        let agent1 = generateAgent("First");
        let agent2 = generateAgent("Second");
        agent1.Relations.add("Second", RelationFactory.get(RelationKind.Worst));
        agent2.Relations.add("First", RelationFactory.get(RelationKind.Worst));

        let roles = new Roles();
        roles.match("performer", agent1);
        roles.match("receiver", agent2);

        let crowd = new Crowd([ agent1, agent2 ]);

        let alternative = phrase.action(roles, crowd);

        expect(alternative.content).toBe("First: - Bad Second.");
    });

    it("return single alternative in action based on heuristic", () => {
        let phrase = new Phrase("performer", "receiver")
            .withAlternative(
                (roles) => "[performer]:Nice [receiver].",
                (roles) => new Effect("receiver", [ EffectComponent.positive(EffectKind.Happiness, EffectStrength.Medium) ]),
                (roles) => Sentence.build("Moon"))
            .withAlternative(
                (roles) => "[performer]:Bad [receiver].",
                (roles) => new Effect("receiver", [ EffectComponent.negative(EffectKind.Happiness, EffectStrength.Medium) ]),
                (roles) => Sentence.build("Moon"));

        let agent1 = generateAgent("First");
        let agent2 = generateAgent("Second");

        agent1.Desires.append(new Desire(
            (crowd) => crowd.get("Second").Happiness.value * -1,
            [ "Second" ]
        ));

        let roles = new Roles();
        roles.match("performer", agent1);
        roles.match("receiver", agent2);

        let crowd = new Crowd([ agent1, agent2 ]);

        let alternative = phrase.action(roles, crowd);

        expect(alternative.content).toBe("First: - Bad Second.");
    });
});