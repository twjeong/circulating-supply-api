
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
      const rawBalance = await token.methods.balanceOf(addr).call();
      excludedTotal += parseFloat(web3.utils.fromWei(rawBalance, 'ether'));
    }

    const circulatingSupply = totalSupply - excludedTotal;
    return { circulating_supply: circulatingSupply };
  }
}
