// Load dependencies
import {ethers} from "hardhat"
import {BigNumber, Contract} from "ethers"
import chai from "chai"
import chaiAsPromised from "chai-as-promised"
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers"

chai.use(chaiAsPromised)

const expect = chai.expect

// Start test block
describe("ApexERC20 contract tests", () => {
  let contract: Contract
  let accounts: SignerWithAddress[] = []

  beforeEach(async () => {
    accounts = await ethers.getSigners()
    // Deploy a new ApexERC20 contract for each test
    // Use the first signer by default
    const ApexERC20 = await ethers.getContractFactory("ApexERC20", accounts[0])
    contract = await ApexERC20.deploy()
  })

  // Test case
  it("should return with the token's name", async () => {
    // Store a value - recall that only the owner account can do this!
    const tokenName = await contract.name()

    expect(tokenName).to.eql("Apex ERC20 Liquidity")
  })
})
