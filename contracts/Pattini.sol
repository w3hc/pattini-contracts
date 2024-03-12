// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Pattini is Ownable {
    string public repositoryName;
    address public tokenAddress;
    address public funderAddress;

    struct Contribution {
        uint256 issue; // issue number
        uint256 amount; // `amount` Github project custom field
        string previousCommitHash; // hash before contrib // example: 6d0b2cb70a365dfc2e62136f134741bd5ac21a97 // git rev-parse HEAD
        address recipient; // contributor address
        bool paid;
        uint256 pullRequest;
        string commitHash;
    }

    Contribution[] public contributions;

    event Taken(
        uint256 indexed issue,
        uint256 indexed amount,
        address indexed recipient,
        string previousCommitHash,
        uint256 timestamp
    );

    event Paid(
        uint256 indexed issue,
        uint256 indexed pullRequest,
        string indexed commitHash,
        uint256 timestamp
    );

    constructor(string memory _repositoryName, address _tokenAddress, address _funderAddress) {
        repositoryName = _repositoryName;
        tokenAddress = _tokenAddress;
        funderAddress = _funderAddress;
    }

    modifier onlyFunder() {
        require(msg.sender == funderAddress, "Caller is not the funder");
        _;
    }

    function take(
        uint256 _issue,
        uint256 _amount,
        string memory _previousCommitHash,
        address _recipient
    ) public onlyOwner {
        uint256 index = getIndex(_issue);
        require(index == contributions.length || !contributions[index].paid, "Issue already paid");

        contributions.push(
            Contribution({
                issue: _issue,
                amount: _amount,
                previousCommitHash: _previousCommitHash,
                recipient: _recipient,
                paid: false,
                pullRequest: 0,
                commitHash: "unset"
            })
        );
        emit Taken(_issue, _amount, _recipient, _previousCommitHash, block.timestamp);
    }

    function pay(uint256 _issue, uint256 _pullRequest, string memory _commitHash) public onlyOwner {
        uint256 i = getIndex(_issue);
        contributions[i].pullRequest = _pullRequest;
        contributions[i].commitHash = _commitHash;
        contributions[i].paid = true;

        ERC20(tokenAddress).transfer(
            contributions[i].recipient,
            contributions[i].amount * 10 ** 18
        );
        emit Paid(_issue, _pullRequest, _commitHash, block.timestamp);
    }

    function flush(uint256 _issue) public onlyFunder {
        // TODO: sends the whole balance to funder
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
