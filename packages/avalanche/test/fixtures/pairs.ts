import {BigNumber} from "ethers"
import {expandTo18Decimals} from "../utils"

const formatCases = (cases: (string | number)[][]) => cases.map((a) => a.map((n) => (typeof n === "string" ? BigNumber.from(n) : expandTo18Decimals(n))))

export const swapCases = [
  // swapAmount, token0Amount, token1Amount, expectedOutputAmount
  [1, 5, 10, "1662497915624478906"],
  [1, 10, 5, "453305446940074565"],

  [2, 5, 10, "2851015155847869602"],
  [2, 10, 5, "831248957812239453"],

  [1, 10, 10, "906610893880149131"],
  [1, 100, 100, "987158034397061298"],
  [1, 1000, 1000, "996006981039903216"],
]

export const formattedSwapCases: BigNumber[][] = formatCases(swapCases)

export const optimisticCases = [
  ["997000000000000000", 5, 10, 1], // given amountIn, amountOut = floor(amountIn * .997)
  ["997000000000000000", 10, 5, 1],
  ["997000000000000000", 5, 5, 1],
  [1, 5, 5, "1003009027081243732"], // given amountOut, amountIn = ceiling(amountOut / .997)
]

export const formattedOptimisticCases: BigNumber[][] = formatCases(optimisticCases)
