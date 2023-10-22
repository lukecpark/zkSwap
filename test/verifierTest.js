const verifier = artifacts.require("verifier");
const fs = require('fs');
const BN = require('bn.js');

//TODO : Delete All 00...0 in proof.input and convert to String and add "0x"
contract('verifier', function(accounts) {
  it('verifyTx', async function() {

    //Read Proof
    let proofJson = fs.readFileSync('./zk-related/proof.json', 'utf8');
    proofJson = JSON.parse(proofJson);
    console.log(proofJson)
    const proof = proofJson.proof;
    const input = proofJson.input;
    const _proof = [];
    Object.keys(proof).forEach(key => _proof.push(proof[key]));
    _proof.push(input)

    let instance = await verifier.deployed();
    console.log('calling verifyTx with proof', _proof);
    const success = await instance.verifyTx(..._proof);
    assert(success);
    console.log("success", success);
  })
})
