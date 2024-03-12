// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Pattini is Ownable {
    string public repositoryName;
    address public tokenAddress;
    address public funderAddress;

    struct Contribution {
        uint256 issue; // issue number
        uint256 amount; // `amount` Github project custom field
        address recipient; // contributor address
        bool paid;
        uint256 pullRequest;
    }

    Contribution[] public contributions;

    event Taken(
        uint256 indexed issue,
        uint256 indexed amount,
        address indexed recipient,
        uint256 timestamp
    );

    event Paid(uint256 indexed issue, uint256 indexed pullRequest, uint256 timestamp);

    constructor(
        address _initialOwner,
        string memory _repositoryName,
        address _tokenAddress,
        address _funderAddress
    ) Ownable(_initialOwner) {
        repositoryName = _repositoryName;
        tokenAddress = _tokenAddress;
        funderAddress = _funderAddress;
    }

    modifier onlyFunder() {
        require(msg.sender == funderAddress, "Caller is not the funder");
        _;
    }

    function take(uint256 _issue, uint256 _amount, address _recipient) public onlyOwner {
        uint256 index = getIndex(_issue);
        require(index == contributions.length || !contributions[index].paid, "Issue already paid");

        contributions.push(
            Contribution({
                issue: _issue,
                amount: _amount,
                recipient: _recipient,
                paid: false,
                pullRequest: 0
            })
        );
        emit Taken(_issue, _amount, _recipient, block.timestamp);
    }

    function pay(uint256 _issue, uint256 _pullRequest) public onlyOwner {
        uint256 i = getIndex(_issue);
        contributions[i].pullRequest = _pullRequest;
        contributions[i].paid = true;

        ERC20(tokenAddress).transfer(
            contributions[i].recipient,
            contributions[i].amount * 10 ** 18
        );
        emit Paid(_issue, _pullRequest, block.timestamp);
    }

    function flush() public onlyFunder {
        uint256 totalPending;
        for (uint256 i; i < contributions.length; i++) {
            if (contributions[i].paid == false) {}
            totalPending = totalPending + contributions[i].amount;
        }
        uint256 withdrawableAmount = ERC20(tokenAddress).balanceOf(address(this)) -
            (ERC20(tokenAddress).balanceOf(address(this)) - (totalPending * 10 ** 18));

        ERC20(tokenAddress).transfer(funderAddress, withdrawableAmount);
    }

    function getIndex(uint256 _issue) private view returns (uint256) {
        for (uint256 i; i < contributions.length; i++) {
            if (contributions[i].issue == _issue) {
                return i;
            }
        }
        return contributions.length;
    }

    function getIssue(uint256 _issue) public view returns (Contribution memory) {
        uint256 index = getIndex(_issue);
        return contributions[index];
    }

    receive() external payable {
        revert();
    }

    fallback() external payable {
        revert();
    }
}
