const SecretNote = artifacts.require("SecretNote");

const BN = require('bn.js');
const crypto = require('crypto');
const fs = require('fs');

const { getTransferZkParams } = require('../scripts/zokcmd');
const { zokratesExec } = require('../scripts/docker-helper');
const { fixProofJson } = require('../scripts/fix-proof');

contract('SecretNote', function (accounts) {

  let instance;
  let enc;

  //transfer note test #1
  const initialAmount = '5';
  const transferAmount = '3';
  const changeAmount = '2';

  //trnasfer note test #2
  const initialAmount2 = '2';
  const transferAmount2 = '1';
  const changeAmount2 = '1';

  before(async () => {
    instance = await SecretNote.deployed();
    enc = await encrypt(accounts[0].slice(2), initialAmount);
  });

  it('createNoteDummy', async function () {
    const tx = await instance.createNote(accounts[0], '0x' + initialAmount, enc);

    noteId = tx.logs[0].args.noteId;
    const index = tx.logs[0].args.index;
    console.log('Dummy(note0) noteId', noteId);
    console.log('Dummn(note0) index', index);

    // get note by noteId
    const state = await instance.notes(noteId);
    console.log('Dummy(note0) State', state.toNumber()); // state 1:Created
    console.log('allnote.length', await instance.getNotesLength()); // 1

  });

  it('transferNoteTest1', async function () {
    // zokrates : make witness command
    const res = getTransferZkParams(
      accounts[0],
      '0x' + initialAmount,
      accounts[1],
      '0x' + transferAmount,
    );

    // make witness
    await zokratesExec(res);
    // make proof.json
    await zokratesExec("./zokrates generate-proof --proving-scheme pghr13");
    // fix proof.json
    fixProofJson();
    // get proof
    const _proof = await getProof();
    //make encypted note
    const encNote1 = await encrypt(accounts[1].slice(2), transferAmount);
    const encNote2 = await encrypt(accounts[0].slice(2), changeAmount);

    const transferTx = await instance.transferNote(..._proof, encNote1, encNote2);
    assert(transferTx);

    const state1 = await instance.notes(transferTx.logs[1].args.noteId);
    console.log('state1', state1.toNumber()); // new note 1 state

    const state2 = await instance.notes(transferTx.logs[2].args.noteId);
    console.log('state2', state2.toNumber()); // new note 2 state
  });

  // it('transferNoteTest2', async function() {
  //   //zokrates : make witness command
  //   const res = getTransferZkParams(
  //     accounts[0],
  //     '0x' + initialAmount2,
  //     accounts[2],
  //     '0x' + transferAmount2,
  //   );
  //   // make witness
  //   await zokratesExec(res);
  //   // make proof.json
  //   await zokratesExec("zokrates generate-proof --proving-scheme pghr13");
  //   // fix proof.json
  //   fixProofJson();
  //   // get proof
  //   const _proof2 = await getProof();
  //
  //   //make encypted note
  //   const encNote3 = await encrypt(accounts[2].slice(2), transferAmount2);
  //   const encNote4 = await encrypt(accounts[0].slice(2), changeAmount2);
  //
  //   const transferTx2 = await instance.transferNote(..._proof2, encNote3, encNote4);
  //   assert(transferTx2);
  //
  //   const state3 = await instance.notes(transferTx2.logs[1].args.noteId);
  //   console.log('state3', state3.toNumber()); // new note 1 state
  //
  //   const state4 = await instance.notes(transferTx2.logs[2].args.noteId);
  //   console.log('state4', state4.toNumber()); // new note 2 state
  // });
});

async function encrypt(address, _amount) {
  // 20 12
  let amount = new BN(_amount, 16).toString(16, 24); // 12 bytes = 24 chars in hex
  const payload = address + amount;
  console.log('enc payload', payload)
  const encryptedNote = await web3.eth.accounts.encrypt('0x' + payload, 'philosopher')
  return JSON.stringify(encryptedNote);
}

async function decrypt(cipher) {
  //Private key itself is <address + amount>
  let payload = await web3.eth.accounts.decrypt(JSON.parse(cipher), 'philosopher').privateKey
  payload = payload.slice(2)
  const address = payload.slice(0, 40) // remove 0x and
  const amount = payload.slice(40)
  console.log(address, amount);

  // pad address and amount to 32bytes
  let _address = new BN(address, 16).toString(16, 64);
  let _amount = new BN(amount, 16).toString(16, 64); // 32 bytes = 64 chars in hex
  const buf = Buffer.from(_address + _amount, 'hex');
  const digest = crypto.createHash('sha256').update(buf).digest('hex');
  return digest;
}

async function getProof() {
  let proofJson = await fs.readFileSync('./zk-related/proof.json', 'utf8');
  proofJson = JSON.parse(proofJson);
  const proof = proofJson.proof;
  const input = proofJson.input;
  const _proof = [];
  Object.keys(proof).forEach(key => _proof.push(proof[key]));
  _proof.push(input);
  return _proof;
}
