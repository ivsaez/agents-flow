import { Agent, Agents, Desire, Crowd, Desires } from "../agent";
import { Aspect, Likes, OriginKind } from "npc-aspect";
import { RelationSet } from "npc-relations";
import { Happiness, Personality } from "npc-mind";
import { Individual, TruthTable } from "first-order-logic";
import { generateAgent } from "./agentBuilder";

describe("Agent should", () => {
    it("throw error if creating with wrong parameters.", () => {
        expect(() => new Agent(null, Aspect.generateOriginHuman(OriginKind.Oceanic), new RelationSet(), new Happiness(), new Personality(), new Likes(), new TruthTable(), false)).toThrowError();
        expect(() => new Agent("First", null, new RelationSet(), new Happiness(), new Personality(), new Likes(), new TruthTable(), false)).toThrowError();
        expect(() => new Agent("First", Aspect.generateOriginHuman(OriginKind.Oceanic), null, new Happiness(), new Personality(), new Likes(), new TruthTable(), false)).toThrowError();
        expect(() => new Agent("First", Aspect.generateOriginHuman(OriginKind.Oceanic), new RelationSet(), null, new Personality(), new Likes(), new TruthTable(), false)).toThrowError();
        expect(() => new Agent("First", Aspect.generateOriginHuman(OriginKind.Oceanic), new RelationSet(), new Happiness(), null, new Likes(), new TruthTable(), false)).toThrowError();
        expect(() => new Agent("First", Aspect.generateOriginHuman(OriginKind.Oceanic), new RelationSet(), new Happiness(), new Personality(), null, new TruthTable(), false)).toThrowError();
        expect(() => new Agent("First", Aspect.generateOriginHuman(OriginKind.Oceanic), new RelationSet(), new Happiness(), new Personality(), new Likes(), null, false)).toThrowError();
    });

    it("say something", () => {
        let agent = generateAgent("First agent");
        let something = agent.say("Hello");
        expect(something).toBe("First agent: - Hello");
    });

    it("return an equivalent individual", () => {
        let agent = generateAgent("First agent");
        let individual = agent.Individual;
        expect(individual.equals(new Individual("Firstagent"))).toBe(true);
    });
});

describe("Agents should", () => {
    it("throw error if creating with wrong parameters.", () => {
        expect(() => new Agents(null)).toThrowError();
    });

    it("create agents", () => {
        let agent1 = generateAgent("First");
        let agent2 = generateAgent("Second");
        let agents = new Agents([ agent1, agent2 ]);

        expect(agents.all.length).toBe(2);
        expect(agents.all[0].Name).toBe("First");
        expect(agents.all[1].Name).toBe("Second");
        expect(agents.count).toBe(2);
        expect(agents.allExcept(agent2).length).toBe(1);
        expect(agents.allExcept(agent2)[0].Name).toBe("First");
    });

    it("pop random agents", () => {
        let agent1 = generateAgent("First");
        let agent2 = generateAgent("Second");
        let agents = new Agents([ agent1, agent2 ]);

        let popped1 = agents.popRandomAgent();
        let popped2 = agents.popRandomAgent();

        expect(popped1.Name === "First" || popped1.Name === "Second").toBe(true);
        expect(popped2.Name === "First" || popped2.Name === "Second").toBe(true);
        expect(popped1.Name !== popped2.Name).toBe(true);

        let popped3 = agents.popRandomAgent();
        expect(popped3.Name === "First" || popped3.Name === "Second").toBe(true);
    });
});

describe("Crowd should", () => {
    it("throw error if wrong constructor", () => {
        expect(() => new Crowd(null)).toThrowError();
    });

    it("create a crowd of agents", () => {
        let agent1 = generateAgent("First");
        let agent2 = generateAgent("Second");
        let crowd = new Crowd([ agent1, agent2 ]);

        expect(crowd.all.length).toBe(2);
        expect(crowd.all[0].Name).toBe("First");
        expect(crowd.all[1].Name).toBe("Second");
        expect(crowd.get("First").Name).toBe("First");
        expect(crowd.get("Second").Name).toBe("Second");
    });

    it("create a copy", () => {
        let agent1 = generateAgent("First");
        let agent2 = generateAgent("Second");
        let crowd = new Crowd([ agent1, agent2 ]);
        let copy = crowd.copy();

        expect(copy.all.length).toBe(2);
        expect(copy.all[0].Name).toBe("First");
        expect(copy.all[1].Name).toBe("Second");
    });
});

describe("Desire should", () => {
    it("throw error when wrong input.", () => {
        expect(() => new Desire(null, ["one", "two"])).toThrowError();
        expect(() => new Desire((crowd:Crowd) => 0, null)).toThrowError();
    });

    it("create a desire implementation.", () =>{
        let agent1 = generateAgent("First");
        let agent2 = generateAgent("Second");
        let desire = new Desire((crowd: Crowd) => 7, [ "First" ]);

        expect(desire.heuristic(new Crowd([ agent1 ]))).toBe(7);
        expect(desire.anyInvolved([ agent1 ])).toBe(true);
        expect(desire.anyInvolved([ agent2 ])).toBe(false);
    });
});

describe("Desires should", () => {
    it("create a list of desires", () => {
        let agent1 = generateAgent("First");
        let agent2 = generateAgent("Second");

        let desire1 = new Desire((crowd: Crowd) => 7, [ "First" ]);
        let desire2 = new Desire((crowd: Crowd) => 10, [ "First" ]);

        let desires = new Desires()
            .append(desire1)
            .append(desire2);

        expect(desires.any).toBe(true);
        expect(desires.anyInvolved([ agent1 ])).toBe(true);
        expect(desires.anyInvolved([ agent2 ])).toBe(false);
        expect(desires.heuristicTotal(new Crowd([ agent1 ]))).toBe(17);

        desires.clear();

        expect(desires.any).toBe(false);
    });
});