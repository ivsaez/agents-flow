import { Agent } from "./agent";
import { OnGoingInteraction } from "./ongoing";
import { IInteraction } from "./interfaces";

export type Historic = {
    agent: Agent;
    ongoing: OnGoingInteraction;
}

export class HistoricInteractions{
    private _executions: Historic[];

    constructor(){
        this._executions = [];
    }

    add(agent: Agent, ongoing: OnGoingInteraction){
        if(agent == null)
            throw new Error("Agent cannot be null.");
        
        if(ongoing == null)
            throw new Error("On going interaction cannot be null.");
        
        this._executions.push({
            agent,
            ongoing
        });
    }

    hasExecutedInteraction(interaction: IInteraction): boolean{
        return this._executions.some(e => e.ongoing.interaction.equals(interaction));
    }

    hasExecutedOnGoingInteraction(ongoing: OnGoingInteraction): boolean{
        return this._executions.some(e => e.ongoing.equals(ongoing));
    }
}