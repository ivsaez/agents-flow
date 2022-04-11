import { Roles, RolesDescriptor } from "./roles";
import { Phrase } from "./phrase";
import { TruthTable } from "first-order-logic";
import { MapStructure } from "./location";
import { Agent } from ".";

export interface IDeliverer{
    isFinished: boolean;
    deliver(roles: Roles): Phrase;
}

export type Preconditions = (table: TruthTable, roles: Roles, map: MapStructure) => boolean;
export type Postconditions = (roles: Roles, map: MapStructure) => TruthTable;

export interface IInteraction{
    name: string;
    description: string;
    preconditions: Preconditions;
    postconditions: Postconditions;
    isIntimate: boolean;
    deliverer: IDeliverer;
    rolesDescriptor: RolesDescriptor;
    timing: Timing;

    intimate():IInteraction;
    getPermutations(main: Agent, other: Agent[]): Roles[];
    equals(interaction: IInteraction): boolean;
    globallyEquals(interaction: IInteraction): boolean;
}

export enum Timing{
    Single,
    GlobalSingle,
    Repeteable
}