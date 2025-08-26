import { Buffer } from "buffer";
import { Address } from '@stellar/stellar-sdk';
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from '@stellar/stellar-sdk/contract';
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Typepoint,
  Duration,
} from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk'
export * as contract from '@stellar/stellar-sdk/contract'
export * as rpc from '@stellar/stellar-sdk/rpc'

if (typeof window !== 'undefined') {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CAN4SK7JBJ6ROXYO2TCJWTGO6AFSPECV762SNR2C6L3V6YY3HMF3RUC2",
  }
} as const


export interface Portfolio {
  btc_balance: i128;
  kale_balance: i128;
  risk_level: u32;
  usdc_balance: i128;
  user: string;
}

export type DataKey = {tag: "Portfolio", values: readonly [string]} | {tag: "KaleTokenAddress", values: void} | {tag: "UsdcTokenAddress", values: void} | {tag: "BtcTokenAddress", values: void} | {tag: "ReflectorOracleAddress", values: void} | {tag: "SoroswapRouterAddress", values: void};

export interface Client {
  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  initialize: ({admin, kale_token, usdc_token, btc_token, reflector_oracle, soroswap_router}: {admin: string, kale_token: string, usdc_token: string, btc_token: string, reflector_oracle: string, soroswap_router: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a deposit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  deposit: ({user, amount}: {user: string, amount: i128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a set_risk transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_risk: ({user, level}: {user: string, level: u32}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_price transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_price: ({pair}: {pair: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a rebalance transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  rebalance: ({user}: {user: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a withdraw transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  withdraw: ({user}: {user: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_portfolio transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_portfolio: ({user}: {user: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Portfolio>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAQAAAAAAAAAAAAAACVBvcnRmb2xpbwAAAAAAAAUAAAAAAAAAC2J0Y19iYWxhbmNlAAAAAAsAAAAAAAAADGthbGVfYmFsYW5jZQAAAAsAAAAAAAAACnJpc2tfbGV2ZWwAAAAAAAQAAAAAAAAADHVzZGNfYmFsYW5jZQAAAAsAAAAAAAAABHVzZXIAAAAT",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABgAAAAEAAAAAAAAACVBvcnRmb2xpbwAAAAAAAAEAAAATAAAAAAAAAAAAAAAQS2FsZVRva2VuQWRkcmVzcwAAAAAAAAAAAAAAEFVzZGNUb2tlbkFkZHJlc3MAAAAAAAAAAAAAAA9CdGNUb2tlbkFkZHJlc3MAAAAAAAAAAAAAAAAWUmVmbGVjdG9yT3JhY2xlQWRkcmVzcwAAAAAAAAAAAAAAAAAVU29yb3N3YXBSb3V0ZXJBZGRyZXNzAAAA",
        "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAABgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAprYWxlX3Rva2VuAAAAAAATAAAAAAAAAAp1c2RjX3Rva2VuAAAAAAATAAAAAAAAAAlidGNfdG9rZW4AAAAAAAATAAAAAAAAABByZWZsZWN0b3Jfb3JhY2xlAAAAEwAAAAAAAAAPc29yb3N3YXBfcm91dGVyAAAAABMAAAAA",
        "AAAAAAAAAAAAAAAHZGVwb3NpdAAAAAACAAAAAAAAAAR1c2VyAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAA==",
        "AAAAAAAAAAAAAAAIc2V0X3Jpc2sAAAACAAAAAAAAAAR1c2VyAAAAEwAAAAAAAAAFbGV2ZWwAAAAAAAAEAAAAAA==",
        "AAAAAAAAAAAAAAAJZ2V0X3ByaWNlAAAAAAAAAQAAAAAAAAAEcGFpcgAAABEAAAABAAAACw==",
        "AAAAAAAAAAAAAAAJcmViYWxhbmNlAAAAAAAAAQAAAAAAAAAEdXNlcgAAABMAAAAA",
        "AAAAAAAAAAAAAAAId2l0aGRyYXcAAAABAAAAAAAAAAR1c2VyAAAAEwAAAAA=",
        "AAAAAAAAAAAAAAANZ2V0X3BvcnRmb2xpbwAAAAAAAAEAAAAAAAAABHVzZXIAAAATAAAAAQAAB9AAAAAJUG9ydGZvbGlvAAAA" ]),
      options
    )
  }
  public readonly fromJSON = {
    initialize: this.txFromJSON<null>,
        deposit: this.txFromJSON<null>,
        set_risk: this.txFromJSON<null>,
        get_price: this.txFromJSON<i128>,
        rebalance: this.txFromJSON<null>,
        withdraw: this.txFromJSON<null>,
        get_portfolio: this.txFromJSON<Portfolio>
  }
}