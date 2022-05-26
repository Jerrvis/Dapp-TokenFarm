import React, { Component } from 'react'
import dai from '../dai.png'

// tsx 数据接口写法
type StateType = {
}

type propType = {
  daiTokenBalance:string;
  dappTokenBalance:string;
  stakingBalance:string;
  stakeTokens:Function;
  unstakeTokens:Function;
}

interface TF {
  state: StateType;
  props: propType;
  input: any;
}

class TF extends Component {
  render() {
    return (
      <div id="content" className='mt-3'>
        <table className='table table-borderless text-muted text-center'>
          <thead>
            <tr>
              <th scope='col'>Staking Balance</th>
              <th scope='col'>Reward Balance</th>
            </tr>
          </thead>
          <tbody>
            {/* 展示余额 */}
            <tr>
              <td>{window.web3.utils.fromWei(this.props.stakingBalance,'Ether')} mDai</td>
              <td>{window.web3.utils.fromWei(this.props.dappTokenBalance,'Ether')} DAPP</td>
            </tr>
          </tbody>
        </table>

        <div className='card mb-4'>
          <div className='card-body'>
            <form className='mb-3' onSubmit={event=>{
              // 提交质押按钮的函数
              event.preventDefault()
              let amount
              amount = this.input.value.toString()
              amount = window.web3.utils.toWei(amount,'Ether')
              this.props.stakeTokens(amount)
            }}>
              <div>
                <label className='float-left'><b>Stake Token</b></label>
                <span className='float-right text-muted'>
                  {/* 可供质押的DAI余额 */}
                  Balance: {window.web3.utils.fromWei(this.props.daiTokenBalance,'Ether')}
                </span>
              </div>
              <div className='input-group mb-4'>
                <input 
                ref={c => this.input = c}
                type="text" className='form-control form-control-lg' placeholder='0' required/>
                <div className='input-group-append'>
                  <div className='input-group-text'>
                    <img src={dai} height='32' alt="" />&nbsp;&nbsp;&nbsp; mDAI
                  </div>
                </div>
              </div>
              <button type='submit' className='btn btn-primary btn-block btn-lg'>STAKE !</button>
            </form>
            <button type='submit' className='btn btn-block btn-lg' 
            onClick={event=>{
              // 取出全部质押的时间
              event.preventDefault()
              this.props.unstakeTokens()
            }}
            >UN-STAKE...</button>
          </div>
        </div>
      </div>
    )
  }
}

export default TF