import { Effect } from "npc-emotional";
import { Sentence } from "first-order-logic";

export class PhraseResult{
    private _content: string;
    private _effect: Effect;
    private _sentence: Sentence;

    constructor(content: string, effect: Effect, sentence: Sentence = null){
        if(content == null || content.trim() === "")
            throw new Error("Content cannot be empty.");

        if(effect == null)
            throw new Error("Effect cannot be null.");
        
        this._content = content;
        this._effect = effect;
        this._sentence = sentence;
    }

    get content(){
        return this._content;
    }

    get effect(){
        return this._effect;
    }

    get sentence(){
        return this._sentence;
    }

    get hasSentence(): boolean{
        return this._sentence !== null;
    }
}