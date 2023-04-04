import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";

// test for batch mint token instruction on DARC

describe("batch_trasnfer_tokens_test", function () {

  
  it ("should mint tokens", async function () {

    const DARC = await ethers.getContractFactory("DARC");
    const darc = await DARC.deploy();
    console.log("DARC address: ", darc.address);
    await darc.deployed();
    await darc.initialize();


    const programOperatorAddress = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";


    // create a token class first
    await darc.entrance({
      programOperatorAddress: programOperatorAddress,
      operations: [{
        operatorAddress: programOperatorAddress,
        opcode: 2, // create token class
        param: {
          UINT256_ARRAY: [],
          ADDRESS_ARRAY: [],
          STRING_ARRAY: ["Class1", "Class2"],
          BOOL_ARRAY: [],
          VOTING_RULE_ARRAY: [],
          PARAMETER_ARRAY: [],
          PLUGIN_ARRAY: [],
          UINT256_2DARRAY: [
            [BigNumber.from(0), BigNumber.from(1)],
            [BigNumber.from(10), BigNumber.from(1)],
            [BigNumber.from(10), BigNumber.from(1)],
          ],
          ADDRESS_2DARRAY: []
        }
      }], 
    });

    // transfer tokens to another 2 addresses
    const target1 = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC';

    const target2 = '0x90F79bf6EB2c4f870365E785982E1f101E93b906';

    // mint tokens
    await darc.entrance({
      programOperatorAddress: programOperatorAddress,
      operations: [{
        operatorAddress: programOperatorAddress,
        opcode: 1, // mint token
        param: {
          UINT256_ARRAY: [],
          ADDRESS_ARRAY: [],
          STRING_ARRAY: [],
          BOOL_ARRAY: [],
          VOTING_RULE_ARRAY: [],
          PARAMETER_ARRAY: [],
          PLUGIN_ARRAY: [],
          UINT256_2DARRAY: [
            [BigNumber.from(0), BigNumber.from(1)],  // token class = 0
            [BigNumber.from(100), BigNumber.from(200)], // amount = 100
          ],
          ADDRESS_2DARRAY: [
            [programOperatorAddress,programOperatorAddress], // to = programOperatorAddress
          ]
        }
      },
      {
        operatorAddress: programOperatorAddress,
        opcode: 3, // transfer tokens
        param:{
          UINT256_ARRAY: [],
          ADDRESS_ARRAY: [],
          STRING_ARRAY: [],
          BOOL_ARRAY: [],
          VOTING_RULE_ARRAY: [],
          PARAMETER_ARRAY: [],
          PLUGIN_ARRAY: [],
          UINT256_2DARRAY: [
            [BigNumber.from(0),BigNumber.from(0), BigNumber.from(1), BigNumber.from(1)],  // token class = 0
            [BigNumber.from(10), BigNumber.from(20), BigNumber.from(30), BigNumber.from(40)], // amount = 100
          ],
          ADDRESS_2DARRAY: [
            [target1, target2, target1, target2], 
          ]
        }
      }], 
    });

    // check balance of target 1 and target 2, 
    // target 1 has 10 tokens of class 0, 30 tokens of class 1
    // target 2 has 20 tokens of class 0, 40 tokens of class 1
    expect((await darc.getTokenOwnerBalance(0, target1)).toBigInt().toString()).to.equal("10");
    expect((await darc.getTokenOwnerBalance(1, target1)).toBigInt().toString()).to.equal("30");
    expect((await darc.getTokenOwnerBalance(0, target2)).toBigInt().toString()).to.equal("20");
    expect((await darc.getTokenOwnerBalance(1, target2)).toBigInt().toString()).to.equal("40");

  });
});