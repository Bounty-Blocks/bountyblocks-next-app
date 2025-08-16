# Readme for walrus & sui

## [Walrus wallet setup](https://docs.wal.app/usage/setup.html)

1. Install sui
2. Install walrus
3. Create a wallet: ```./walrus generate-sui-wallet --sui-network testnet```
      1. note: If you can add ```walrus``` to your path, do that.  Otherwise, cd into its install location and run it with ```./walrus```
      2. Store the address outputted here
4. Hit the sui faucet
5. Convert it to wal ```./walrus get-wal --config client_config_testnet.yaml```

/Users/theo/Projects/ETHGlobal 2025 NYC/bountyblocks-next-app/walrus-tools

Walrus sitebuilder command: ```/Applications/site-builder-testnet-latest-macos-arm64```

List addresses: ```sui client active-address```

See balances: ```sui client gas```

Sui testnet faucet: <https://faucet.sui.io/?network=testnet>

### Testnet configuration parameters

```system_object: 0x6c2547cbbc38025cf3adac45f63cb0a8d12ecf777cdc75a4971612bf97fdf6af
staking_object: 0xbe46180321c30aab2f8b3501e24048377287fa708018a5b7c2792b35fe339ee3
exchange_objects:
  - 0xf4d164ea2def5fe07dc573992a029e010dba09b1a8dcbc44c5c2e79567f39073
  - 0x19825121c52080bb1073662231cfea5c0e4d905fd13e95f21e9a018f2ef41862
  - 0x83b454e524c71f30803f4d6c302a86fb6a39e96cdfb873c2d1e93bc1c26a3bc5
  - 0x8d63209cf8589ce7aef8f262437163c67577ed09f3e636a9d8e0813843fb8bf1
rpc_urls:
  - https://fullnode.testnet.sui.io:443
```

Get a walrus wallet: ```walrus get-wal```

## Walrus site deployment

1. run ```npm run build```
2. ```./walrus-bin/site-builder-testnet deploy ../out --epochs 1```

Site object ID: 0xfd3ca0c5b0bbb9a8a2edb222f946a6ff99857c2aac4b323be528f38d44e71990

### [SuiNS](https://testnet.suins.io/)

Later on...
