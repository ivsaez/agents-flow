import { Agents } from "../agent";
import { Scenario, FinishingConditions, World, ScenarioEndNoInteractions, ScenarioEndAllConditionsMet } from "../scenario";
import { RolesDescriptor } from "../roles";
import { MapStructure, Location } from "../location";
import { Interaction } from "../interaction";
import { Phrase } from "../phrase";
import { generateAgent } from "./agentBuilder";
import { Effect, EffectComponent, EffectKind, EffectStrength } from "npc-emotional";
import { Input } from "../input";

describe("FinishingConditions should", () => {
    it("me all conditions", () => {
        let conditions = new FinishingConditions()
            .with((scenario) => true)
            .with((scenario) => 2 === 2);
        
        expect(() => conditions.with(null)).toThrowError();

        expect(conditions.allMet(null)).toBe(true);

        conditions.with(() => false);

        expect(conditions.allMet(null)).toBe(false);
    });
});

describe("World should", () => {
    it("return current scenario", () => {
        let world = new World();

        expect(world.currentScenario).toBe(null);

        world.add(new Scenario(
            "scenario",
            new MapStructure([]),
            new Agents([]),
            [],
            new FinishingConditions()
        ));

        expect(world.currentScenario.name).toBe("scenario");
    });
});

describe("Scenario should", () => {
    it("throw error when wrong input", () => {
        expect(() => new Scenario(null, new MapStructure([]), new Agents([]), [], new FinishingConditions())).toThrowError();
        expect(() => new Scenario("", new MapStructure([]), new Agents([]), [], new FinishingConditions())).toThrowError();
        expect(() => new Scenario("    ", new MapStructure([]), new Agents([]), [], new FinishingConditions())).toThrowError();
        expect(() => new Scenario("scenario", null, new Agents([]), [], new FinishingConditions())).toThrowError();
        expect(() => new Scenario("scenario", new MapStructure([]), null, [], new FinishingConditions())).toThrowError();
        expect(() => new Scenario("scenario", new MapStructure([]), new Agents([]), null, new FinishingConditions())).toThrowError();
        expect(() => new Scenario("scenario", new MapStructure([]), new Agents([]), [], null)).toThrowError();
    });

    it("perform a step without finishing conditions", () => {
        let scenario = new Scenario(
            "scenario",
            new MapStructure([]),
            new Agents([]),
            [],
            new FinishingConditions()
        )

        let step = scenario.performStep(Input.void());

        expect(step.content).toBe(ScenarioEndAllConditionsMet);
        expect(scenario.isFinished).toBe(true);
    });

    it("perform an interactionless step", () => {
        let scenario = new Scenario(
            "scenario",
            new MapStructure([]),
            new Agents([]),
            [],
            new FinishingConditions()
                .with((scenario: Scenario) => scenario.turn === 5)
        )

        let step = scenario.performStep(Input.void());

        expect(step.content).toBe(ScenarioEndNoInteractions);
        expect(scenario.isFinished).toBe(true);
    });

    it("perform a step", () => {
        let first = generateAgent("First");
        let second = generateAgent("Second");

        let location = new Location("Place");

        let map = new MapStructure([location]);
        map.move(first, location);
        map.move(second, location);

        let scenario = new Scenario(
            "scenario",
            map,
            new Agents([ first, second ]),
            [
                new Interaction(
                "interaction", 
                "[performer] salutates [receiver]", 
                new RolesDescriptor("performer", [ "receiver" ]), 
                [ 
                    new Phrase("performer", "receiver")
                    .withAlternative(
                        roles => "[performer]:Hello [receiver]."
                    ),
                    new Phrase("performer", "receiver")
                    .withAlternative(
                        roles => "[receiver]:Hi [performer].",
                        roles => new Effect("performer", [ EffectComponent.positive(EffectKind.Happiness, EffectStrength.High)] )
                    ) ])
            ],
            new FinishingConditions()
                .with((scenario: Scenario) => scenario.turn === 5),
            (turn: number, scenario:Scenario) => "A turn has passed."
        );

        let step = scenario.performStep(Input.void());
        expect(step.isEnder).toBe(false);
        expect(step.content).toBe("First: - Hello Second.");

        let step2 = scenario.performStep(Input.void());
        expect(step2.isEnder).toBe(false);
        expect(step2.content).toBe("Second: - Hi First.");

        let step3 = scenario.performStep(Input.void());
        expect(step3.isEnder).toBe(true);
        expect(step3.content.includes("A turn has passed.")).toBe(true);
    });
});