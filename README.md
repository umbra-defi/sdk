## Umbra SDK (Solana / Arcium Privacy Client)

The **Umbra SDK** is a TypeScript library that provides a high–level client for interacting with the
Umbra Privacy protocol on Solana, including its Arcium Multi‑Execution Environment (MXE) components.
It wraps low‑level on‑chain programs, cryptographic primitives, and MXE flows behind a small number
of composable, well‑typed classes:

- `UmbraClient`: High–level façade for all on‑chain operations.
- `UmbraWallet`: Key‑management, encryption, and viewing‑key utilities.
- `RelayerForwarder` / `ConnectionBasedForwarder`: Transaction forwarding strategies.
- `WasmZkProver`: WASM + snarkjs‑based Groth16 prover implementation.

This SDK is intended to be embedded in wallets, dApps, and backend services that:

- Register and manage Umbra/Arcium encrypted user accounts.
- Generate and verify zero‑knowledge proofs for anonymity features.
- Deposit to and withdraw from privacy‑preserving mixer pools (SOL and SPL).
- Work with encrypted balances, viewing keys, and Rescue/Poseidon/SHA‑3 based commitments.

The library is written in **TypeScript**, built with **tsup**, and exports both **ESM** and **CJS**
bundles plus full type declarations.

---

## Installation

Install via your preferred package manager (pnpm is used in this repository):

```bash
pnpm add umbra-sdk-version
```

or, if you’re working directly in this repository:

```bash
pnpm install
pnpm build
```

The build step uses `tsup` to emit:

- `dist/index.mjs` – ESM entrypoint
- `dist/index.cjs` – CommonJS entrypoint
- `dist/index.d.ts` – TypeScript declarations

The `package.json` `exports` map is configured so that Node, bundlers, and TypeScript all resolve the
correct variant automatically.

---

## Project Structure

High‑level layout:

```text
src/
  client/
    implementation/
      connection-based-forwarder.ts
      relayer-forwarder.ts
      rescue-cipher.ts
      wasm-zk-prover.ts
    instruction-builders/
      account-initialisation.ts
      compliance.ts
      conversion.ts
      deposit.ts
      fees.ts
      freezing.ts
      global.ts
      relayer.ts
      transfer.ts
      withdraw.ts
    interface/
      index.ts
      signer.ts
      transaction-forwarder.ts
      zk-prover.ts
    umbra-client.ts
    umbra-wallet.ts
    index.ts
  constants/
  idl/
  types/
  utils/
```

### `src/client/`

- **`umbra-client.ts`**
  - Main entrypoint for consumers.
  - Holds:
    - `UmbraClient` – typed around a generic transaction-forwarder result `T`.
    - Methods for:
      - Registering accounts for **confidentiality** and/or **anonymity** (with multiple “modes”:
        `connection`, `forwarder`, `signed`, `prepared`, `raw`).
      - Generating and submitting ZK proofs (via an injected `IZkProver`).
      - Depositing publicly into mixer pools (SOL / SPL).
      - Fetching encrypted token balances.
    - Pluggable components:
      - `umbraWallet?: UmbraWallet`
      - `txForwarder?: ITransactionForwarder<T>`
      - `connectionBasedForwarder: ConnectionBasedForwarder`
      - `zkProver: IZkProver`

- **`umbra-wallet.ts`**
  - Represents a user’s Umbra wallet, derived from a Solana signer.
  - Responsibilities:
    - Deriving **master viewing keys** and associated **Poseidon / SHA‑3 blinding factors**.
    - Managing Rescue ciphers keyed by X25519 public keys.
    - Generating deterministic **nullifiers** and **random secrets** using KMAC‑based derivations.
    - Computing linker hashes for mixer deposits based on time and destination.

- **`implementation/`**
  - `connection-based-forwarder.ts` – Sends transactions directly via a `Connection`.
  - `relayer-forwarder.ts` – Forwards signed transactions to a relayer / external service.
  - `rescue-cipher.ts` – Thin wrapper around Rescue encryption primitives.
  - `wasm-zk-prover.ts` – `WasmZkProver` implementation of `IZkProver` using `snarkjs.groth16`,
    lazily loading circuit artifacts and converting inputs/outputs to the required formats.

- **`instruction-builders/`**
  - One file per logical instruction family (account initialisation, conversion, deposits, fees,
    withdrawals, etc.).
  - Each builder:
    - Derives PDAs and Arcium account offsets.
    - Prepares typed arguments for Anchor/IDL methods.
    - Returns a `TransactionInstruction`, not a full transaction.
  - `umbra-client` composes these instructions into `VersionedTransaction`s.

- **`interface/`**
  - `signer.ts` – Defines the `ISigner` abstraction used by `UmbraClient` / `UmbraWallet`.
  - `transaction-forwarder.ts` – `ITransactionForwarder<T>` for forwarding strategy injection.
  - `zk-prover.ts` – `IZkProver` interface to allow multiple prover backends (`WasmZkProver`,
    future RapidSnark implementations, etc.).

### `src/constants/`

- Protocol constants and pre‑computed values:
  - `anchor.ts` – Anchor/IDL‑related constants (e.g. `WSOL_MINT_ADDRESS`).
  - `arcium.ts` – Arcium‑specific configuration.
  - `poseidon_constants.json` / `poseidon.ts` – Poseidon hash parameters.
  - `zk.ts` – ZK circuit identifiers and configuration.

### `src/idl/`

- Contains the Anchor IDL and program type definitions:
  - `idl.json` – Full generated IDL of the Umbra program.
  - `idl.ts` – TypeScript binding for the IDL.
  - `index.ts` – Convenience re‑exports.

