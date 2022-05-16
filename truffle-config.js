require('babel-register');
require('babel-polyfill');

const HDWalletProvider = require("truffle-hdwallet-provider");  // 导入模块
const mnemonic = "what medal member corn trap improve safe scrub anxiety old hamster snack";  //MetaMask的助记词。
module.exports = {
  networks: {
    ropsten: {
      provider: function() {
         return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/v3/c1806f74913d41269b09f740f34b20e1");
      },
      network_id: '3',
    },
  },
// module.exports = {
//   networks: {
//     development: {
//       host: "127.0.0.1",
//       port: 7545,
//       network_id: "*" // Match any network id
//     },
//   },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      evmVersion: "petersburg"
    }
  }
}
