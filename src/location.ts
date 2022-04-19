import { Agent } from "./agent";

export class Location{
    private _name: string;
    private _connections: Map<string, Location>;
    private _agents: Map<string, Agent>;

    constructor(name){
        if(name == null || name.trim() === "")
            throw new Error("Location cannot be null.");
        
        this._name = name;
        this._connections = new Map<string, Location>();
        this._agents = new Map<string, Agent>();
    }

    get name(){
        return this._name;
    }

    get connections(): Location[]{
        return Array.from(this._connections.values());
    }

    get agents(): Agent[]{
        return Array.from(this._agents.values());
    }

    append(agents: Agent[]): void{
        if(agents == null) return;

        for(let agent of agents){
            this._agents.set(agent.Name, agent);
        }
    }

    remove(agent: Agent): void{
        if(agent == null) return;

        this._agents.delete(agent.Name);
    }

    has(agent: Agent): boolean{
        if(agent == null) return false;

        return this._agents.has(agent.Name);
    }

    connectWith(location: Location): void{
        if(location == null) return;

        this._connections.set(location.name, location);
    }

    isConnected(location: Location): boolean{
        if(location == null) return false;

        return this._connections.has(location.name);
    }

    static join(first: Location, second: Location): void{
        first.connectWith(second);
        second.connectWith(first);
    }
}

export class MapStructure{
    private _locations: Map<string, Location>;
    private _ubications: Map<string, string>;

    constructor(locations: Location[]){
        if(locations == null)
            throw new Error("Locations cannot be null.");
        
        this._locations = new Map<string, Location>();
        this._ubications = new Map<string, string>();

        for(let location of locations){
            this._locations.set(location.name, location);
        }
    }

    getLocation(location: string): Location{
        if(location == null || location.trim() === "" || !this._locations.has(location)) return null;

        return this._locations.get(location);
    }

    getUbication(agent: Agent): Location{
        if(agent == null || !this._ubications.has(agent.Name)) return null;

        return this._locations.get(this._ubications.get(agent.Name));
    }

    move(agent: Agent, destination: Location): boolean{
        if(agent == null || destination == null || !this._locations.has(destination.name))
            return false;
        
        if(!this._ubications.has(agent.Name)){
            this._ubications.set(agent.Name, destination.name);
            destination.append([ agent ]);
            return true;
        }

        let actualLocation = this.getUbication(agent);
        if(!actualLocation.has(agent))
            return false;
        
        if(!actualLocation.isConnected(destination))
            return false;
        
        this._ubications.set(agent.Name, destination.name);
        actualLocation.remove(agent);
        destination.append([ agent ]);
        return true;
    }

    areInTheSameLocation(first: Agent, second: Agent): boolean{
        if(first == null || second == null || !this._ubications.has(first.Name) || !this._ubications.has(second.Name))
            return false;
        
        return this._ubications.get(first.Name) === this._ubications.get(second.Name);
    }
}