export class Input{
    private _choiceIndex: number;

    constructor(choiceIndex: number){
        this._choiceIndex = choiceIndex;
    }

    get choiceIndex(){
        return this._choiceIndex;
    }

    get isVoid(): boolean{
        return this._choiceIndex < 0;
    }

    static void(): Input{
        return new Input(-1);
    }
}