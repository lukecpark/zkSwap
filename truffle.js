// var HDWalletProvider = require("truffle-hdwallet-provider");
// const MNEMONIC = 'urge mansion mansion solid daring another yellow hen sleep shoot vendor farm';

module.exports = {
  networks: {
    development: {
      // provider: function () {
      //   return new HDWalletProvider(MNEMONIC, "http://localhost:8545", 0, /* address_index */)
      // },
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network id
    },
    // ropsten: {
    //   provider: function () {
    //     return new HDWalletProvider(MNEMONIC, "https://ropsten.infura.io/v3/f2aa27e5bf2b4bf1b3b002e8687b61da", 0, 5)
    //   },
    //   network_id: 3,
    //   gas: 3000000      //make sure this gas allocation isn't over 4M, which is the max
    // }
  }
};
