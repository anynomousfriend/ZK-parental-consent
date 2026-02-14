import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
}

export type ImpureCircuits<PS> = {
  grant_consent(context: __compactRuntime.CircuitContext<PS>,
                child_id_hash_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  verify_minor_access(context: __compactRuntime.CircuitContext<PS>,
                      child_id_hash_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  grant_consent(context: __compactRuntime.CircuitContext<PS>,
                child_id_hash_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  verify_minor_access(context: __compactRuntime.CircuitContext<PS>,
                      child_id_hash_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
}

export type Ledger = {
  consent_registry: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): boolean;
    [Symbol.iterator](): Iterator<[bigint, boolean]>
  };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
