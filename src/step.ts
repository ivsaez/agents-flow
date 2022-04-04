import { StringBuilder } from "builder-of-strings";

export class Step{
    private _content: StringBuilder;
    private _ender: boolean;
    private _choices: Choices;

    private constructor(){
    }

    get content(): string{
        return this._content == null
            ? null
            : this._content.toString();
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

    append(text: string): Step{
        this._content.appendLine(text);
        return this;
    }

    toString(): string{
        return this.hasChoices
            ? this.choices.toString()
            : this.content;
    }

    static fromContent(content: string, isEnder: boolean = false): Step{
        if(content == null || content.trim() === "")
            throw new Error("Content cannot be empty.");
        
        let step = new Step();
        step._content = new StringBuilder(content);
        step._ender = isEnder;
        step._choices = null;

        return step;
    }

    static fromChoices(choices: string[]): Step{
        if(choices == null || choices.length === 0)
            throw new Error("Choices cannot be empty.");
        
        let step = new Step();
        step._content = null;
        step._ender = false;
        step._choices = new Choices(choices); 

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

    isValidItem(index: number): boolean{
        return index >= 0 && index < this._items.length;
    }

    toString(): string
    {
        return new StringBuilder()
            .appendSequenceLines(this._items.map((item, index) => `[${index} - ${item}]`))
            .toString();
    }
}