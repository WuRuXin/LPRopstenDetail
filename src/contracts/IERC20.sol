pragma solidity ^0.5.0;

interface IERC20 {
    function balanceOf(address account) external view returns (uint);
    function transfer(address recipient, uint amount) external returns (bool); 
    function transferFrom(address sender, address recipient, uint amount) external returns (bool);    
    function approve(address spender, uint amount) external returns (bool);
}