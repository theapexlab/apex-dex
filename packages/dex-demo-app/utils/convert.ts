import { BigNumber } from 'ethers';
import { PRECISION } from './config';

// Convert ethereum BigNumber to simple number
export const bigNumberToNumb = (number: BigNumber) => BigNumber.from(number).toNumber();

// Get precise number from an ethereum BigNumber
export const getPrecFromBigNumb = (number: BigNumber) => BigNumber.from(number).toNumber() / PRECISION;

export const convNumToPrecBigNumb = (number: number) => BigNumber.from(number * PRECISION);