### `src/types/`

- Branded types for:
  - Cryptographic primitives (`U128`, `U256`, `PoseidonHash`, `Sha3Hash`, `RescueCiphertext`, etc.).
  - Solana–specific concepts (`SolanaAddress`, `SolanaTransactionSignature`, `MintAddress`).
  - Arcium / MXE concepts (`ArciumX25519PublicKey`, `ArciumX25519Nonce`, offsets, time components).
- Strong typing here is used throughout the client to prevent mixing incompatible values.

### `src/utils/`

- **`miscellaneous.ts`**
  - Utility helpers like `isBitSet`, `generateRandomU256`, and `breakPublicKeyIntoTwoParts`.
  - These are heavily documented with JSDoc and examples.

- **`convertors.ts`**
  - Conversions between `bigint` and branded byte types (`BeBytes`, `LeBytes`).
  - Helpers for U128/U256, transaction input types, and decimal string ↔ `bigint`.

- **`hasher.ts`**
  - Poseidon hashing helpers, including aggregation functions:
    - `aggregateSha3HashIntoSinglePoseidonRoot` – bit‑level processing + two‑layer Poseidon tree.
  - Wraps Poseidon parameters from `constants/poseidon_*`.

- **`pda-generators.ts`**
  - Functions to derive program‑derived addresses (PDAs) for:
    - Arcium encrypted user accounts.
    - Encrypted token accounts.
    - Fees/commission pools, nullifier accounts, etc.
  - Each helper throws a typed `PdaGenerationError` on failure.

---

## Building & Type‑Checking

- **Build (ESM + CJS + dts)**:

```bash
pnpm build
```

- **Watch mode (for local development)**:

```bash
pnpm build:watch
```

- **Type‑check only**:

```bash
pnpm type-check
```

---

## Basic Usage

Below is a simplified example that:

1. Creates an `UmbraClient` with a connection.
2. Attaches an `UmbraWallet`.
3. Configures a WASM ZK prover.
4. Registers the account for anonymity.
5. Deposits SOL into the mixer via the unified helper.

```ts
import { Connection, Keypair } from '@solana/web3.js';
import { UmbraClient } from '@/client';
import { UmbraWallet } from '@/client/umbra-wallet';
import { WasmZkProver } from '@/client/implementation/wasm-zk-prover';
import { MXE_ARCIUM_X25519_PUBLIC_KEY } from '@/constants';

async function main() {
  // 1. Create a Solana connection
  const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');

  // 2. Create a signer and Umbra wallet
  const keypair = Keypair.generate();
  const wallet = await UmbraWallet.fromSigner({ signer: { keypair } }, {
    // UmbraWallet-specific options, e.g. MXE ciphers
    arciumX25519PublicKey: MXE_ARCIUM_X25519_PUBLIC_KEY,
  });

  // 3. Create the client and configure zk prover + wallet
  const client = await UmbraClient.create({
    connection,
  });

  client.setUmbraWallet(wallet);
  client.setZkProver(
    'wasm',
    {
      masterViewingKeyRegistration: true,
      createSplDepositWithPublicAmount: true,
      // ...enable other circuits as needed
    },
  );

  // 4. Register account for anonymity (via connection)
  const optionalData = /* some Sha3Hash optional data */ undefined as any;
  const signature = await client.registerAccountForAnonymity(optionalData, {
    mode: 'connection',
  });
  console.log('Register anonymity tx signature:', signature);

  // 5. Deposit 1 SOL into the mixer, using the unified helper
  const oneSol = 1_000_000_000n as any; // Amount branded as `Amount`
  const destination = await wallet.signer.getPublicKey();
  const wsolMint = /* WSOL mint address as MintAddress */ undefined as any;

  const solDepositResult = await client.depositPublicallyIntoMixerPool(
    oneSol,
    destination,
    wsolMint,
    { mode: 'forwarder' }, // or 'connection' / 'signed' / 'prepared' / 'raw'
  );

  console.log('SOL deposit result:', solDepositResult);
}

main().catch(console.error);
```

> **Note**
> The concrete branded types (`Amount`, `MintAddress`, `Sha3Hash`, etc.) come from `src/types`. In a
> packaged SDK you will typically import them from the root module.

---

## Design Notes

- **Strong typing & branded types**
  The SDK uses branded types to avoid accidentally mixing incompatible values
  (e.g. `PoseidonHash` vs `Sha3Hash`, or `U128` vs `U256`). This improves both safety and
  self‑documentation.

- **Mode‑based transaction handling**
  Most high‑level methods support:
  - `connection` – sign with `UmbraWallet`, send via `ConnectionBasedForwarder`, return signature.
  - `forwarder` – sign with `UmbraWallet`, forward via `txForwarder`, return generic `T`.
  - `signed` – return signed `VersionedTransaction` without submitting.
  - `prepared` – populate blockhash/fee payer, but do not sign.
  - `raw` – build a transaction message with a placeholder blockhash, caller sets everything else.

- **Pluggable ZK prover**
  The ZK prover is injected via `IZkProver`, allowing the SDK to support multiple backends
  (WASM/snarkjs, RapidSnark, remote proving services, etc.) without changing call sites.

---

## Contributing

1. Install dependencies:

```bash
pnpm install
```

2. Run type‑check and build:

```bash
pnpm type-check
pnpm build
```

3. Run formatting checks:

```bash
pnpm format:check
```

When contributing new functions or classes, please:

- Add **JSDoc** with parameter/return descriptions and at least one usage example.
- Prefer existing branded types from `src/types` where appropriate.
- Ensure `pnpm type-check` and `pnpm build` both succeed before opening a PR.


