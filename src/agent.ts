import { Aspect, Likes } from "npc-aspect";
import { RelationSet } from "npc-relations";
import { Individual, LogicAgent, Population, Rules, TruthTable } from "first-order-logic";
import { IEmotional } from "npc-emotional";
import { Happiness, Personality } from "npc-mind";
import { randomFromList } from "role-methods";

export type PassTurn = (turn: number, agent: Agent) => string;

export class Agent implements IEmotional{
    private _name: string;
    private _aspect: Aspect;
    private _likes: Likes;
    private _relations: RelationSet;
    private _happiness: Happiness;
    private _personality: Personality;
    private _isHuman: boolean;
    private _characteristics: TruthTable;
    private _desires: Desires;
    private _onTurnPassed: PassTurn;
    private _logic: LogicAgent;

    constructor(
        name: string,
        aspect: Aspect,
        relations: RelationSet,
        happiness: Happiness,
        personality: Personality,
        likes: Likes,
        characteristics: TruthTable,
        human: boolean,
        onTurnPassed: PassTurn = null
    ){
        if(name == null || name.trim() === "")
            throw new Error("Name cannot be empty.");
        
        if(aspect == null)
            throw new Error("Aspect cannot be null.");
        
        if(relations == null)
            throw new Error("Relations cannot be null.");
        
        if(happiness == null)
            throw new Error("Happiness cannot be null.");
        
        if(personality == null)
            throw new Error("Personality cannot be null.");
        
        if(likes == null)
            throw new Error("Likes cannot be null.");
        
        if(characteristics == null)
            throw new Error("Characteristics cannot be null.");
        
        this._name = name;
        this._aspect = aspect;
        this._relations = relations;
        this._happiness = happiness;
        this._personality = personality;
        this._likes = likes;
        this._characteristics = characteristics;
        this._desires = new Desires();
        this._isHuman = human;
        this._onTurnPassed = onTurnPassed == null 
            ? (turn: number, agent: Agent) => "" 
            : onTurnPassed;
        this._logic = new LogicAgent();
        this._logic.population.add(this.Individual);
    }

    get Name(){
        return this._name;
    }

    get Aspect(){
        return this._aspect;
    }

    get Likes(){
        return this._likes;
    }

    get Relations(){
        return this._relations;
    }

    get Happiness(){
        return this._happiness;
    }

    get Personality(){
        return this._personality;
    }

    get IsHuman(){
        return this._isHuman;
    }

    get Characteristics(){
        return this._characteristics;
    }

    get Desires(){
        return this._desires;
    }

    get OnTurnPassed(){
        return this._onTurnPassed;
    }

    get Individual(): Individual{
        return new Individual(this.Name.replace(" ", ""));
    }

    get logic(){
        return this._logic;
    }

    say(content: string){
        if(content == null)
            throw new Error("Content cannot be null.");
        
        return `${this.Name}: - ${content}`;
    }

    copy(): Agent{
        return new Agent(
            this._name,
            this._aspect.copy(),
            this._relations.copy(),
            this._happiness.copy(),
            this._personality.copy(),
            this._likes.copy(),
            this._characteristics.copy(),
            this._isHuman
        );
    }

    passTurn(turn: number): string{
        return this._onTurnPassed(turn, this);
    }
}

export class Crowd{
    private _crowd: Map<string, Agent>;

    constructor(agents: Agent[]){
        if(agents == null)
            throw new Error("Agents cannot be null.");
        
        this._crowd = new Map<string, Agent>();
        for(let agent of agents){
            this._crowd.set(agent.Name, agent);
        }
    }

    get all(): Agent[]{
        return Array.from(this._crowd.values());
    }

    get(name: string): Agent{
        return this._crowd.get(name);
    }

    copy(): Crowd{
        return new Crowd(this.all.map(agent => agent.copy()));
    }
}

export type Heuristic = (crowd: Crowd) => number;

export class Desire{
    private _involved: Set<string>;
    private _heuristic: Heuristic;

    constructor(heuristic: Heuristic, involved: string[]){
        if(heuristic == null)
            throw new Error("Heuristic cannot be null.");
        
        if(involved == null)
            throw new Error("Involved agents cannot be null.");
        
        this._heuristic = heuristic;
        this._involved = new Set<string>(involved);
    }

    get heuristic(){
        return this._heuristic;
    }

    anyInvolved(agents: Agent[]){
        return agents.some(agent => this._involved.has(agent.Name));
    }
}

export class Desires{
    private _desires: Desire[];

    constructor(){
        this._desires = [];
    }

    get any(): boolean{
        return this._desires.length > 0;
    }

    append(desire: Desire): Desires{
        if(desire != null)
            this._desires.push(desire);
        
        return this;
    }

    clear(): void{
        this._desires = [];
    }

    anyInvolved(agents: Agent[]): boolean{
        return this._desires.some(desire => desire.anyInvolved(agents));
    }

    heuristicTotal(crowd: Crowd){
        return this._desires.reduce((accumulated, desire) => accumulated + desire.heuristic(crowd), 0);
    }
}

export class Agents{
    private _agents: Agent[];
    private _availableAgents: Agent[];

    constructor(agents: Agent[]){
        if(agents == null)
            throw new Error("Agents cannot be null.");
        
        this._agents = agents;
        this._availableAgents = [];
    }

    get all(): Agent[]{
        return this._agents;
    }

    get count(): number{
        return this._agents.length;
    }

    allExcept(agent: Agent): Agent[]{
        return this._agents.filter(a => a.Name !== agent.Name);
    }

    popRandomAgent(): Agent{
        if(this._availableAgents.length === 0)
            this._availableAgents = [...this._agents];
        
        let ponderatedAgents: Agent[] = [];
        for(let agent of this._availableAgents){
            for(let i = 0; i < agent.Personality.introvertyExtroverty; i++){
                ponderatedAgents.push(agent);
            }
        }

        let selectedAgent = randomFromList(ponderatedAgents);
        this._availableAgents = this._availableAgents.filter(a => a.Name !== selectedAgent.Name);
        return selectedAgent;
    }
}