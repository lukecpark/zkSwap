var BN = require('bn.js')
console.log(new BN('5936233000000000000', 10).div(new BN('1000000000000000000')).toString('hex'))
// console.log(new BN('4cb90df856e2ba65405b6443363920a6', 16).toString(10))
// console.log(new BN('101982185945281508769031670699010891942', 10).toString(16))