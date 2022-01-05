import { run, ethers } from 'hardhat';

async function main() {
  await run('compile');

  const accounts = await ethers.getSigners();

  console.log(
    'Accounts:',
    accounts.map((a) => a.address)
  );

  // Create an instance of the contract by providing the name
  const ContractSource = await ethers.getContractFactory('AMM');
  // The deployed instance of the contract
  const deployedContract = await ContractSource.deploy();

  console.log('Contract deployed at:', deployedContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
