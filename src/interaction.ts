import { IDeliverer, IInteraction, Timing } from "./interfaces";
import { Phrase } from "./phrase";
import { Roles } from "./roles";
import { Queue } from "data-structs-n-algos";

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