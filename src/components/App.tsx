import React, { Component } from 'react'
import TF from './TF'
import Navbar from './Navbar'
import './App.css'
import Web3 from 'web3/dist/web3.min.js'
import DaiToken from '../abis/DaiToken.json'
import DappToken from '../abis/DappToken.json'
import TokenFarm from '../abis/TokenFarm.json'

// tsx 数据接口写法
type StateType = {
  account: string;
  daiToken: any;
  dappToken: any;
  tokenFarm: any;
  daiTokenBalance: string;
  dappTokenBalance: string;
  stakingBalance: string;
  loading: boolean;
}

type propType = {
  [propName: string]: any;
}

interface App {
  state: StateType;
  props: propType;
}

interface Window {
  web3: object;
}

class App extends Component {

  constructor(props: any) {
    super(props)
    this.state = {
      account: '0x0',
      daiToken: {},
      dappToken: {},
      tokenFarm: {},
      daiTokenBalance: '0',
      dappTokenBalance: '0',
      stakingBalance: '0',
      loading: true
    }
  }

  async componentDidMount() {
    await this.loadWeb3()
    await this.loadBlockChainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non')
    }
  }

  // 加载区块链数据
  async loadBlockChainData() {
    // 获取账户
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    console.log(accounts)
    this.setState({ account: accounts[0] })

    const networkId = await web3.eth.net.getId()

    // 获取DaiToken合约数据
    const daiTokenData = DaiToken.networks[networkId]
    if (daiTokenData) {
      const daiToken = new web3.eth.Contract(DaiToken.abi, daiTokenData.address)
      this.setState({ daiToken })
      // 获取用户DaiToken的余额
      let daiTokenBalance = await daiToken.methods.balanceOf(this.state.account).call()
      this.setState({ daiTokenBalance: daiTokenBalance.toString() })
    } else {
      window.alert('DaiToken contract no deployed to detected network')
    }

    // 获取DappToken合约数据
    const dappTokenData = DappToken.networks[networkId]
    if (dappTokenData) {
      const dappToken = new web3.eth.Contract(DappToken.abi, dappTokenData.address)
      this.setState({ dappToken })
      // 用户DappToken的余额
      let dappTokenBalance = await dappToken.methods.balanceOf(this.state.account).call()
      this.setState({ dappTokenBalance: dappTokenBalance.toString() })
    } else {
      window.alert('DappToken contract no deployed to detected network')
    }

    // 获取TokenFarm合约数据
    const tokenFarmData = TokenFarm.networks[networkId]
    if (tokenFarmData) {
      const tokenFarm = new web3.eth.Contract(TokenFarm.abi, tokenFarmData.address)
      this.setState({ tokenFarm })
      // 获取用户质押数据
      let stakingBalance = await tokenFarm.methods.stakingBalance(this.state.account).call()
      this.setState({ stakingBalance: stakingBalance.toString() })
    } else {
      window.alert('TokenFarm contract no deployed to detected network')
    }

    // 加载完成
    this.setState({ loading: false })
  }

  // 质押代币
  stakeTokens = (amount:string) => {
    this.setState({ loading: true })
    this.state.daiToken.methods.approve(this.state.tokenFarm._address, amount).send({ from: this.state.account }).on('transactionHash', (hash:string) => {
      this.state.tokenFarm.methods.stakeTokens(amount).send({ from: this.state.account }).on("transactionHash", (hash:any) => {
        this.setState({ loading: false })
      })
    })
  }

  // 取出所有质押
  unstakeTokens = (amount:string) => {
    this.setState({ loading: true })
    this.state.tokenFarm.methods.unstakeTokens().send({ from: this.state.account }).on("transactionHash", (hash:any) => {
      this.setState({ loading: false })
    })
  }

  render() {
    let content
    if (this.state.loading) {
      // 显示正在加载
      content = <p id='loader' className='text-center'></p>
    } else {
      content = <TF
        daiTokenBalance={this.state.daiTokenBalance}
        dappTokenBalance={this.state.dappTokenBalance}
        stakingBalance={this.state.stakingBalance}
        stakeTokens={this.stakeTokens}
        unstakeTokens={this.unstakeTokens}
      ></TF>
    }
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>

                {content}

              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
