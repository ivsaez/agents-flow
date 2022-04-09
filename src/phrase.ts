import { Effect } from "npc-emotional";
import { Sentence } from "first-order-logic";
import { Roles } from "./roles";

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

export type TextFunc = (roles: Roles) => string;
export type EffectFunc = (roles: Roles) => Effect;
export type SentenceFunc = (roles: Roles) => Sentence;

export class Alternative{
    private _text: TextFunc;
    private _effect: EffectFunc;
    private _sentence: SentenceFunc;

    constructor(text: TextFunc, effect: EffectFunc = null, sentence: SentenceFunc = null){
        if(text == null)
            throw new Error("Text function cannot be null.");
        
        this._text = text;
        this._effect = (effect == null) ? (roles: Roles) => Effect.null() : effect;
        this._sentence = sentence;
    }

    get text(): TextFunc{
        return this._text;
    }

    get effect(): EffectFunc{
        return this._effect;
    }

    get sentence(): SentenceFunc{
        return this._sentence;
    }
}