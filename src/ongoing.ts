import { Effect, EffectDirection, EffectReaction, Reactions, Situation, apply } from "npc-emotional";
import { Phrase } from "./phrase";
import { IDeliverer, IInteraction } from "./interfaces";
import { TruthTable } from "first-order-logic";
import { Roles } from "./roles";
import { MapStructure, Location } from "./location";
import { Step } from "./step";
import { Input } from "./input";
import { Crowd } from "./agent";
import { StringBuilder } from "builder-of-strings";
import { randomFromList } from "role-methods";

export class OnGoingInteraction{
    private _deliverer: IDeliverer;
    private _effect: Effect;
    private _performerRole:string;
    private _targetRole:string;
    private _actualPhrase: Phrase;
    private _onGoingPostconditions: TruthTable;

    private _roles: Roles;
    private _map: MapStructure;
    private _interaction: IInteraction;

    constructor(interaction: IInteraction, roles: Roles, map: MapStructure){
        if(interaction == null)
            throw new Error("Interaction cannot be null.");
        
        if(roles == null)
            throw new Error("Roles cannot be null.");
        
        if(map == null)
            throw new Error("Map cannot be null.");
        
        this._interaction = interaction;
        this._roles = roles;
        this._map = map;

        this._effect = Effect.null();
        this._performerRole = null;
        this._targetRole = null;
        this._onGoingPostconditions = new TruthTable();
    }

    get interaction(){
        return this._interaction;
    }

    get roles(){
        return this._roles;
    }

    get map(){
        return this._map;
    }

    get isInteractionEnded(): boolean{
        return this._deliverer.isFinished && this._effect.isNull;
    }

    get location(): Location{
        return this._map.getUbication(this._roles.get(this._interaction.rolesDescriptor.main));
    }

    get postconditions(): TruthTable
    {
        this._onGoingPostconditions.join(this._interaction.postconditions(this._roles, this._map));
        return this._onGoingPostconditions;
    }

    performStep(input: Input): Step{
        this.initializeDeliverer();
        
        if (!this._effect.isNull)
            return this.calculateAgentsReactions();

        if (input.isVoid)
        {
            this._actualPhrase = this._deliverer.deliver(this._roles);
            this.forcePhraseRelations(this._actualPhrase.performerRole, this._actualPhrase.targetRole);

            if (this._roles.get(this._actualPhrase.performerRole).IsHuman && this._actualPhrase.isMultialternative)
                return Step.fromChoices(this._actualPhrase
                    .allAlternatives(this._roles)
                    .map(alternative => this._roles.assignRoles(alternative)));
            else
                return this.executePhraseAction(input);
        }
        else
            return this.executePhraseAction(input);
    }

    private initializeDeliverer(): void
    {
        if (this._deliverer == null)
            this._deliverer = this._interaction.deliverer;
    }

    private forcePhraseRelations(performerRole: string, targetRole: string): void
    {
        if (targetRole != null && targetRole.trim() !== "")
        {
            this._roles.get(performerRole).Relations.get(this._roles.get(targetRole).Name);
            this._roles.get(targetRole).Relations.get(this._roles.get(performerRole).Name);
        }
    }

    private executePhraseAction(input: Input): Step{
        let result = this._actualPhrase.action(
            this._roles, 
            new Crowd(this.location.agents), 
            input.choiceIndex);

        this._effect = result.effect;
        this._performerRole = this._actualPhrase.performerRole;
        this._targetRole = this._actualPhrase.targetRole;

        if (result.hasSentence && !this._onGoingPostconditions.exists(result.sentence))
            this._onGoingPostconditions.add(result.sentence);

        return Step.fromContent(result.content, this.isInteractionEnded);
    }

    private calculateAgentsReactions(): Step{
        let reactions = new Reactions();

        if(this._effect.direction != EffectDirection.Neutral)
        {
            var situation = this._effect.isTargeted
                ? new Situation(
                    this._roles.get(this._performerRole),
                    this._roles.get(this._effect.target),
                    this._interaction.isIntimate
                    ? this._effect.isThirdPerson
                        ? [ this._roles.get(this._targetRole) ]
                        : []
                    : this.location.agents
                        .filter(x => x.Name !== this._roles.get(this._effect.target).Name 
                            && x.Name !== this._roles.get(this._performerRole).Name))
                : new Situation(
                    this._roles.get(this._performerRole),
                    null,
                    this.location.agents
                        .filter(x => x.Name !== this._roles.get(this._performerRole).Name));

            reactions.append(apply(this._effect, situation, this._interaction.isIntimate));
        }

        this._effect = Effect.null();

        let lines: string[] = [];

        if (!reactions.any)
            lines.push("A nadie parece influirle esto.");
        else{
            for(let reactionString of reactions.elements
                .map(x => this.parseReaction(x.name, x.reaction))){
                lines.push(reactionString);
            }
        }

        return Step.fromContent(
            new StringBuilder()
                .appendSequenceLines(lines)
                .toString(), 
            this.isInteractionEnded);
    }

    parseReaction(name: string, reaction: EffectReaction): string{
        switch (reaction)
        {
            case EffectReaction.VeryPositive:
                return randomFromList(
                [
                    `A ${name} le ha extasiado esto.`,
                    `A ${name} le ha encantado.`,
                    `${name} se ha deleitado con esto.`
                ]);

            case EffectReaction.Positive:
                return randomFromList(
                [
                    `A ${name} le ha alegrado esto.`,
                    `A ${name} le ha gustado esto.`,
                    `A ${name} le ha molado esto.`
                ]);

            case EffectReaction.Negative:
                return randomFromList(
                [
                    `A ${name} no le ha gustado nada eso.`,
                    `A ${name} no le ha parecido bien esto.`,
                    `A ${name} no le ha enrollao esto.`,
                    `A ${name} le sentado mal esto.`,
                    `A ${name} le ha puesto triste esto.`
                ]);

            case EffectReaction.VeryNegative:
                return randomFromList(
                [
                    `A ${name} le ha disgustado esto notablemente.`,
                    `A ${name} le ha sentado fatal esto.`,
                    `A ${name} le ha parecido una mierda esto.`,
                    `A ${name} le ha jodido notablemente esto.`
                ]);

            default:
                return "";
        }
    }

    equals(other: OnGoingInteraction): boolean{
        return this._interaction.equals(other.interaction) && this._roles.equals(other.roles);
    }

    toString(): string
    {
        return this._roles.assignRoles(this._interaction.description);
    }
}