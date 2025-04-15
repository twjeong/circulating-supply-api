
import { Controller, Get } from '@nestjs/common';
import Web3 from 'web3';
import * as dotenv from 'dotenv';
dotenv.config();

const web3 = new Web3(process.env.BSC_RPC);
const tokenABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  }
];

const token = new web3.eth.Contract(tokenABI, process.env.TOKEN_ADDRESS);
const decimals = parseInt(process.env.DECIMALS || "18");
const totalSupply = parseFloat(process.env.TOTAL_SUPPLY || "0");
const excludeAddresses = (process.env.EXCLUDE_ADDRESSES || "").split(",");

@Controller()
export class AppController {
  @Get('supply/circulating')
  async getCirculatingSupply() {
    let excludedTotal = 0;

    for (const addr of excludeAddresses) {
      try {
        const rawBalance = await token.methods.balanceOf(addr).call();

        // rawBalance가 BigInt인지 확인하고 처리
        if (rawBalance) {
          const balanceInEther = web3.utils.fromWei(
            rawBalance.toString(), // BigInt를 문자열로 변환
            'ether'
          );
          excludedTotal += parseFloat(balanceInEther);
        } else {
          console.warn(`Invalid balance format for address ${addr}:`, rawBalance);
        }
      } catch (error) {
        console.error(`Failed to fetch balance for address ${addr}:`, error);
      }
    }

    const circulatingSupply = totalSupply - excludedTotal;
    return { circulating_supply: circulatingSupply };
  }
}