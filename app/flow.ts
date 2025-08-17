import * as fcl from "@onflow/fcl";
import flowJSON from "@/flow.json";

// Minimal config (Testnet example). Swap to mainnet as needed.
fcl
  .config()
  .put("flow.network", "testnet")
  .put("accessNode.api", "https://rest-testnet.onflow.org")
  .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn")
  // .put("walletconnect.projectId", "YOUR_PROJECT_ID")
  .put("app.detail.title", "Bounty Blocks")
  .put("app.detail.icon", "https://i.imgur.com/OurETns.png")
  .put(
    "app.detail.description",
    "Secure, private, and transparent bug bounty platform"
  )
  .put("app.detail.url", "https://github.com/orgs/Bounty-Blocks")
  .put("0xFlowToken", "0x7e60df042a9c0868")
  .load({ flowJSON });

export { fcl };

// Fetch account keys by address (with or without 0x prefix)
export async function getAccountPublicKeys(address) {
  const acct = await fcl.account(address); // returns { address, balance, keys, contracts, ... }
  return acct.keys
    .filter(k => !k.revoked) // ignore revoked keys
    .map(k => ({
      keyId: k.index, // the key id on the account
      publicKeyHex: k.publicKey, // hex-encoded public key
      signAlgo: k.signAlgoString, // "ECDSA_P256" | "ECDSA_secp256k1"
      hashAlgo: k.hashAlgoString, // "SHA2_256" | "SHA3_256"
      weight: k.weight,
      sequenceNumber: k.sequenceNumber,
    }));
}

export async function callCadenceScript() {
  const response = await fcl.query({
    cadence: `
    access(all) struct Point {
      access(all) var x: Int
      access(all) var y: Int

      init(x: Int, y: Int) {
        self.x = x
        self.y = y
      }
    }

    access(all) fun main(): [Point] {
	  
      return [Point(x: 1, y: 1), Point(x: 2, y: 2)]
    }
  `,
  });
  return response;
}

export async function callCadenceTransaction(transactionString: string) {
  const transactionId = await fcl.mutate({
    cadence: transactionString,
    authorizations: [], // @NOTE: Authorizations had to explicitly be empty if no prepare function is used
    limit: 50,
  });

  const transaction = await fcl.tx(transactionId).onceExecuted();
  return transaction;
}

export async function callCadenceTransactionWithPrepare() {
  const transactionId = await fcl.mutate({
    cadence: `
    transaction {
      prepare(acct: &Account) {
        log("Hello from prepare")
      }

	  execute {
		log("Company created")
	  }
    }
  `,
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    authorizations: [fcl.currentUser],
    limit: 50,
  });

  const transaction = await fcl.tx(transactionId).onceExecuted();
  return transaction;
}

export const FLOW_COMPANY_SIGNUP_TXN = `
transaction {
  prepare(signer: AuthAccount) {
    signer.save(<- create Company(name: "My Company", description: "My Company Description"), to: /storage/company)
  }
}
`