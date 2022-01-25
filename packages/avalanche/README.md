# Avalanche Smart Contracts

The smart contract is written in Solidity, so it works on every blockchain network which can interpret the Solidity smart contracts.
However in this demo application, we will use the Avalanche blockchain, so the network setup parts work for you only if you are using Avalanche as well.

Read more about the Avalanche blockchain [here](https://docs.avax.network/learn/getting-started).

## Testing the smart contracts

For testing purpuses we will use [Hardhat](https://hardhat.org/getting-started/).

1. intall the npm packages: `yarn`

2. fill out the `.env` file based on the `.env.example`

3. run the tests: `yarn run test`

## Networks setup

After these steps you will be able to interact with the DEX locally.

1. [Create a Local Test Network](https://docs.avax.network/build/tutorials/platform/create-a-local-test-network)

2. [Fund a Local Test Network](https://docs.avax.network/build/tutorials/platform/fund-a-local-test-network)

## Deploy the smart contracts

We will use hardhat for our smart contract deployment. Be aware, the smart contracts on the network are immutable, you can't easily update them, but you can deploy a new one. In this case, the contract address changes and every asset stored on the original contract will stay in the original contract, you need to provide a solution for the migration. On the local and the test network it is not so important because the tokens are not real, so it is not necessarily causing any damage.

1. Start the local Avalanche network based on your network setup

2. Deploy the smart contracts to the local network: `yarn run deploy --network local`

3. Save the deployed address from the console and use it as an env variable in the front-end project (you need to update the address every time when you redeploy a smart contract)
