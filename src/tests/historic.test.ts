import { OnGoingInteraction } from "../ongoing";
import { Roles, RolesDescriptor } from "../roles";
import { MapStructure, Location } from "../location";
import { Interaction } from "../interaction";
import { Phrase } from "../phrase";
import { generateAgent } from "./agentBuilder";
import { HistoricInteractions } from "../historic";
import { TruthTable } from "first-order-logic";

describe("HistoricInteractions should", () => {
    it("detect added interactions", () => {
        let historic = new HistoricInteractions();

        let agent = generateAgent("First");
        let location = new Location("Place");
        let map = new MapStructure([location]);
        map.move(agent, location);

        let interaction = new Interaction(
            "interaction", 
            "interaction description having [role]", 
            new RolesDescriptor("role"), 
            [ new Phrase("performer") ]);

        let otherInteraction = new Interaction(
                "other interaction", 
                "interaction description having [role]", 
                new RolesDescriptor("role"), 
                [ new Phrase("performer") ]);

        let ongoing = new OnGoingInteraction(
            interaction, 
            new Roles()
                .match("role", agent), 
            map,
            TruthTable.empty);
        
        let otherOngoing = new OnGoingInteraction(
            otherInteraction, 
            new Roles()
                .match("role", agent), 
            map,
            TruthTable.empty);
        
        historic.add(agent, ongoing);

        expect(historic.hasExecutedInteraction(interaction)).toBe(true);
        expect(historic.hasExecutedOnGoingInteraction(ongoing)).toBe(true);
        expect(historic.hasExecutedInteraction(otherInteraction)).toBe(false);
        expect(historic.hasExecutedOnGoingInteraction(otherOngoing)).toBe(false);
    });
});