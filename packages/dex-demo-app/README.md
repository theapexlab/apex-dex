# DEX application

## Getting started

1. Fulfill the steps in the avalanche package to get a deployed address

2. Create an `.env.local` file based on the `.env.example` and use the deployed address as the `CONTRACT_ADDRESS` variable

3. Install the packages: `yarn`

4. Start the application: `yarn run dev`

## Features

A short description of the available features.

### Faucet

This application is a basic concept of a DEX application, so you can't use the tokens from your Metamask directly. The smart contract stores the tokens of the user and allows only two of them. To fill this virtual wallet you can use the faucet feature. Basically, you can transfer your AVAX tokens from Metamask to the smart contract to fill these virtual tokens. These will be stored in the smart contract, so be aware, if you update the contract, these will be lost.

### Pools

The application has a pool whit the two virtual tokens. You can provide liquidity to the pool to be able to swap your tokens. Because on a DEX there is no central authority, the liquidity providers supply the users with the swappable tokens.

### Swap

If the pool has liquidity, the users can swap their tokens. The actual swapping ratio is calculated on the fly based on the supply.

### Withdraw

The users can withdraw their provided liquidity from the pool. In this case, the withdrawn tokens will be removed from the pool.
