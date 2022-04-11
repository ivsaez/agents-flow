import { Agent } from "./agent";

export class RolesDescriptor{
    private _main: string;
    private _secondarys: Set<string>;

    constructor(main: string, secondarys: string[] = []){
        if(main == null || main.trim() === "")
            throw new Error("Main cannot be null.");
        
        if(secondarys == null)
            throw new Error("Secondarys cannot be null.");
        
        this._main = main;
        this._secondarys = new Set(secondarys);
    }

    get main(){
        return this._main;
    }

    get secondarys(): string[]{
        return [...this._secondarys.values()];
    }

    get all(): string[]{
        return [this._main, ...this.secondarys];
    }
}

export class Roles{
    private _roles: Map<string, Agent>;

    constructor(){
        this._roles = new Map<string, Agent>();
    }

    get roleNames(): string[]{
        return [...this._roles.keys()];
    }

    get agents(): Agent[]{
        return [...this._roles.values()];
    }

    match(role: string, agent: Agent): Roles{
        this.validateRole(role);
        this.validateAgent(agent);
        
        this._roles.set(role, agent);

        return this;
    }

    get(role: string): Agent{
        this.validateRole(role);

        if(!this._roles.has(role))
            throw new Error("Specified role doesn't exist");
        
        return this._roles.get(role);
    }

    has(role: string): boolean{
        this.validateRole(role);

        return this._roles.has(role);
    }

    matched(agent: Agent): boolean{
        this.validateAgent(agent);

        return this.agents.some(a => a.Name === agent.Name);
    }

    assignRoles(input: string): string{
        let assignedResult: string = input;

        for(let roleName of this._roles.keys()){
            assignedResult = assignedResult.replace(`[${roleName}]`, this._roles.get(roleName).Name);
        }

        return assignedResult;
    }

    equals(other: Roles): boolean{
        if(other == null) return false;

        if(this._roles.size !== other._roles.size) return false;
        
        for(let roleName of this._roles.keys()){
            if(!other._roles.has(roleName)) return false;
            if(this._roles.get(roleName).Name !== other._roles.get(roleName).Name) return false;
        }

        return true;
    }

    toString(): string{
        return this.roleNames.map(r => `${this._roles.get(r).Name} as ${r}`).join(",");
    }

    private validateRole(role: string): void{
        if(role == null || role.trim() === "")
            throw new Error("Role cannot be empty.");
    }

    private validateAgent(agent: Agent): void{
        if(agent == null)
            throw new Error("Agent cannot be null.");
    }
}