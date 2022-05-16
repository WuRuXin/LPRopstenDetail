import React, { Component } from 'react'
import Web3 from 'web3'
import DappToken from '../abis/DappToken.json'
import IERC20 from '../abis/IERC20.json'
import TokenFarm from '../abis/TokenFarm.json'
import Navbar from './Navbar'
import Main from './Main'
import './App.css'

class App extends Component {
  // 组件未挂起之前运行
  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = window.web3

    // 获取当前账户
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    // 获取网络id
    const networkId = await web3.eth.net.getId()

    // 加载合约
    const TokenFarmData = TokenFarm.networks[networkId]
    if(TokenFarmData) {
      // 创建合约
      const tokenFarm = new web3.eth.Contract(TokenFarm.abi, TokenFarmData.address)
      this.setState({ tokenFarm })
      // 调用查询余额   
      // 质押余额
      let stakingBalance = await tokenFarm.methods.stakingBalance(this.state.account).call()
      this.setState({ stakingBalance: stakingBalance.toString() })
      let queryIssueBalance = await tokenFarm.methods.queryIssueBalance(this.state.account).call()
      this.setState({ queryIssueBalance: queryIssueBalance.toString() })
      
      // 奖励余额：测试代码
      // console.log("存入时间戳", await tokenFarm.methods.timeLog(this.state.account).call())
      // let queryIssueBalance = await tokenFarm.methods.queryIssueBalance(this.state.account).call()
      // console.log("查询的奖励余额", window.web3.utils.fromWei(queryIssueBalance, 'Ether'))
      // this.setState({ queryIssueBalance: queryIssueBalance.toString() })
      // let a = await tokenFarm.methods.calculationBalance().call()
      // console.log("计算奖励函数返回值", window.web3.utils.fromWei(a, 'Ether'))
      // let b = await tokenFarm.methods.totalIssue(this.state.account).call()
      // console.log("奖励总量", window.web3.utils.fromWei(b, 'Ether'))
      // console.log("bool", await tokenFarm.methods.isIssue(this.state.account).call())   
    } else {
      window.alert('TokenFarmData contract not deployed to detected network.')
    }

    // 加载DappToken
    const dappTokenData = DappToken.networks[networkId]
    if(dappTokenData) {
      const dappToken = new web3.eth.Contract(DappToken.abi, dappTokenData.address)
      this.setState({ dappToken })
      let dappTokenBalance = await dappToken.methods.balanceOf(this.state.account).call()
      this.setState({ dappTokenBalance: dappTokenBalance.toString() })
    } else {
      window.alert('DappToken contract not deployed to detected network.')
    }

    this.setState({ loading: false })
  }
  // 加载metamask
  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.request({ method: 'eth_requestAccounts' });
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  // 质押
  stakeTokens = (addressLP, amount) => {
    this.setState({ loading: true })
    let lp = new window.web3.eth.Contract(IERC20.abi, addressLP)
    lp.methods.approve(this.state.tokenFarm._address, amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.state.tokenFarm.methods.stakeTokens(addressLP, amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
        window.location.reload()
      })
    })
  }

  // 取出质押
  unstakeTokens = () => {
    this.setState({ loading: true })
    this.state.tokenFarm.methods.unstakeTokens().send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
      window.location.reload()
    })
  }

  // 查询奖励
  queryTokens = () => {
    this.setState({ loading: true })
    this.state.tokenFarm.methods.setBalance().send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
      window.location.reload()
    })
  }

  // 提取奖励
  issueTokens = () => {
    this.setState({ loading: true })
    this.state.tokenFarm.methods.issueTokens().send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
      window.location.reload()
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      tokenFarm: {},
      dappToken: {},
      queryIssueBalance: '0',
      dappTokenBalance: '0',
      stakingBalance: '0',
      loading: true
    }
  }

  render() {
    let content
    if(this.state.loading) {
      content = <p id="loader" className="text-center">Loading...</p>
    } else {
      content = <Main
        queryIssueBalance={this.state.queryIssueBalance}
        dappTokenBalance={this.state.dappTokenBalance}
        stakingBalance={this.state.stakingBalance}
        stakeTokens={this.stakeTokens}
        unstakeTokens={this.unstakeTokens}
        issueTokens={this.issueTokens}
        queryTokens={this.queryTokens}
      />
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
