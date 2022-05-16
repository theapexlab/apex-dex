import chai, {expect} from "chai"
import {Contract, constants, BigNumber} from "ethers"
import {solidity, MockProvider, createFixtureLoader} from "ethereum-waffle"

import {getCreate2Address} from "./fixtures/utils"
import {factoryFixture} from "./fixtures/fixtures"

import Pair from "../artifacts/contracts/core/Pair.sol/Pair.json"

chai.use(solidity)

const TEST_ADDRESSES: [string, string] = ["0x1000000000000000000000000000000000000000", "0x2000000000000000000000000000000000000000"]

describe("Apex-dex factory", () => {
  const provider = new MockProvider({
    ganacheOptions: {
      hardfork: "istanbul",
      mnemonic: "horn horn horn horn horn horn horn horn horn horn horn horn",
      gasLimit: 9999999,
    },
  })
  const [wallet, other] = provider.getWallets()
  const loadFixture = createFixtureLoader([wallet, other], provider)

  let factory: Contract
  beforeEach(async () => {
    const fixture = await loadFixture(factoryFixture)
    factory = fixture.factory
  })

  it("should calculate the feeTo value correctly", async () => {
    expect(await factory.feeTo()).to.eq(constants.AddressZero)
  })

  it("should calculate the allPairsLength value correctly", async () => {
    expect(await factory.allPairsLength()).to.eq(0)
  })

  async function createPair(tokens: [string, string]) {
    const create2Address = getCreate2Address(factory.address, tokens, Pair.bytecode)
    await expect(factory.createPair(...tokens))
      .to.emit(factory, "PairCreated")
      .withArgs(TEST_ADDRESSES[0], TEST_ADDRESSES[1], create2Address, BigNumber.from(1))

    await expect(factory.createPair(...tokens)).to.be.reverted // PAIR_EXISTS
    await expect(factory.createPair(...tokens.slice().reverse())).to.be.reverted // PAIR_EXISTS
    expect(await factory.getPair(...tokens)).to.eq(create2Address)
    expect(await factory.getPair(...tokens.slice().reverse())).to.eq(create2Address)
    expect(await factory.allPairs(0)).to.eq(create2Address)
    expect(await factory.allPairsLength()).to.eq(1)

    const pair = new Contract(create2Address, JSON.stringify(Pair.abi), provider)
    expect(await pair.factory()).to.eq(factory.address)
    expect(await pair.token0()).to.eq(TEST_ADDRESSES[0])
    expect(await pair.token1()).to.eq(TEST_ADDRESSES[1])
  }

  it("should create a pair using the factory with the test address", async () => {
    await createPair(TEST_ADDRESSES)
  })

  it("should create a pair using the factory with the reversed test address", async () => {
    await createPair(TEST_ADDRESSES.slice().reverse() as [string, string])
  })

  it("should create a pair using the factory ", async () => {
    const tx = await factory.createPair(...TEST_ADDRESSES)
    const receipt = await tx.wait()
    expect(receipt.gasUsed).to.eq(4281633)
  })
})
