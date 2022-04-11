import { IDeliverer, IInteraction, Postconditions, Preconditions, Timing } from "./interfaces";
import { Phrase } from "./phrase";
import { Roles, RolesDescriptor } from "./roles";
import { Queue } from "data-structs-n-algos";
import { Agent } from "./agent";
import { TruthTable } from "first-order-logic";

export class Deliverer implements IDeliverer{
    private _phrases: Queue<Phrase>;

    constructor(phrases: Phrase[]){
        if(phrases == null)
            throw new Error("Phrases cannot be null.");
        
        this._phrases = new Queue<Phrase>(phrases);
    }

    get isFinished(): boolean{
        return this._phrases.isEmpty();
    }

    deliver(roles: Roles): Phrase {
        if(!this.isFinished)
            return this._phrases.dequeue();

        throw new Error("No phrases to deliver.");
    }
}

export abstract class BaseInteraction implements IInteraction{
    private _name: string;
    private _description: string;
    private _preconditions: Preconditions;
    private _postconditions: Postconditions;
    private _timing: Timing;

    protected _isIntimate: boolean;

    constructor(
        name: string, 
        description: string, 
        timing: Timing,
        preconditions: Preconditions,
        postconditions: Postconditions){

        if(name == null || name.trim() === "")
            throw new Error("Name cannot be empty.");
        
        if(description == null || description.trim() === "")
            throw new Error("Description cannot be empty.");
        
        if(preconditions == null)
            throw new Error("Preconditions cannot be null.");
        
        if(postconditions == null)
            throw new Error("Postconditions cannot be null.");

        this._name = name;
        this._description = description;
        this._timing = timing;
        this._preconditions = preconditions;
        this._postconditions = postconditions;
        this._isIntimate = false;
    }

    get name(){
        return this._name;
    }

    get description(){
        return this._description;
    }

    get preconditions(){
        return this._preconditions;
    }

    get postconditions(){
        return this._postconditions;
    }

    get isIntimate(){
        return this._isIntimate;
    }

    get timing(){
        return this._timing;
    }

    abstract get deliverer(): IDeliverer;
    abstract get rolesDescriptor(): RolesDescriptor;

    abstract intimate(): IInteraction;

    equals(interaction: IInteraction): boolean {
        if(interaction == null) return false;

        return this._name === interaction.name;
    }

    globallyEquals(interaction: IInteraction): boolean {
        if(interaction == null) return false;

        return this._name === interaction.name;
    }

    getPermutations(main: Agent, other: Agent[]): Roles[] {
        let result: Roles[] = [];
        let descriptor = this.rolesDescriptor;

        if (other.length < descriptor.secondarys.length) return result;

        let agentCombinations = this.calculateAgentCombinations(other, descriptor.secondarys.length);

        for (let combination of agentCombinations)
        {
            if (combination.length === 0)
            {
                result.push(new Roles().match(descriptor.main, main));
                continue;
            }

            for (let agent of combination)
            {
                var roles = new Roles().match(descriptor.main, main);

                roles.match(descriptor.secondarys[0], agent);
                var remainingSecondarys = descriptor.secondarys.filter(x => !roles.has(x));
                var remainingAgents = combination.filter(x => !roles.matched(x));

                this.fillRemainingPermutations(roles, remainingSecondarys, remainingAgents);

                result.push(roles);
            }
        }

        return result;
    }

    private calculateAgentCombinations(agents: Agent[], size: number): Agent[][]{
        let oneElemSequences = agents.map(a => [ a ]);

        let result: Agent[][] = [];
        result.push([]);

        for (let oneElemSequence of oneElemSequences)
        {
            let length: number = result.length;

            for (let i = 0; i < length; i++)
            {
                if (result[i].length >= size)
                    continue;

                result.push(result[i].concat(oneElemSequence));
            }
        }

        return result.filter(x => x.length === size);
    }

    private fillRemainingPermutations(roles: Roles, secondarys: string[], agents: Agent[]): void{
        if (secondarys.length === 0) return;

        for (let agent of agents)
        {
            roles.match(secondarys[0], agent);
            var remainingSecondarys = secondarys.filter(x => !roles.has(x));
            var remainingAgents = agents.filter(x => !roles.matched(x));

            this.fillRemainingPermutations(roles, remainingSecondarys, remainingAgents);
        }
    }
}

export class Interaction extends BaseInteraction{
    private _phrases: Phrase[];
    private _rolesDescriptor: RolesDescriptor;

    constructor(
        name: string, 
        description: string, 
        rolesDescriptor: RolesDescriptor,
        phrases: Phrase[],
        timing: Timing = Timing.Single,
        preconditions: Preconditions = (table, roles, map) => true,
        postconditions: Postconditions = (roles, map) => TruthTable.empty){
        
        super(name, description, timing, preconditions, postconditions);

        if(rolesDescriptor == null)
            throw new Error("Roles descriptor cannot be null.");
        
        if(phrases == null || phrases.length === 0)
            throw new Error("Interaction must have almost one phrase.");
        
        this._rolesDescriptor = rolesDescriptor;
        this._phrases = phrases;
    }

    get deliverer(): IDeliverer {
        return new Deliverer(this._phrases);
    }

    get rolesDescriptor(): RolesDescriptor {
        return this._rolesDescriptor;
    }

    intimate(): IInteraction {
        this._isIntimate = true;

        for(let phrase of this._phrases){
            phrase.intimate();
        }

        return this;
    }
}