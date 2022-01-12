import { run, ethers } from 'hardhat';

async function main() {
  await run('compile');

  // Create an instance of the contract by providing the name
  const ContractSource = await ethers.getContractFactory('AMM');
  // The deployed instance of the contract
  const deployedContract = await ContractSource.deploy();

  await deployedContract.deployed();
  console.log('Contract deployed at:', deployedContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
