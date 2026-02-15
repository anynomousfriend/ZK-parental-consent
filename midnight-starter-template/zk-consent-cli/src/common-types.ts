import { Counter, Consent, type CounterPrivateState } from '@eddalabs/zk-consent-gateway';
import type { MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import type { DeployedContract, FoundContract } from '@midnight-ntwrk/midnight-js-contracts';
import type { ImpureCircuitId } from '@midnight-ntwrk/compact-js';

export type CounterCircuits = ImpureCircuitId<Counter.Contract<CounterPrivateState>>;

export const CounterPrivateStateId = 'counterPrivateState';

export type CounterProviders = MidnightProviders<CounterCircuits, typeof CounterPrivateStateId, CounterPrivateState>;

export type CounterContract = Counter.Contract<CounterPrivateState>;

export type DeployedCounterContract = DeployedContract<CounterContract> | FoundContract<CounterContract>;

// Consent Contract Types
export type ConsentPrivateState = Record<string, never>; // Consent contract has no private state

export type ConsentCircuits = ImpureCircuitId<Consent.Contract<ConsentPrivateState>>;

export const ConsentPrivateStateId = 'consentPrivateState';

export type ConsentProviders = MidnightProviders<ConsentCircuits, typeof ConsentPrivateStateId, ConsentPrivateState>;

export type ConsentContract = Consent.Contract<ConsentPrivateState>;

export type DeployedConsentContract = DeployedContract<ConsentContract> | FoundContract<ConsentContract>;

export type UserAction = {
  increment: string | undefined;  
};

export type DerivedState = {
  readonly round: Counter.Ledger["round"];
};

export const emptyState: DerivedState = {
  round: 0n,
};
