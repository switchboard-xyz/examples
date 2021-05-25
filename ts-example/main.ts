import {
  SystemProgram,
  Account,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
  clusterApiUrl,
} from '@solana/web3.js';
import {
  AggregatorState,
  FulfillmentManagerState,
  FulfillmentManagerAuth,
  OracleJob,
  SwitchboardAccountType,
  SwitchboardInstruction,
  addFeedJob,
  createDataFeed,
  removeFeedJob,
  initFulfillmentManagerAccount,
  createFulfillmentManager,
  createFulfillmentManagerAuth,
  createOwnedStateAccount,
  setDataFeedConfigs,
  setFulfillmentManagerConfigs,
  updateFeed,
  publishSwitchboardAccount
} from '@switchboard-xyz/switchboard-api';
import yargs = require('yargs/yargs');
const resolve = require('resolve-dir');
const bs58 = require('bs58');
const fs = require('fs');

let argv = yargs(process.argv).options({
  'dataFeedPubkey': {
    type: 'string',
    describe: "Public key of the data feed to use.",
    demand: true,
  },
  'payerFile': {
    type: 'string',
    describe: "Keypair file to pay for transactions.",
    demand: true,
  },
  'programPubkey': {
    type: 'string',
    describe: "Example program pubkey.",
    demand: true,
  },
}).argv;


async function main() {
  let connection = new Connection(clusterApiUrl('devnet', true), 'processed');
  let payerKeypair = JSON.parse(fs.readFileSync(resolve(argv.payerFile), 'utf-8'));
  let payerAccount = new Account(payerKeypair);

  let transactionInstruction = new TransactionInstruction({
    keys: [
      { pubkey: new PublicKey(argv.dataFeedPubkey), isSigner: false, isWritable: false },
    ],
    programId: new PublicKey(argv.programPubkey),
    data: Buffer.from([]),
  });

  console.log("Awaiting transaction confirmation...");
  let signature = await sendAndConfirmTransaction(connection, new Transaction().add(transactionInstruction), [
    payerAccount,
  ]);
  console.log(signature);
}

main().then(
  () => process.exit(),
  err => {
    console.error("Failed to complete action.");
    console.error(err);
    process.exit(-1);
  },
);
