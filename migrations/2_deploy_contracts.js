const TokenFarm = artifacts.require("TokenFarm");
const DappToken = artifacts.require("DappToken");
const DaiToken = artifacts.require("DaiToken");

module.exports =async function(deployer,network,accounts) {
  await deployer.deploy(DaiToken)
  const daiToken = await DaiToken.deployed()
  await deployer.deploy(DappToken)
  const dappToken = await DappToken.deployed()

  // 按照合约参数顺序dappToken.address,daiToken.address (传入构造函数需要的参数要放在 TokenFarm 后面)
  await deployer.deploy(TokenFarm,dappToken.address,daiToken.address)
  const tokenFarm = await TokenFarm.deployed()

  // 发送 1000000 个 dappToken 给 TokenFarm
  await dappToken.transfer(tokenFarm.address,'1000000000000000000000000')
  
  // 发送 100 个 DAI 给 账号1(用户)
  await daiToken.transfer(accounts[1],'100000000000000000000')
};
