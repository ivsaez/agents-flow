import { Roles, RolesDescriptor } from "../roles";
import { Deliverer, Interaction } from "../interaction";
import { Phrase } from "../phrase";
import { Timing } from "../interfaces";
import { generateAgent } from "./agentBuilder";

describe("Deliverer should", () => {
    it("throw error if wrong input.", () => {
        expect(() => new Deliverer(null)).toThrowError();
    });

    it("Deliver phrases", () => {
        let phrase1 = new Phrase("performer", "target");
        let phrase2 = new Phrase("first", "second");

        let deliverer = new Deliverer([ phrase1, phrase2 ]);

        expect(deliverer.isFinished).toBe(false);

        let firstDelivery = deliverer.deliver(new Roles());
        let secondDelivery = deliverer.deliver(new Roles());

        expect(firstDelivery.performerRole).toBe("performer");
        expect(firstDelivery.targetRole).toBe("target");
        expect(secondDelivery.performerRole).toBe("first");
        expect(secondDelivery.targetRole).toBe("second");
        expect(deliverer.isFinished).toBe(true);
        expect(() => deliverer.deliver(new Roles())).toThrowError();
    });
});

describe("Interaction should", () => {
    it("throw error when wrong input", () => {
        expect(() => new Interaction(null, "description", new RolesDescriptor("performer"), [ new Phrase("performer", "target") ])).toThrowError();
        expect(() => new Interaction("", "description", new RolesDescriptor("performer"), [ new Phrase("performer", "target") ])).toThrowError();
        expect(() => new Interaction("    ", "description", new RolesDescriptor("performer"), [ new Phrase("performer", "target") ])).toThrowError();
        expect(() => new Interaction("name", null, new RolesDescriptor("performer"), [ new Phrase("performer", "target") ])).toThrowError();
        expect(() => new Interaction("name", "", new RolesDescriptor("performer"), [ new Phrase("performer", "target") ])).toThrowError();
        expect(() => new Interaction("name", "    ", new RolesDescriptor("performer"), [ new Phrase("performer", "target") ])).toThrowError();
        expect(() => new Interaction("name", "description", null, [ new Phrase("performer", "target") ])).toThrowError();
        expect(() => new Interaction("name", "description", new RolesDescriptor("performer"), null)).toThrowError();
        expect(() => new Interaction("name", "description", new RolesDescriptor("performer"), [])).toThrowError();
    });

    it("create a valid instance", () => {
        let interaction = new Interaction(
            "interaction",
            "interaction description",
            new RolesDescriptor("performer", [ "receiver" ]),
            [ new Phrase("performer", "receiver") ],
            Timing.Repeteable);

        expect(interaction.name).toBe("interaction");
        expect(interaction.description).toBe("interaction description");
        expect(interaction.rolesDescriptor.main).toBe("performer");
        expect(interaction.rolesDescriptor.secondarys.length).toBe(1);
        expect(interaction.rolesDescriptor.secondarys[0]).toBe("receiver");
        expect(interaction.timing).toBe(Timing.Repeteable);
        expect(interaction.preconditions).not.toBe(null);
        expect(interaction.postconditions).not.toBe(null);

        expect(interaction.preconditions(null, null, null)).toBe(true);
        expect(interaction.postconditions(null, null, null).elements.length).toBe(0);
    });

    it("calculate all permutations", () => {
        let interaction = new Interaction(
            "interaction",
            "interaction description",
            new RolesDescriptor("performer", [ "receiver", "another" ]),
            [ new Phrase("performer", "receiver") ],
            Timing.Single);

        let performer = generateAgent("Performer");
        let receiver = generateAgent("Receiver");
        let another = generateAgent("Another");
        
        let permutations = interaction.getPermutations(performer, [ receiver, another ]);

        expect(permutations.length).toBe(2);
        expect(permutations[0].get("performer").Name).toBe("Performer");
        expect(permutations[0].get("receiver").Name).toBe("Receiver");
        expect(permutations[0].get("another").Name).toBe("Another");
        expect(permutations[1].get("performer").Name).toBe("Performer");
        expect(permutations[1].get("receiver").Name).toBe("Another");
        expect(permutations[1].get("another").Name).toBe("Receiver");
    });
});