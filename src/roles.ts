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