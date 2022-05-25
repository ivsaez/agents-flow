import { modusPonens, TruthTable } from "first-order-logic";
import { OnGoingInteraction } from "./ongoing";
import { IInteraction, Timing } from "./interfaces";
import { Agent , Agents} from "./agent";
import { MapStructure } from "./location";
import { HistoricInteractions } from "./historic";
import { Input } from "./input";
import { Step } from "./step";
import { randomFromList } from "role-methods";

export type ScenarioCondition = (scenario: Scenario) => boolean;

export class FinishingConditions{
    private _conditions: ScenarioCondition[];

    constructor(){
        this._conditions = [];
    }

    with(condition: ScenarioCondition): FinishingConditions{
        if(condition == null)
            throw new Error("Condition cannot be null");
        
        this._conditions.push(condition);

        return this;
    }

    allMet(scenario: Scenario): boolean{
        return this._conditions.every(c => c(scenario));
    }
}

export class World{
    private _scenarios: Scenario[];

    constructor(){
        this._scenarios = [];
    }

    get currentScenario(): Scenario{
        let notFinishedScenarios = this._scenarios.filter(s => !s.isFinished);

        if(notFinishedScenarios.length === 0)
            return null;
        
        return notFinishedScenarios[0];
    }

    add(scenario: Scenario){
        if(scenario == null)
            throw new Error("Scenario cannot be null.");
        
        this._scenarios.push(scenario);
    }
}

export type ScenarioTurnPassed = (turn: number, scenario: Scenario) => string;
export const ScenarioEndAllConditionsMet: string = "0";
export const ScenarioEndNoInteractions: string = "1";

export class Scenario{
    private _interactions: IInteraction[];
    private _finishingConditions: FinishingConditions;
    private _globalPostconditions: TruthTable;
    private _onTurnPassed: ScenarioTurnPassed;

    private _currentInteraction: OnGoingInteraction;
    private _selectableInteractions: OnGoingInteraction[];
    private _interactor: Agent;

    private get thereIsCurrentInteraction(): boolean{
        return this._currentInteraction != null;
    }

    private _name: string;
    private _map: MapStructure;
    private _agents: Agents;
    private _historic: HistoricInteractions;
    private _isFinished: boolean;
    private _turn: number;

    constructor(
        name: string,
        map: MapStructure,
        agents: Agents,
        interactions: IInteraction[],
        finishingConditions: FinishingConditions,
        onTurnPassed: ScenarioTurnPassed = null
    ){
        if(name == null || name.trim() === "")
            throw new Error("Name cannot be empty.");
        
        if(map == null)
            throw new Error("Map cannot be null.");
        
        if(agents == null)
            throw new Error("Agents cannot be null.");
        
        if(interactions == null)
            throw new Error("Interactions cannot be null.");
        
        if(finishingConditions == null)
            throw new Error("FinishingConditions cannot be null.");
        
        this._name = name;
        this._map = map;
        this._agents = agents;
        this._interactions = interactions;
        this._finishingConditions = finishingConditions;
        this._onTurnPassed = onTurnPassed == null ? (turn: number, scenario: Scenario) => "" : onTurnPassed;

        this._isFinished = false;
        this._selectableInteractions = [];
        this._interactor = null;
        this._historic = new HistoricInteractions();
        this._globalPostconditions = new TruthTable();
        this._turn = 0;
    }

    get name(){
        return this._name;
    }

    get map(){
        return this._map;
    }

    get agents(){
        return this._agents;
    }

    get interactions(){
        return this._interactions;
    }

    get historic(){
        return this._historic;
    }

    get isFinished(){
        return this._isFinished;
    }

    get turn(){
        return this._turn;
    }

    get postconditions(){
        return this._globalPostconditions;
    }

    performStep(input: Input): Step{
        return this.thereIsCurrentInteraction
            ? this.performCurrentInteractionStep(input)
            : input.isVoid
                ? this.performIAInteraction()
                : this.performHumanInteraction(input.choiceIndex);
    }

    private performIAInteraction(): Step{
        if (this._finishingConditions.allMet(this))
        {
            this._isFinished = true;
            return Step.fromContent(ScenarioEndAllConditionsMet);
        }

        let agent: Agent = null;
        let possibleInteractions: OnGoingInteraction[] = null;

        let poppedAgents: number = 0;
        while(agent == null && poppedAgents <= this._agents.count)
        {
            let candidate = this._agents.popRandomAgent();
            poppedAgents++;

            possibleInteractions = this.calculateAllAvailableInteractions(
                candidate, 
                this._agents.allExcept(candidate));

            if (possibleInteractions.length > 0)
                agent = candidate;
        }

        if (agent == null)
        {
            this._isFinished = true;
            return Step.fromContent(ScenarioEndNoInteractions);
        }

        if (agent.IsHuman)
        {
            this._interactor = agent;

            this._selectableInteractions = possibleInteractions;

            if(this._selectableInteractions.length === 1)
            {
                this._currentInteraction = this._selectableInteractions[0];
                this._historic.add(agent, this._currentInteraction);

                return this.performCurrentInteractionStep(Input.void());
            }

            return Step.fromChoices(this._selectableInteractions.map(i => i.toString()));
        }
        else
        {
            this._currentInteraction = randomFromList(possibleInteractions);
            this._historic.add(agent, this._currentInteraction);

            return this.performCurrentInteractionStep(Input.void());
        }
    }

    private calculateAllAvailableInteractions(main: Agent, others: Agent[]): OnGoingInteraction[]
    {
        let result: OnGoingInteraction[] = [];

        for (let interaction of this._interactions)
        {
            if (interaction.timing === Timing.GlobalSingle 
                && this._historic.hasExecutedInteraction(interaction))
                continue;

            let permutations = interaction.getPermutations(main, others);
            for (let permutation of permutations)
            {
                if(interaction.preconditions(this._globalPostconditions, permutation, this._map))
                {
                    let possibleInteraction = new OnGoingInteraction(interaction, permutation, this._map);
                    if (interaction.timing === Timing.Repeteable 
                        || !this._historic.hasExecutedOnGoingInteraction(possibleInteraction))
                        result.push(possibleInteraction);
                }
            }
        }

        return result;
    }

    private performCurrentInteractionStep(input: Input): Step
    {
        let step = this._currentInteraction.performStep(input);
        if (step.isEnder)
        {
            let postconditions = this._currentInteraction.postconditions;

            if (this._globalPostconditions.join(postconditions))
            {
                let listeningAgents = this._currentInteraction.interaction.isIntimate
                    ? this._currentInteraction.roles.agents
                    : this._currentInteraction.location.agents;

                for (let agent of listeningAgents)
                {
                    if(agent.logic.rules.elements.length > 0){
                        modusPonens(agent.logic.rules, agent.logic.population, agent.logic.table, postconditions.elements);
                    }
                }
            }

            this._currentInteraction = null;
            for(let turnText of this.passTurn()){
                step.append(turnText);
            }
        }

        return step;
    }

    private performHumanInteraction(choiceIndex: number): Step
    {
        this._currentInteraction = this._selectableInteractions[choiceIndex];
        this._historic.add(this._interactor, this._currentInteraction);

        return this.performCurrentInteractionStep(Input.void());
    }

    private passTurn(): string[]
    {
        this._turn++;
        let turnTexts: string[] = [this._onTurnPassed(this._turn, this)];

        for(let text of this._agents.all.map(a => a.OnTurnPassed(this._turn, a))){
            turnTexts.push(text);
        }

        return turnTexts;
    }
}