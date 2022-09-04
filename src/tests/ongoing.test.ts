import { OnGoingInteraction } from "../ongoing";
import { Roles, RolesDescriptor } from "../roles";
import { MapStructure, Location } from "../location";
import { Interaction } from "../interaction";
import { Phrase } from "../phrase";
import { generateAgent } from "./agentBuilder";
import { Effect, EffectComponent, EffectKind, EffectStrength } from "npc-emotional";
import { Sentence } from "first-order-logic";
import { Input } from "../input";
import { TruthTable } from "first-order-logic";

describe("OnGoingInteraction should", () => {
    it("throw an error when wrong input", () => {
        expect(() => new OnGoingInteraction(null, new Roles(), new MapStructure([]), TruthTable.empty)).toThrowError();
        expect(() => new OnGoingInteraction(new Interaction("interaction", "interaction description", new RolesDescriptor("main"), [ new Phrase("performer") ]), null, new MapStructure([]), TruthTable.empty)).toThrowError();
        expect(() => new OnGoingInteraction(new Interaction("interaction", "interaction description", new RolesDescriptor("main"), [ new Phrase("performer") ]), new Roles(), null, TruthTable.empty)).toThrowError();
        expect(() => new OnGoingInteraction(new Interaction("interaction", "interaction description", new RolesDescriptor("main"), [ new Phrase("performer") ]), new Roles(), new MapStructure([]), null)).toThrowError();
    });

    it("create a valid instance", () => {
        let agent = generateAgent("First");
        let location = new Location("Place");
        let map = new MapStructure([location]);
        map.move(agent, location);

        let ongoing = new OnGoingInteraction(
            new Interaction(
                "interaction", 
                "interaction description", 
                new RolesDescriptor("role"), 
                [ new Phrase("performer") ]), 
            new Roles()
                .match("role", agent), 
            map,
            TruthTable.empty);
        
        expect(ongoing.interaction.name).toBe("interaction");
        expect(ongoing.interaction.description).toBe("interaction description");
        expect(ongoing.roles.has("role")).toBe(true);
        expect(ongoing.roles.matched(agent)).toBe(true);
        expect(ongoing.map.getLocation("Place").name).toBe("Place");
        expect(ongoing.location.name).toBe("Place");
        expect(ongoing.postconditions.elements.length).toBe(0);
    });

    it("check equals on going interaction", () => {
        let agent = generateAgent("First");
        let location = new Location("Place");
        let map = new MapStructure([location]);
        map.move(agent, location);

        let ongoing = new OnGoingInteraction(
            new Interaction(
                "interaction", 
                "interaction description having [role]", 
                new RolesDescriptor("role"), 
                [ new Phrase("performer") ]), 
            new Roles()
                .match("role", agent), 
            map,
            TruthTable.empty);
        
        let other = new OnGoingInteraction(
            new Interaction(
                "interaction", 
                "interaction description having [role]", 
                new RolesDescriptor("role"), 
                [ new Phrase("performer") ]), 
            new Roles()
                .match("role", agent), 
            map,
            TruthTable.empty);
        
        let different = new OnGoingInteraction(
            new Interaction(
                "interaction", 
                "interaction description having [any]", 
                new RolesDescriptor("any"), 
                [ new Phrase("performer") ]), 
            new Roles()
                .match("any", agent), 
            map,
            TruthTable.empty);
        
        expect(ongoing.equals(other)).toBe(true);
        expect(ongoing.equals(different)).toBe(false);
    });

    it("return a string representation", () => {
        let agent = generateAgent("First");
        let location = new Location("Place");
        let map = new MapStructure([location]);
        map.move(agent, location);

        let ongoing = new OnGoingInteraction(
            new Interaction(
                "interaction", 
                "interaction description having [role]", 
                new RolesDescriptor("role"), 
                [ new Phrase("performer") ]), 
            new Roles()
                .match("role", agent), 
            map,
            TruthTable.empty);
        
        expect(ongoing.toString()).toBe("interaction description having First");
    });

    it("perform a step", () => {
        let first = generateAgent("First");
        let second = generateAgent("Second");

        let location = new Location("Place");

        let map = new MapStructure([location]);
        map.move(first, location);
        map.move(second, location);

        let ongoing = new OnGoingInteraction(
            new Interaction(
                "interaction", 
                "[performer] salutates [receiver]", 
                new RolesDescriptor("performer", [ "receiver" ]), 
                [ new Phrase("performer", "receiver")
                    .withAlternative(
                        roles => "[performer]:Hello [receiver].",
                        roles => new Effect("receiver", [ EffectComponent.positive(EffectKind.Happiness, EffectStrength.High)] ),
                        roles => Sentence.build("Salutation", "First", "Second")
                    ) ]), 
            new Roles()
                .match("performer", first)
                .match("receiver", second), 
            map,
            TruthTable.empty);
        
        let step = ongoing.performStep(Input.void());

        expect(step.content.length).toBe(1);
        expect(step.content[0]).toBe("First: - Hello Second.");
        expect(step.isEnder).toBe(false);
    });

    it("perform different steps", () => {
        let first = generateAgent("First");
        let second = generateAgent("Second");

        let location = new Location("Place");

        let map = new MapStructure([location]);
        map.move(first, location);
        map.move(second, location);

        let ongoing = new OnGoingInteraction(
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
                    ) ]), 
            new Roles()
                .match("performer", first)
                .match("receiver", second), 
            map,
            TruthTable.empty);
        
        let step = ongoing.performStep(Input.void());

        expect(step.content.length).toBe(1);
        expect(step.content[0]).toBe("First: - Hello Second.");
        expect(step.isEnder).toBe(false);

        let step2 = ongoing.performStep(Input.void());

        expect(step2.content.length).toBe(1);
        expect(step2.content[0]).toBe("Second: - Hi First.");
        expect(step2.isEnder).toBe(false);

        let step3 = ongoing.performStep(Input.void());

        expect(step3.isEnder).toBe(true);
    });
});