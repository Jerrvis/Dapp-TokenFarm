const { assert } = require('chai');

const TokenFarm = artifacts.require("TokenFarm");
const DappToken = artifacts.require("DappToken");
const DaiToken = artifacts.require("DaiToken");

require('chai').use(require('chai-as-promised')).should()

function tokens(n) {
  // 用作数值转换 100 ether => 1*10^20 wei
  // 1ether = 10^18
  return web3.utils.toWei(n, 'Ether')
}

contract('TokenFarm', ([owner, investor]) => {
  let daiToken, dappToken, tokenFarm

  before(async () => {
    // 加载合约
    daiToken = await DaiToken.new()
    dappToken = await DappToken.new()
    tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)

    // 把所有的代币发送给tokenFarm
    await dappToken.transfer(tokenFarm.address, tokens('1000000'))

    // 发送100 给代币到用户
    await daiToken.transfer(investor, tokens('100'), { from: owner })
  })

  // 测试 daiToken 合约 name 属性 返回值是否为 'Mock DAI Token'
  describe('Mock Dai deployment', async () => {
    it('has a name', async () => {
      const name = await daiToken.name()
      assert.equal(name, 'Mock DAI Token')
    })
  })

  // 测试 DappToken 合约 name 属性 返回值是否为 'Dapp Token'
  describe('Dapp Token deployment', async () => {
    it('has a name', async () => {
      const name = await dappToken.name()
      assert.equal(name, 'DApp Token')
    })
  })

  // 测试 DappToken 合约 name 属性 返回值是否为 'Dapp Token Farm'
  describe('Token Farm deployment', async () => {
    it('has a name', async () => {
      const name = await tokenFarm.name()
      assert.equal(name, 'Dapp Token Farm')
    })

    // 测试tokenFarm 地址 是否有1000000*10^18 个 dappToken
    it('contract has tokens', async () => {
      let balance = await dappToken.balanceOf(tokenFarm.address)
      assert.equal(balance.toString(), tokens('1000000'))
    })
  })

  describe("Farming tokens", async () => {
    it('rewards investors for staking mDai tokens', async () => {
      let result

      // 检查用户是否有100个 DAI
      result = await daiToken.balanceOf(investor)
      assert.equal(result.toString(), tokens('100'), 'investor mDAI wallet balance correst before staking')

      // 用户授权100个 DAI，并质押到 TokenFarm
      await daiToken.approve(tokenFarm.address, tokens('100'), { from: investor })
      await tokenFarm.stakeTokens(tokens('100'), { from: investor })

      // 查询用户 DAI 余额是否为0
      result = await daiToken.balanceOf(investor)
      assert.equal(result.toString(), tokens('0'), 'investor mDAI wallet balance correst before staking')

      // 检查 TokenFarm 地址是否有100个 DAI
      result = await daiToken.balanceOf(tokenFarm.address)
      assert.equal(result.toString(), tokens('100'), 'TokenFarm mDAI wallet balance correst before staking')

      // 检查用户是否在 TokenFarm 质押 100 个 DAI
      result = await tokenFarm.stakingBalance(investor)
      assert.equal(result.toString(), tokens('100'), 'investor staking balance correst after staking')

      // 检查用户是否在质押
      result = await tokenFarm.isStaking(investor)
      assert.equal(result.toString(), 'true', 'investor staking status correst after staking')

      // 空投代币
      await tokenFarm.issueTokens({ from: owner })

      // 检查用户是否收到空投
      result = await dappToken.balanceOf(investor)
      assert.equal(result.toString(), tokens('100'), 'investor Dapp Tokens balance correst after staking')

      // 确保只有拥有者能调用空投函数
      await tokenFarm.issueTokens({ from: investor }).should.be.rejected;

      // 取出质押的代币 DAI
      await tokenFarm.unstakeTokens({ from: investor })

      // 检查用户 DAI 余额
      result = await daiToken.balanceOf(investor)
      assert.equal(result.toString(), tokens('100'), 'investor Mock Dai balance correst after staking')

      // 检查 TokenFarm 地址的 DAI 余额
      result = await daiToken.balanceOf(tokenFarm.address)
      assert.equal(result.toString(), tokens('0'), 'tokenFarm Mock Dai balance correst after staking')

      // 检查用户正在质押的DAI 余额
      result = await tokenFarm.stakingBalance(investor)
      assert.equal(result.toString(), tokens('0'), 'tokenFarm Mock Dai balance correst after staking')

      // 检查用户是否正在质押
      result = await tokenFarm.isStaking(investor)
      assert.equal(result.toString(), "false", 'tokenFarm status correst after staking')
    })
  })
}
)