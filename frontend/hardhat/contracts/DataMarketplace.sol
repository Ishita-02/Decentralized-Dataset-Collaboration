// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DataMarketplace {

    using EnumerableSet for EnumerableSet.AddressSet;

    EnumerableSet.AddressSet private _activeContributors;
    uint256 verificationsDone;

    // Reference to your DATA Token contract
    IERC20 public dataToken;

    struct UploadParams {
        uint256 price;
        string tokenURI;
        string title;
        string description;
        string mimeType;
        uint256 size;
        uint256 contributionReward;
        uint256 verificationReward;
        uint256 totalRewardPool;
        string category;
    }

    // --- Structs ---
    struct Dataset {
        address creator;
        string currentURI;
        uint256 price;
        string title;
        string description;
        uint256 size;
        string mimeType;
        uint256 createdAt;
        string category;

        // Per-dataset incentive settings, funded by the creator
        uint256 contributionReward;
        uint256 verificationReward;
        uint256 rewardPool;

        // Participant tracking for purchase revenue sharing
        uint256 totalSharePoints;
        mapping(address => uint256) sharePoints;
        address[] participants;
        mapping(address => bool) isParticipant;
    }

    // Add this struct definition near your others in the contract
    struct DatasetView {
        uint256 id;
        address creator;
        string currentURI;
        uint256 price;
        string title;
        string description;
        uint256 size;
        string mimeType;
        uint256 createdAt;
        uint256 contributionReward;
        uint256 verificationReward;
        uint256 rewardPool;
        string category;
    }

    struct Verifier {
        bool isVerifier;
        uint256 stakedAmount;
    }

    // Contributions are now proposals that must be voted on
    struct ContributionProposal {
        uint256 datasetId;
        address proposer;
        string proposedURI;
        uint256 voteDeadline;
        uint256 yesVotes; // Votes weighted by stake
        uint256 noVotes;
        bool resolved;
        mapping(address => bool) hasVoted;
        address[] voters; // UPDATED: To track voters for this proposal
        mapping(address => bool) voteChoice; 
    }

    // --- State Variables ---
    mapping(uint256 => Dataset) public datasets;
    mapping(address => Verifier) public verifiers;
    mapping(uint256 => ContributionProposal) public proposals;
    
    // Keeps track of earned rewards for users to claim
    mapping(address => uint256) public withdrawableBalance;

    uint256 public datasetCount;
    uint256 public proposalCount;
    // uint256 public verifierRewardPool;

    // --- Constants ---
    uint256 public constant MINIMUM_STAKE = 1000 * 10**18; // 1000 DATA tokens
    uint256 public constant VOTE_DURATION = 1 days;
    uint256 public constant CONTRIBUTOR_REWARD_SHARES = 200; // Share points for a successful contribution
    uint256 public constant CREATOR_INITIAL_SHARES = 1000; // Initial share points for the creator
    uint256 public constant REWARD_POOL_DISTRIBUTION_PERCENT = 10; // 10% of the pool is used per vote
    uint256 public constant SLASH_PERCENTAGE = 5; 


    // --- Events ---
    event DatasetUploaded(uint256 indexed datasetId, address indexed creator, string title, uint256 totalRewardPool);
    event ContributionProposed(uint256 indexed proposalId, uint256 indexed datasetId, address indexed proposer);
    event ContributionResolved(uint256 indexed proposalId, bool approved);
    event VerifierVoted(uint256 indexed proposalId, address indexed verifier, bool vote);
    event RewardsClaimed(address indexed user, uint256 amount);
    event ContributionResolved(uint256 indexed proposalId, bool approved, uint256 rewardsDistributed, uint256 totalSlashed);


    // --- Constructor ---
    constructor(address _tokenAddress) {
        dataToken = IERC20(_tokenAddress);
    }

    // --- Core Functions ---

    function stakeToVerify() external {
        require(dataToken.transferFrom(msg.sender, address(this), MINIMUM_STAKE), "Token transfer failed for stake");
        verifiers[msg.sender].isVerifier = true;
        verifiers[msg.sender].stakedAmount += MINIMUM_STAKE;
    }

    function unstake() external {
        Verifier storage verifier = verifiers[msg.sender];
        require(verifier.isVerifier, "Not a verifier");
        require(verifier.stakedAmount > 0, "No amount staked");

        uint256 amountToReturn = verifier.stakedAmount;
        verifier.stakedAmount = 0;
        verifier.isVerifier = false;

        require(dataToken.transfer(msg.sender, amountToReturn), "Token transfer failed");
    }

    function uploadDataset(UploadParams calldata params) external {
        datasetCount++;
        Dataset storage d = datasets[datasetCount];

        // Transfer funds from the uploader to this dataset's dedicated reward pool
        require(
            dataToken.transferFrom(msg.sender, address(this), params.totalRewardPool),
            "Token transfer for reward pool failed"
        );

        d.creator = msg.sender;
        d.price = params.price;
        d.currentURI = params.tokenURI;
        d.title = params.title;
        d.description = params.description;
        d.size = params.size;
        d.mimeType = params.mimeType;
        d.createdAt = block.timestamp;
        d.category = params.category;

        // Set the per-dataset incentive values
        d.contributionReward = params.contributionReward;
        d.verificationReward = params.verificationReward;
        d.rewardPool = params.totalRewardPool;

        // Initialize revenue sharing details
        d.totalSharePoints = CREATOR_INITIAL_SHARES;
        d.sharePoints[msg.sender] = CREATOR_INITIAL_SHARES;
        d.isParticipant[msg.sender] = true;
        d.participants.push(msg.sender);

        emit DatasetUploaded(datasetCount, msg.sender, params.title, params.totalRewardPool);
    }


    // NEW: Contributions are proposals now
    function proposeContribution(uint256 datasetId, string calldata proposedURI) external {
        require(datasets[datasetId].creator != address(0), "Dataset does not exist");
        proposalCount++;
        ContributionProposal storage p = proposals[proposalCount];
        p.datasetId = datasetId;
        p.proposer = msg.sender;
        p.proposedURI = proposedURI;
        p.voteDeadline = block.timestamp + VOTE_DURATION;

        _activeContributors.add(msg.sender);

        emit ContributionProposed(proposalCount, datasetId, msg.sender);
    }

    // NEW: Verifiers vote on specific proposals
    function voteOnContribution(uint256 proposalId, bool vote) external {
        Verifier storage verifier = verifiers[msg.sender];
        require(verifier.isVerifier, "Not a verifier");
        
        ContributionProposal storage p = proposals[proposalId];
        require(block.timestamp < p.voteDeadline, "Voting period has ended");
        require(!p.hasVoted[msg.sender], "Already voted");

        p.hasVoted[msg.sender] = true;
        p.voters.push(msg.sender); // CRITICAL FIX
        p.voteChoice[msg.sender] = vote; // CRITICAL FIX

        uint256 stakeWeight = verifier.stakedAmount;
        if (vote) {
            p.yesVotes += stakeWeight;
        } else {
            p.noVotes += stakeWeight;
        }

        // emit VerifierVoted(proposalId, msg.sender, vote);
    }

    function resolveContribution(uint256 proposalId) external {
        ContributionProposal storage p = proposals[proposalId];
        require(block.timestamp >= p.voteDeadline, "Voting still in progress");
        require(!p.resolved, "Proposal already resolved");

        p.resolved = true;
        Dataset storage d = datasets[p.datasetId];
        bool approved = p.yesVotes > p.noVotes;
        
        uint256 totalSlashedAmount = 0;
        
        // Slash users who voted against the consensus
        for (uint i = 0; i < p.voters.length; i++) {
            address voter = p.voters[i];
            if (p.voteChoice[voter] != approved) {
                uint256 slashAmount = (verifiers[voter].stakedAmount * SLASH_PERCENTAGE) / 100;
                verifiers[voter].stakedAmount -= slashAmount;
                totalSlashedAmount += slashAmount;
            }
        }
        
        // Add slashed funds to this dataset's reward pool
        d.rewardPool += totalSlashedAmount;

        if (approved) {
            // Reward the successful contributor from the dataset's pool
            require(d.rewardPool >= d.contributionReward, "Insufficient pool for contributor reward");
            d.rewardPool -= d.contributionReward;
            withdrawableBalance[p.proposer] += d.contributionReward;

            d.currentURI = p.proposedURI;
            d.sharePoints[p.proposer] += CONTRIBUTOR_REWARD_SHARES;
            d.totalSharePoints += CONTRIBUTOR_REWARD_SHARES;
            if (!d.isParticipant[p.proposer]) {
                d.isParticipant[p.proposer] = true;
                d.participants.push(p.proposer);
            }
        }

        // Reward all verifiers for their participation
        uint256 totalVerifierPayout = p.voters.length * d.verificationReward;
        require(d.rewardPool >= totalVerifierPayout, "Insufficient pool for verifier rewards");
        d.rewardPool -= totalVerifierPayout;
        for (uint i = 0; i < p.voters.length; i++) {
            withdrawableBalance[p.voters[i]] += d.verificationReward;
        }

        verificationsDone += 1;
        
        // emit ContributionResolved(proposalId, approved, totalVerifierPayout, totalSlashedAmount);
    }


    function purchaseDataset(uint256 datasetId) external {
        Dataset storage d = datasets[datasetId];
        require(d.price > 0, "Dataset not for sale");
        require(d.creator != msg.sender, "Creator cant buy dataset");
        
        // Note for Frontend: The user must first approve the contract to spend d.price amount of DATA tokens.
        require(dataToken.transferFrom(msg.sender, address(this), d.price), "Payment failed");

        // 80% of the price is distributed to the creator and contributors based on their shares.
        uint256 revenueShare = (d.price * 80) / 100;
        
        // The remaining 20% is added to this specific dataset's reward pool.
        uint256 poolShare = d.price - revenueShare;
        d.rewardPool += poolShare;

        // Distribute the revenue share to all current participants.
        require(d.totalSharePoints > 0, "No shareholders to pay");
        for (uint i = 0; i < d.participants.length; i++) {
            address participant = d.participants[i];
            uint256 participantSharePoints = d.sharePoints[participant];
            
            if (participantSharePoints > 0) {
                uint256 earnings = (revenueShare * participantSharePoints) / d.totalSharePoints;
                withdrawableBalance[participant] += earnings;
            }
        }
        
        // It's good practice to emit an event for purchases
        //emit DatasetPurchased(datasetId, msg.sender, d.price);
    }

    // NEW: Safe withdrawal function (Pull-over-Push pattern)
    function claimRewards() external {
        uint256 amount = withdrawableBalance[msg.sender];
        require(amount > 0, "No rewards to claim");
        
        withdrawableBalance[msg.sender] = 0;
        require(dataToken.transfer(msg.sender, amount), "Transfer failed");

        emit RewardsClaimed(msg.sender, amount);
    }

    function userContributions(address _user) external view returns (uint[] memory) {
        uint count = 0;
        for (uint i = 1; i <= proposalCount; i++) {
            if (proposals[i].proposer == _user) {
                count++;
            }
        }
        if (count == 0) {
            return new uint[](0);
        }
        uint[] memory userProposals = new uint[](count);
        uint counter = 0;

        for (uint i = 1; i <= proposalCount; i++) {
            if (proposals[i].proposer == _user) {
                userProposals[counter] = i;
                counter++;
            }
        }
        return userProposals;
    }

    function userDataset(address _user) external view returns (uint[] memory) {
        uint count = 0;
        for (uint i = 1; i <= datasetCount; i++) {
            if (datasets[i].creator == _user) {
                count++;
            }
        }
        if (count == 0) {
            return new uint[](0);
        }
        uint[] memory userDatasets = new uint[](count);
        uint counter = 0;

        for (uint i = 1; i <= datasetCount; i++) {
            if (datasets[i].creator == _user) {
                userDatasets[counter] = i;
                counter++;
            }
        }
        return userDatasets;
    }

    function getUserDatasetCurrentURI(uint256 _id) external view returns(string memory) {
        return datasets[_id].currentURI;
    }

    function getContributorCount() external view returns (uint256) {
        return _activeContributors.length();
    }

    function totalVerificattions() external view returns(uint256) {
        return verificationsDone;
    }

    function dataTokenBalance(address _user) external view returns(uint256) {
        return dataToken.balanceOf(_user);
    }

    function getAllDatasets() external view returns (DatasetView[] memory) {
        // Create a memory array of the correct "view" struct type and exact size.
        DatasetView[] memory allDatasets = new DatasetView[](datasetCount);

        // Loop through all datasets and copy their data into the view structs.
        for (uint i = 1; i <= datasetCount; i++) {
            Dataset storage d = datasets[i];
            allDatasets[i-1] = DatasetView({
                id: i,
                creator: d.creator,
                currentURI: d.currentURI,
                price: d.price,
                title: d.title,
                description: d.description,
                size: d.size,
                mimeType: d.mimeType,
                createdAt: d.createdAt,
                contributionReward: d.contributionReward,
                verificationReward: d.verificationReward,
                rewardPool: d.rewardPool,
                category: d.category
            });
        }

        return allDatasets;
    }

}