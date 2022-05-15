import { Agent } from "../agent";
import { Aspect, Likes, OriginKind } from "npc-aspect";
import { RelationSet } from "npc-relations";
import { Happiness, Personality } from "npc-mind";

export function generateAgent(name: string): Agent{
    return new Agent(
        name,
        Aspect.generateOriginHuman(OriginKind.Oceanic),
        new RelationSet(),
        new Happiness(),
        new Personality(),
        new Likes(),
        [],
        false
    );
}