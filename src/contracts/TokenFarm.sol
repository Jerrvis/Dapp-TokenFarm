pragma solidity ^0.5.0;

import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm {

  string public name = "Dapp Token Farm";
  DappToken public dappToken; // 合约 A
  DaiToken public daiToken; // 合约 B
  address public owner; // 合约拥有者

  address[] public stackers; // 质押过的名单(用于空投代币)
  mapping(address => uint256) public stakingBalance; // 正在质押总量
  mapping(address => bool) public hasStaked; // 已经质押过的地址
  mapping(address => bool) public isStaking; // 正在质押的地址

  // 构造函数 仅在代码部署的时候执行一次，部署完成无法再执行
  constructor(DappToken _dappToken, DaiToken _daiToken) public {
    dappToken = _dappToken; // 保存合约
    daiToken = _daiToken; // 保存合约
    owner = msg.sender; // 部署合约的时候设定拥有者
    // 该用户在合约中有一定的权限
  }

  // 1.质押代币
  function stakeTokens(uint _amount) public {
    // 要求质押的代币大于0
    require(_amount > 0,"amount cannot be 0");

    daiToken.transferFrom(msg.sender, address(this), _amount);
    // 更新质押数量
    stakingBalance[msg.sender] += _amount;

    // 更新已经质押过的名单
    if(!hasStaked[msg.sender]){
      stackers.push(msg.sender);
    }

    // 更新是否正在质押
    hasStaked[msg.sender] = true;
    isStaking[msg.sender] = true;
  }

  // 2.取出质押的代币
  function unstakeTokens() public {
    // 获取正在质押的总数
    uint balance = stakingBalance[msg.sender];

    // 要求正在质押总量大于0
    require(balance > 0, "staking banlance cannot be 0");

    // 将 DAI 发送回用户地址
    daiToken.transfer(msg.sender,balance);

    // 更新用户设置质押数量
    stakingBalance[msg.sender] = 0;

    // 更新用户质押状态
    isStaking[msg.sender] = false;
  }

  // 3.空投代币
  function issueTokens() public {
    // 要求必须为合约拥有者才能空投代币
    require(msg.sender == owner, "caller must be the owner");

    // 给所有质押过的用户空投
    for (uint256 i = 0; i < stackers.length; i++) {
      address recipient = stackers[i];
      uint balance = stakingBalance[recipient];
      if (balance > 0){
        dappToken.transfer(recipient, balance);
      }
    }
  }
}