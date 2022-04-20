import { Reactions } from "npc-emotional";

export class Step{
    private _content: string[];
    private _ender: boolean;
    private _choices: Choices;
    private _reactions: Reactions;

    private constructor(){
        this._content = [];
        this._choices = null;
        this._reactions = null;
    }

    get content(): string[]{
        return this._content;
    }

    get isEnder(): boolean{
        return this._ender;
    }

    get hasChoices(): boolean{
        return this._choices !== null;
    }

    get choices(): Choices{
        return this._choices;
    }

    get reactions(): Reactions{
        return this._reactions;
    }

    get hasReactions(): boolean{
        return this._reactions != null;
    }

    append(text: string): Step{
        if(text != null && text.trim() !== ""){
            this._content.push(text);
        }
        
        return this;
    }

    static fromContent(content: string, isEnder: boolean = false): Step{
        if(content == null || content.trim() === "")
            throw new Error("Content cannot be empty.");
        
        let step = new Step();
        step._content = [ content ];
        step._ender = isEnder;
        step._choices = null;

        return step;
    }

    static fromChoices(choices: string[], isEnder: boolean = false): Step{
        if(choices == null || choices.length === 0)
            throw new Error("Choices cannot be empty.");
        
        let step = new Step();
        step._ender = isEnder;
        step._choices = new Choices(choices); 

        return step;
    }

    static fromReactions(reactions: Reactions, isEnder: boolean = false): Step{
        if(reactions == null)
            throw new Error("Reactions cannot be null.");
        
        let step = new Step();
        step._ender = isEnder;
        step._reactions = reactions;

        return step;
    }
}

export class Choices{
    private _items: string[];

    constructor(items: string[]){
        if(items == null || items.length === 0)
            throw new Error("Items cannot be empty.");
        
        this._items = items;
    }

    get count(): number{
        return this._items.length;
    }

    get items(){
        return this._items;
    }

    isValidItem(index: number): boolean{
        return index >= 0 && index < this._items.length;
    }
}