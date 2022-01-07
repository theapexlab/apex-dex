// Load dependencies
import { ethers } from 'hardhat';
import { BigNumber, Contract, Signer } from 'ethers';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

chai.use(chaiAsPromised);

const expect = chai.expect;

// Start test block
describe('Automated Market Maker test', () => {
  let contract: Contract;
  let accounts: SignerWithAddress[] = [];

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    // Deploy a new AMM contract for each test
    // Use the first signer by default
    const AMM = await ethers.getContractFactory('AMM', accounts[0]);
    contract = await AMM.deploy();
  });

  // Test case
  it('should return with the default holdings', async () => {
    // Store a value - recall that only the owner account can do this!
    const myHolding = await contract.getMyHoldings();

    expect(myHolding.amountToken1).to.eql(BigNumber.from(0));
    expect(myHolding.amountToken2).to.eql(BigNumber.from(0));
    expect(myHolding.myShare).to.eql(BigNumber.from(0));
  });

  it('should return with the updated amounts', async () => {
    const token1Amount = BigNumber.from(1000);
    const token2Amount = BigNumber.from(2000);
    await contract.faucet(token1Amount, token2Amount);

    const myHolding = await contract.getMyHoldings();

    expect(myHolding.amountToken1).to.eql(token1Amount);
    expect(myHolding.amountToken2).to.eql(token2Amount);
    expect(myHolding.myShare).to.eql(BigNumber.from(0));
  });

  it('should throw an error if the user wants to provide 0', async () => {
    const token10000 = BigNumber.from(0);
    const token20000 = BigNumber.from(2000);

    await expect(contract.provide(token10000, token20000)).to.be.rejectedWith(`Amount cannot be zero!`);
  });

  it('should throw an error if the user has not enough balance', async () => {
    const token10000 = BigNumber.from(1000);
    const token20000 = BigNumber.from(2000);

    await expect(contract.provide(token10000, token20000)).to.be.rejectedWith(`Insufficient amount`);
  });

  it('should calculate the pool details correctly after providing liquidity', async () => {
    const token10000 = BigNumber.from(1000);
    const token20000 = BigNumber.from(2000);

    // Send token to the user
    await contract.faucet(token20000, token20000);

    await contract.provide(token10000, token20000);

    const poolDetails = await contract.getPoolDetails();
    const myHolding = await contract.getMyHoldings();

    expect(poolDetails).to.eql([token10000, token20000, BigNumber.from(100000000)]);
    expect(myHolding).to.eql([token10000, BigNumber.from(0), BigNumber.from(100000000)]);
  });

  it('should return the required token based on the provided 50-50 initial liquidity', async () => {
    const token10000 = BigNumber.from(1000);

    // Send token to the user
    await contract.faucet(token10000, token10000);

    // 50-50% initial liquidity
    await contract.provide(token10000, token10000);

    const numbers = [500, 1000, 2000, 5000];

    const estimations = await Promise.all(
      numbers.map(async (num) => contract.getEquivalentToken1Estimate(BigNumber.from(num)))
    );

    // 50-50 liquidity reuires equal tokens
    expect(estimations).to.eql(numbers.map(BigNumber.from));
  });

  it('should return the required token based on the provided different initial liquidity (1:5)', async () => {
    const token10000 = BigNumber.from(1000);
    const token50000 = BigNumber.from(5000);

    // Send token to the user
    await contract.faucet(token10000, token50000);

    // 50-50% initial liquidity
    await contract.provide(token10000, token50000);

    const numbers = [500, 1000, 2000, 5000];

    const estimations = await Promise.all(
      numbers.map(async (num) => contract.getEquivalentToken1Estimate(BigNumber.from(num)))
    );

    // 50-50 liquidity reuires equal tokens
    expect(estimations).to.eql(numbers.map((num) => BigNumber.from(num / 5)));
  });

  it('should return the required token based on the provided different initial liquidity', async () => {
    const token10000 = BigNumber.from(1000);
    const token50000 = BigNumber.from(5000);

    // Send token to the user
    await contract.faucet(token50000, token50000);

    // 50-50% initial liquidity
    await contract.provide(token10000, token10000);

    await contract.provide(BigNumber.from(2000), BigNumber.from(2000));

    const poolDetails = await contract.getPoolDetails();

    // 50-50 liquidity reuires equal tokens
    expect(poolDetails).to.eql([BigNumber.from(3000), BigNumber.from(3000), BigNumber.from(300000000)]);
  });

  it('should return the correct holding and pool data with two different user', async () => {
    const token10000 = BigNumber.from(1000);
    const token50000 = BigNumber.from(5000);

    const contractUser2 = contract.connect(accounts[1]);

    // Send token to the user
    await contract.faucet(token50000, token50000);
    await contractUser2.faucet(token50000, token50000);

    // 50-50% initial liquidity
    await contract.provide(token10000, token10000);
    await contractUser2.provide(token50000, token50000);

    const user1Holdings = await contract.getMyHoldings();
    const user2Holdings = await contractUser2.getMyHoldings();

    // The pool details should be equal
    const poolDetailsBasedUser1 = await contract.getPoolDetails();
    const poolDetailsBasedUser2 = await contractUser2.getPoolDetails();

    // 50-50 liquidity reuires equal tokens
    expect(poolDetailsBasedUser1).to.eql(poolDetailsBasedUser2);
    expect(poolDetailsBasedUser2).to.eql([BigNumber.from(6000), BigNumber.from(6000), BigNumber.from(600000000)]);
    expect(user1Holdings).to.eql([BigNumber.from(4000), BigNumber.from(4000), BigNumber.from(100000000)]);
    expect(user2Holdings).to.eql([BigNumber.from(0), BigNumber.from(0), BigNumber.from(500000000)]);
  });

  it('should return the correct withdraw amount of the tokens', async () => {
    const token10000 = BigNumber.from(1000);
    const token50000 = BigNumber.from(5000);

    // Send token to the user
    await contract.faucet(token50000, token50000);

    // 50-50% initial liquidity
    await contract.provide(token10000, token10000);

    await contract.provide(BigNumber.from(2000), BigNumber.from(2000));

    await contract.withdraw(BigNumber.from(100000000));

    const poolDetails = await contract.getPoolDetails();

    expect(poolDetails).to.eql([BigNumber.from(2000), BigNumber.from(2000), BigNumber.from(200000000)]);
  });

  it('should estimate the swap tokens correctly', async () => {
    const token10000 = BigNumber.from(1000);

    // Send token to the user
    await contract.faucet(token10000, token10000);

    // 50-50% initial liquidity
    await contract.provide(token10000, token10000);

    const token2 = await contract.getSwapToken1Estimate(token10000);

    expect(token2).to.eql(BigNumber.from(500));
  });

  it('should estimate the swap tokens correctly', async () => {
    const token10000 = BigNumber.from(1000);
    const token50000 = BigNumber.from(5000);

    // Send token to the user
    await contract.faucet(token50000, token50000);

    // 50-50% initial liquidity
    await contract.provide(token10000, token10000);

    await contract.swapToken1(token10000);

    const myHolding = await contract.getMyHoldings();

    expect(myHolding.amountToken1).to.eql(BigNumber.from(3000));
    expect(myHolding.amountToken2).to.eql(BigNumber.from(4500));
    expect(myHolding.myShare).to.eql(BigNumber.from(100000000));
  });
});
