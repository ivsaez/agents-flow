import { Effect, EffectDirection, Situation, apply } from "npc-emotional";
import { Sentence } from "first-order-logic";
import { Roles } from "./roles";
import { Crowd } from "./agent";
import { randomFromList } from "role-methods";
import { Happiness } from "npc-mind";
import { Relation } from "npc-relations";

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

const PhraseSplitter: string = ":";

export class Phrase{
    private _alternatives: Alternative[];
    private _performerRole: string;
    private _targetRole: string;
    private _isIntimate: boolean;

    constructor(performerRole: string, targetRole: string = null){
        if(performerRole == null || performerRole.trim() === "")
            throw new Error("Performer role cannot be null.");
        
        if(targetRole != null && targetRole.trim() === "")
            throw new Error("If defining target role, it can't be empty.");
        
        this._performerRole = performerRole;
        this._targetRole = targetRole;
        this._isIntimate = false;

        this._alternatives = [];
    }

    get performerRole(){
        return this._performerRole;
    }

    get targetRole(){
        return this._targetRole;
    }

    get isIntimate(){
        return this._isIntimate;
    }

    get isMultialternative(): boolean{
        return this._alternatives.length > 1;
    }

    allAlternatives(roles: Roles): string[]{
        return this._alternatives.map(a => a.text(roles));
    }

    withAlternative(alternative: TextFunc, effect: EffectFunc = null, sentence: SentenceFunc = null): Phrase{
        if(alternative == null)
            throw new Error("Alternative cannnot be null");
        
        this._alternatives.push(new Alternative(alternative, effect, sentence));
        
        return this;
    }

    intimate(): void{
        this._isIntimate = true;
    }

    action(roles: Roles, crowd: Crowd, alternativeIndex: number = -1): PhraseResult{
        let alternative = this.chooseAlternative(roles, crowd, alternativeIndex);
        let textAlternative = alternative.text(roles);

        if(textAlternative.includes(PhraseSplitter)){
            let parts = textAlternative.split(PhraseSplitter);
            return new PhraseResult(
                roles.get(Phrase.uncorcheted(parts[0])).say(roles.assignRoles(parts[1])),
                alternative.effect(roles),
                alternative.sentence == null ? null : alternative.sentence(roles)
            );
        }

        return new PhraseResult(
            roles.assignRoles(textAlternative),
            alternative.effect(roles),
            alternative.sentence == null ? null : alternative.sentence(roles)
        );
    }

    private chooseAlternative(roles: Roles, crowd: Crowd, alternativeIndex: number): Alternative{
        if(this._alternatives.length === 1) return this._alternatives[0];
        if(alternativeIndex >= 0) return this._alternatives[alternativeIndex];

        if(this.performerHasMeaningfulDesires(roles, crowd))
            return this.calculateAlternativeBasedOnDesires(roles, crowd);
        
        return this.calculateAlternativeBasedOnEmotions(roles);
    }

    private performerHasMeaningfulDesires(roles: Roles, crowd: Crowd): boolean{
        let desires = roles.get(this._performerRole).Desires;
        return desires.any && desires.anyInvolved(crowd.all);
    }

    private calculateAlternativeBasedOnDesires(roles: Roles, crowd: Crowd): Alternative{
        const MinHeuristicValue: number = -1000000;

        let performer = roles.get(this._performerRole);

        let selectedAlternative = this._alternatives[0];
        let highestPunctuation: number = MinHeuristicValue;
        for (let alternative of this._alternatives)
        {
            let punctuation: number = MinHeuristicValue;
            let effect = alternative.effect(roles);
            if(effect.direction === EffectDirection.Neutral)
            {
                punctuation = performer.Desires.heuristicTotal(crowd);
            }
            else
            {
                var alternativeStatus = crowd.copy();

                var situation = new Situation(
                    alternativeStatus.get(performer.Name),
                    alternativeStatus.get(roles.get(effect.target).Name),
                    this._isIntimate
                    ? effect.isThirdPerson
                        ? [ alternativeStatus.get(roles.get(this._targetRole).Name) ]
                        : []
                    : alternativeStatus.all
                        .filter(x =>
                            x.Name !== roles.get(effect.target).Name
                            && x.Name !== performer.Name)
                    );

                apply(effect, situation, this._isIntimate);

                punctuation = performer.Desires.heuristicTotal(alternativeStatus);
            }

            if(punctuation > highestPunctuation)
            {
                selectedAlternative = alternative;
                highestPunctuation = punctuation;
            }
        }

        return selectedAlternative;
    }

    private calculateAlternativeBasedOnEmotions(roles: Roles): Alternative{
        var direction = this._targetRole == null
            ? this.calculateEffectDirection(roles.get(this._performerRole).Happiness)
            : this.calculateEffectDirectionWithRelation(
                roles.get(this._performerRole).Relations.get(roles.get(this._targetRole).Name),
                roles.get(this._performerRole).Happiness);

        var directedAlternatives = this._alternatives
            .filter(a => a.effect(roles).direction === direction);

        if (directedAlternatives.length === 0)
            directedAlternatives = this._alternatives;

        return randomFromList(directedAlternatives);
    }

    private calculateEffectDirection(happiness: Happiness): EffectDirection{
        return happiness.isHappy
            ? EffectDirection.Positive
            : happiness.isUnhappy
                ? EffectDirection.Negative
                : EffectDirection.Neutral;
    }
    
    private calculateEffectDirectionWithRelation(relation: Relation, happiness: Happiness): EffectDirection{
        if (relation.isPonderatedGood && happiness.isHappy) return EffectDirection.Positive;
        else if (relation.isPonderatedBad && happiness.isUnhappy) return EffectDirection.Negative;
        else if (relation.isPonderatedNeutral && happiness.isNeutral) return EffectDirection.Neutral;
        else if (relation.isPonderatedNeutral && happiness.isHappy) return EffectDirection.Positive;
        else if (relation.isPonderatedNeutral && happiness.isUnhappy) return EffectDirection.Negative;
        else if (relation.isPonderatedGood && happiness.isNeutral) return EffectDirection.Positive;
        else if (relation.isPonderatedBad && happiness.isNeutral) return EffectDirection.Negative;
        else if (relation.isPonderatedGood && happiness.isUnhappy) return EffectDirection.Neutral;
        else if (relation.isPonderatedBad && happiness.isHappy) return EffectDirection.Neutral;
        else throw new Error("Not existing option.");
    }

    private static uncorcheted(input: string): string{
        return input.replace("[", "").replace("]", "");
    }
}