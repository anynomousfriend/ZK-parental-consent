export function ledger(stateOrChargedState: any): {
    consent_registry: {
        isEmpty(...args_0: any[]): boolean;
        size(...args_0: any[]): bigint;
        member(...args_0: any[]): boolean;
        lookup(...args_0: any[]): boolean;
        [Symbol.iterator](...args_0: any[]): any;
    };
};
export class Contract {
    constructor(...args_0: any[]);
    witnesses: any;
    circuits: {
        grant_consent: (...args_1: any[]) => {
            result: any[];
            context: any;
            proofData: {
                input: {
                    value: __compactRuntime.Value;
                    alignment: __compactRuntime.Alignment;
                };
                output: undefined;
                publicTranscript: never[];
                privateTranscriptOutputs: never[];
            };
            gasCost: any;
        };
        revoke_consent: (...args_1: any[]) => {
            result: any[];
            context: any;
            proofData: {
                input: {
                    value: __compactRuntime.Value;
                    alignment: __compactRuntime.Alignment;
                };
                output: undefined;
                publicTranscript: never[];
                privateTranscriptOutputs: never[];
            };
            gasCost: any;
        };
        verify_minor_access: (...args_1: any[]) => {
            result: boolean;
            context: any;
            proofData: {
                input: {
                    value: __compactRuntime.Value;
                    alignment: __compactRuntime.Alignment;
                };
                output: undefined;
                publicTranscript: never[];
                privateTranscriptOutputs: never[];
            };
            gasCost: any;
        };
    };
    impureCircuits: {
        grant_consent: (...args_1: any[]) => {
            result: any[];
            context: any;
            proofData: {
                input: {
                    value: __compactRuntime.Value;
                    alignment: __compactRuntime.Alignment;
                };
                output: undefined;
                publicTranscript: never[];
                privateTranscriptOutputs: never[];
            };
            gasCost: any;
        };
        revoke_consent: (...args_1: any[]) => {
            result: any[];
            context: any;
            proofData: {
                input: {
                    value: __compactRuntime.Value;
                    alignment: __compactRuntime.Alignment;
                };
                output: undefined;
                publicTranscript: never[];
                privateTranscriptOutputs: never[];
            };
            gasCost: any;
        };
        verify_minor_access: (...args_1: any[]) => {
            result: boolean;
            context: any;
            proofData: {
                input: {
                    value: __compactRuntime.Value;
                    alignment: __compactRuntime.Alignment;
                };
                output: undefined;
                publicTranscript: never[];
                privateTranscriptOutputs: never[];
            };
            gasCost: any;
        };
    };
    initialState(...args_0: any[]): {
        currentContractState: __compactRuntime.ContractState;
        currentPrivateState: any;
        currentZswapLocalState: __compactRuntime.EncodedZswapLocalState;
    };
    _grant_consent_0(context: any, partialProofData: any, child_id_hash_0: any): never[];
    _revoke_consent_0(context: any, partialProofData: any, child_id_hash_0: any): never[];
    _verify_minor_access_0(context: any, partialProofData: any, child_id_hash_0: any): boolean;
}
export const pureCircuits: {};
export namespace contractReferenceLocations {
    let tag: string;
    let indices: {};
}
import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
