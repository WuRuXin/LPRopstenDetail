pragma solidity ^0.5.0;

import "./DappToken.sol";
import "./IERC20.sol";
// 测试版
// 单次质押完全版
contract TokenFarm {

    using SafeMath for uint;

    DappToken public dappToken;
    IERC20 public daiToken;

    address public owner;
    bool private flag;
    uint rewardSecond = 10 ** 5;    // 每秒每LP获得的奖励
    uint public totalLp;            // lp总量
    address[] public stakers;       // 用户数组

    mapping(address => uint) public stakingBalance; // 质押余额
    mapping(address => uint) public issueBalance;   // 奖励余额
    mapping(address => uint) public queryIssueBalance;   // 查询奖励余额
    mapping(address => uint) public timeLog;        // 存储时间戳
    mapping(address => uint) public totalIssue;     // 每个用户的奖励总量
    mapping(address => uint) public totalBefore;    // 多次质押之前的总奖励
    mapping(address => bool) public isStaking;      // 是否存有质押
    mapping(address => bool) public isIssue;        // 是否存有奖励
    mapping(address => bool) public isMoreStake;    // 是否多次质押
    mapping(address => IERC20) public tokenMap;     // 存储token
    

    constructor(DappToken _dappToken) public {
        dappToken = _dappToken;
        owner = msg.sender;
    }

    // 防止重入
    modifier lock() {
        require(!flag, "flag is true");
        flag = true;
        _;
        flag = false;
    }

    // 质押LP，参数：token地址，数量
    function stakeTokens(address _daiToken, uint _amount) public {
        // 判断是否已经质押过
        if(!isStaking[msg.sender]) {
            // 存储用户数组
            stakers.push(msg.sender);
        }else {
            // 多次质押
            isMoreStake[msg.sender] = true;
            // 马上计算本次质押之前奖励 = 上次奖励(第二次就为0) + 当前计算的奖励
            totalBefore[msg.sender] = totalBefore[msg.sender].add(calculationBalance());
        }

        daiToken = IERC20(_daiToken);       // 实例化
        tokenMap[msg.sender] = daiToken;    // 存储实例化token
        require(_amount > 0, "amount cannot be 0"); // 金额必须大于0

        // msg.sender账户向TokenFarm地址转移_amount个daiToken
        daiToken.transferFrom(msg.sender, address(this), _amount);

        // 每一次存储都会更新时间戳
        timeLog[msg.sender] = block.timestamp;
        totalLp = totalLp.add(_amount);
        // 更新质押余额
        stakingBalance[msg.sender] = stakingBalance[msg.sender].add(_amount);      

        // 更新质押状态
        isStaking[msg.sender] = true;
        isIssue[msg.sender] = true;
    }

    // 计算奖励余额
    function calculationBalance() public view returns(uint){
        return now.sub(timeLog[msg.sender]).mul((stakingBalance[msg.sender]/rewardSecond));
    }

    // 存入查询奖励余额
    function setBalance() public {
        // 还有质押并且不是多次质押的情况下进行计算
        if (isStaking[msg.sender] && !isMoreStake[msg.sender]) {
            queryIssueBalance[msg.sender] = calculationBalance();
        }   
        // 还有质押并且是多次质押的情况
        if (isStaking[msg.sender] && isMoreStake[msg.sender]) {
            // 之前奖励 + 本次计算奖励
            queryIssueBalance[msg.sender] = totalBefore[msg.sender].add(calculationBalance());
        }    
    }
    
    // 取出全部质押
    function unstakeTokens() public lock {

        // 获取质押余额
        uint balance = stakingBalance[msg.sender];
        
        // 获取实例化token
        daiToken = tokenMap[msg.sender];

        require(balance > 0, "staking balance cannot be 0");

        // 合约地址向调用者转账
        daiToken.transfer(msg.sender, balance);
        totalLp = totalLp.sub(balance);

        // 最后计算奖励 = 多次质押前奖励 + 现在计算奖励
        issueBalance[msg.sender] = totalBefore[msg.sender].add(calculationBalance());
        // 最后计算显示余额
        setBalance();

        // 清空记录
        stakingBalance[msg.sender] = 0;

        // 转账完成
        isStaking[msg.sender] = false;
    }

    // 取出奖励dappToken
    function issueTokens() public lock{

        // 确定是否有奖励
        require(isIssue[msg.sender], "no balance");
        // 取出奖励时，显示余额也变为0
        queryIssueBalance[msg.sender] = 0;
        // 当还有质押时
        if (isStaking[msg.sender]) {
            // 存入奖励 = 多次质押的之前奖励 + 现在计算的奖励
            issueBalance[msg.sender] = totalBefore[msg.sender].add(calculationBalance());
            // 不论是否是多次质押，都归0
            totalBefore[msg.sender] = 0;
        }

        uint balance = issueBalance[msg.sender];
        // 存储奖励总量
        totalIssue[msg.sender] = totalIssue[msg.sender].add(balance);

        // 开始转账
        if(balance > 0) {

            // 首先将奖励余额归0
            issueBalance[msg.sender] = 0;
            dappToken.transfer(msg.sender, balance);

            // 当质押还未取出，取出奖励时
            if (isStaking[msg.sender]) {
                // 更新时间戳
                timeLog[msg.sender] = now;
            }else {
                // 奖励已取出,并且不能在进行取出奖励
                isIssue[msg.sender] = false;
            }
        }
    }
}

// 数学安全
library SafeMath {
    function add(uint x, uint y) internal pure returns (uint z) {
        require((z = x + y) >= x, 'ds-math-add-overflow');
    }

    function sub(uint x, uint y) internal pure returns (uint z) {
        require((z = x - y) <= x, 'ds-math-sub-underflow');
    }

    function mul(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x, 'ds-math-mul-overflow');
    }
}
