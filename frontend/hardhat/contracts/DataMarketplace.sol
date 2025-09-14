// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DataMarketplace {

    using EnumerableSet for EnumerableSet.AddressSet;

    EnumerableSet.AddressSet private _activeContributors;
    uint256 verificationsDone;

    IERC20 public dataToken;

    enum ContributionType {
        data_cleaning, 
        data_addition,  
        annotation,
        validation, 
        documentation 
    }

    enum ProposalStatus {
        Pending, 
        Approved,
        Rejected
    }

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
        uint256 contributionReward;
        uint256 verificationReward;
        uint256 rewardPool;
        uint256 totalSharePoints;
        mapping(address => uint256) sharePoints;
        address[] participants;
        mapping(address => bool) isParticipant;
        uint256 downloads;
    }
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
        uint256 downloads;
    }

    struct Verifier {
        bool isVerifier;
        uint256 stakedAmount;
        string title; 
        bool consensusMatched;
        uint256 reward;
    }
    struct ContributionProposal {
        uint256 datasetId;
        address proposer;
        string proposedURI;
        uint256 voteDeadline;
        uint256 yesVotes; 
        uint256 noVotes;
        bool resolved;
        mapping(address => bool) hasVoted;
        address[] voters; 
        mapping(address => bool) voteChoice; 
        string title;
        string description;
        ContributionType contribType;
        ProposalStatus status;
    }

    struct ProposalData {
        uint256 proposalId; 
        uint256 datasetId;
        address proposer;
        string proposedURI;
        uint256 voteDeadline;
        uint256 yesVotes;
        uint256 noVotes;
        bool resolved;
        address[] voters;
        string title;
        string description;
        ContributionType contribType;
        ProposalStatus status;
    }

    mapping(uint256 => Dataset) public datasets;
    mapping(address => Verifier) public verifiers;
    mapping(uint256 => ContributionProposal) public proposals;
    mapping(address => mapping(uint256 => bool)) public userReviewDetails;
    
    mapping(address => uint256) public withdrawableBalance;

    uint256 public datasetCount;
    uint256 public proposalCount;

    mapping(address => uint256) public userVerificationCount;
    mapping(address => uint256) public userSuccessfulContributionCount;
    mapping(uint256 => mapping(address => bool)) public userFavorites;

    uint256 public constant MINIMUM_STAKE = 1000 * 10**18; 
    uint256 public constant VOTE_DURATION = 2 minutes;
    uint256 public constant CONTRIBUTOR_REWARD_SHARES = 200; 
    uint256 public constant CREATOR_INITIAL_SHARES = 1000; 
    uint256 public constant REWARD_POOL_DISTRIBUTION_PERCENT = 10; 
    uint256 public constant SLASH_PERCENTAGE = 5; 


    event DatasetUploaded(uint256 indexed datasetId, address indexed creator, string title, uint256 totalRewardPool);
    event ContributionProposed(uint256 indexed proposalId, uint256 indexed datasetId, address indexed proposer);
    event VerifierVoted(uint256 indexed proposalId, address indexed verifier, bool vote);
    event RewardsClaimed(address indexed user, uint256 amount);
    event ContributionResolved(uint256 indexed proposalId, bool approved, uint256 rewardsDistributed, uint256 totalSlashed);
    event DatasetPurchased(uint256 indexed datasetId, address indexed user, uint256 price);
    event DatasetFavorited(uint256 indexed datasetId, address indexed user, bool isFavorite);


    constructor(address _tokenAddress) {
        dataToken = IERC20(_tokenAddress);
    }


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
        d.contributionReward = params.contributionReward;
        d.verificationReward = params.verificationReward;
        d.rewardPool = params.totalRewardPool;

        d.totalSharePoints = CREATOR_INITIAL_SHARES;
        d.sharePoints[msg.sender] = CREATOR_INITIAL_SHARES;
        d.isParticipant[msg.sender] = true;
        d.participants.push(msg.sender);
        d.downloads = 0;

        userFavorites[datasetCount][msg.sender] = false;

        emit DatasetUploaded(datasetCount, msg.sender, params.title, params.totalRewardPool);
    }


    function proposeContribution(uint256 datasetId, string calldata proposedURI, string calldata title, string calldata description, ContributionType contribType) external {
        require(datasets[datasetId].creator != address(0), "Dataset does not exist");
        proposalCount++;
        ContributionProposal storage p = proposals[proposalCount];
        p.datasetId = datasetId;
        p.proposer = msg.sender;
        p.proposedURI = proposedURI;
        p.voteDeadline = block.timestamp + VOTE_DURATION;
        p.title = title;
        p.description = description;
        p.contribType = contribType;
        p.status = ProposalStatus.Pending;


        _activeContributors.add(msg.sender);

        emit ContributionProposed(proposalCount, datasetId, msg.sender);
    }

    function voteOnContribution(uint256 proposalId, bool vote) external {
        Verifier storage verifier = verifiers[msg.sender];
        require(verifier.isVerifier, "Not a verifier");

        ContributionProposal storage p = proposals[proposalId];
        require(p.proposer != msg.sender, "Contributors cannot verify their own contributions");
        require(block.timestamp < p.voteDeadline, "Voting period has ended");
        require(!p.hasVoted[msg.sender], "Already voted");

        p.hasVoted[msg.sender] = true;
        p.voters.push(msg.sender); 
        p.voteChoice[msg.sender] = vote; 

        uint256 stakeWeight = verifier.stakedAmount;
        if (vote) {
            p.yesVotes += stakeWeight;
        } else {
            p.noVotes += stakeWeight;
        }

        userReviewDetails[msg.sender][proposalId] = true;

        emit VerifierVoted(proposalId, msg.sender, vote);
    }

    function resolveContribution(uint256 proposalId) external {
        ContributionProposal storage p = proposals[proposalId];
        require(block.timestamp >= p.voteDeadline, "Voting still in progress");
        require(!p.resolved, "Proposal already resolved");

        p.resolved = true;
        
        verificationsDone += 1;
        Dataset storage d = datasets[p.datasetId];
        bool approved = p.yesVotes > p.noVotes;
        
        uint256 totalSlashedAmount = 0;
        
        for (uint i = 0; i < p.voters.length; i++) {
            address voter = p.voters[i];
            if (p.voteChoice[voter] != approved) {
                uint256 slashAmount = (verifiers[voter].stakedAmount * SLASH_PERCENTAGE) / 100;
                verifiers[voter].stakedAmount -= slashAmount;
                totalSlashedAmount += slashAmount;
            }
        }
        
        d.rewardPool += totalSlashedAmount;

        if (approved) {
            require(d.rewardPool >= d.contributionReward, "Insufficient pool for contributor reward");
            d.rewardPool -= d.contributionReward;
            withdrawableBalance[p.proposer] += d.contributionReward;

            userSuccessfulContributionCount[p.proposer]++;

            d.currentURI = p.proposedURI;
            d.sharePoints[p.proposer] += CONTRIBUTOR_REWARD_SHARES;
            d.totalSharePoints += CONTRIBUTOR_REWARD_SHARES;
            if (!d.isParticipant[p.proposer]) {
                d.isParticipant[p.proposer] = true;
                d.participants.push(p.proposer);
            }
            p.status = ProposalStatus.Approved; 
        } else {
            p.status = ProposalStatus.Rejected; 
        }

        uint256 totalVerifierPayout = p.voters.length * d.verificationReward;
        require(d.rewardPool >= totalVerifierPayout, "Insufficient pool for verifier rewards");
        d.rewardPool -= totalVerifierPayout;
        for (uint i = 0; i < p.voters.length; i++) {
            withdrawableBalance[p.voters[i]] += d.verificationReward;
            userVerificationCount[p.voters[i]]++;
        }

        userReviewDetails[msg.sender][proposalId] = true;
        
        emit ContributionResolved(proposalId, approved, totalVerifierPayout, totalSlashedAmount);
    }


    function purchaseDataset(uint256 datasetId) external {
        Dataset storage d = datasets[datasetId];
        require(d.price > 0, "Dataset not for sale");
        require(d.creator != msg.sender, "Creator cant buy dataset");
        
        require(dataToken.transferFrom(msg.sender, address(this), d.price), "Payment failed");

        uint256 revenueShare = (d.price * 80) / 100;
        
        uint256 poolShare = d.price - revenueShare;
        d.rewardPool += poolShare;
        d.downloads += 1;


        require(d.totalSharePoints > 0, "No shareholders to pay");
        for (uint i = 0; i < d.participants.length; i++) {
            address participant = d.participants[i];
            uint256 participantSharePoints = d.sharePoints[participant];
            
            if (participantSharePoints > 0) {
                uint256 earnings = (revenueShare * participantSharePoints) / d.totalSharePoints;
                withdrawableBalance[participant] += earnings;
            }
        }

        
        emit DatasetPurchased(datasetId, msg.sender, d.price);
    }

    function claimRewards() external {
        uint256 amount = withdrawableBalance[msg.sender];
        require(amount > 0, "No rewards to claim");
        
        withdrawableBalance[msg.sender] = 0;
        require(dataToken.transfer(msg.sender, amount), "Transfer failed");

        emit RewardsClaimed(msg.sender, amount);
    }

    function userContributions(address _user) external view returns (ProposalData[] memory) {
        uint count = 0;
        for (uint i = 1; i <= proposalCount; i++) {
            if (proposals[i].proposer == _user) {
                count++;
            }
        }

        if (count == 0) {
            return new ProposalData[](0);
        }

        ProposalData[] memory userProposals = new ProposalData[](count);
        uint counter = 0;

        for (uint i = 1; i <= proposalCount; i++) {
            if (proposals[i].proposer == _user) {
                ContributionProposal storage p = proposals[i];
                
                userProposals[counter] = ProposalData({
                    proposalId: i,
                    datasetId: p.datasetId,
                    proposer: p.proposer,
                    proposedURI: p.proposedURI,
                    voteDeadline: p.voteDeadline,
                    yesVotes: p.yesVotes,
                    noVotes: p.noVotes,
                    resolved: p.resolved,
                    voters: p.voters,
                    title: p.title,
                    description: p.description,
                    contribType: p.contribType,
                    status : p.status
                });
                
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
        DatasetView[] memory allDatasets = new DatasetView[](datasetCount);

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
                category: d.category,
                downloads: d.downloads
            });
        }

        return allDatasets;
    }

    function getDatasetById(uint256 _id) external view returns(DatasetView memory) {
        Dataset storage d = datasets[_id];
        return DatasetView({
            id: _id,
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
            category: d.category,
            downloads: d.downloads
        });
    }

    function getPendingProposals(address _user) external view returns (ProposalData[] memory) {
        uint count = 0;
        for (uint i = 1; i <= proposalCount; i++) {
            if (proposals[i].status == ProposalStatus.Pending && proposals[i].proposer == _user) {
                count++;
            }
        }

        ProposalData[] memory userProposals = new ProposalData[](count);
        if (count == 0) {
            return userProposals;
        }

        uint counter = 0;
        for (uint i = 1; i <= proposalCount; i++) {
            if (proposals[i].status == ProposalStatus.Pending && proposals[i].proposer == _user) {
                ContributionProposal storage p = proposals[i];
                userProposals[counter] = ProposalData({
                    proposalId: i,
                    datasetId: p.datasetId,
                    proposer: p.proposer,
                    proposedURI: p.proposedURI,
                    voteDeadline: p.voteDeadline,
                    yesVotes: p.yesVotes,
                    noVotes: p.noVotes,
                    resolved: p.resolved,
                    voters: p.voters,
                    title: p.title,
                    description: p.description,
                    contribType: p.contribType,
                    status: p.status
                });
                counter++;
            }
        }
        return userProposals;
    }

    function getReviewedProposals(address _user) external view returns (ProposalData[] memory) {
        uint count = 0;
        for (uint i = 1; i <= proposalCount; i++) {
            uint256 datasetId = proposals[i].datasetId;
            if (userReviewDetails[_user][i] == true && userFavorites[datasetId][_user] == true) {
                count++;
            }
        }

        ProposalData[] memory userProposals = new ProposalData[](count);
        if (count == 0) {
            return userProposals;
        }

        uint counter = 0;
        for (uint i = 1; i <= proposalCount; i++) {
            uint256 datasetId = proposals[i].datasetId;
            if (userReviewDetails[_user][i] == true && userFavorites[datasetId][_user] == true) {
                ContributionProposal storage p = proposals[i];
                userProposals[counter] = ProposalData({
                    proposalId: i,
                    datasetId: p.datasetId,
                    proposer: p.proposer,
                    proposedURI: p.proposedURI,
                    voteDeadline: p.voteDeadline,
                    yesVotes: p.yesVotes,
                    noVotes: p.noVotes,
                    resolved: p.resolved,
                    voters: p.voters,
                    title: p.title,
                    description: p.description,
                    contribType: p.contribType,
                    status: p.status
                });
                counter++;
            }
        }
        return userProposals;
    }

    function getPendingReviews(address _user) external view returns (ProposalData[] memory) {
        uint count = 0;
        for (uint i = 1; i <= proposalCount; i++) {
            uint256 datasetId = proposals[i].datasetId;
            if (userReviewDetails[_user][i] == false && userFavorites[datasetId][_user] == true) {
                count++;
            }
        }

        ProposalData[] memory userProposals = new ProposalData[](count);
        if (count == 0) {
            return userProposals;
        }

        uint counter = 0;
        for (uint i = 1; i <= proposalCount; i++) {
            uint256 datasetId = proposals[i].datasetId;
            if (userReviewDetails[_user][i] == false && userFavorites[datasetId][_user] == true) {
                ContributionProposal storage p = proposals[i];
                userProposals[counter] = ProposalData({
                    proposalId: i,
                    datasetId: p.datasetId,
                    proposer: p.proposer,
                    proposedURI: p.proposedURI,
                    voteDeadline: p.voteDeadline,
                    yesVotes: p.yesVotes,
                    noVotes: p.noVotes,
                    resolved: p.resolved,
                    voters: p.voters,
                    title: p.title,
                    description: p.description,
                    contribType: p.contribType,
                    status: p.status
                });
                counter++;
            }
        }
        return userProposals;
    }

    function getRejectedProposals(address _user) external view returns (ProposalData[] memory) {
        uint count = 0;
        for (uint i = 1; i <= proposalCount; i++) {
            if (proposals[i].status == ProposalStatus.Rejected && proposals[i].proposer == _user) {
                count++;
            }
        }

        ProposalData[] memory userProposals = new ProposalData[](count);
        if (count == 0) {
            return userProposals;
        }

        uint counter = 0;
        for (uint i = 1; i <= proposalCount; i++) {
            if (proposals[i].status == ProposalStatus.Rejected && proposals[i].proposer == _user) {
                ContributionProposal storage p = proposals[i];
                userProposals[counter] = ProposalData({
                    proposalId: i,
                    datasetId: p.datasetId,
                    proposer: p.proposer,
                    proposedURI: p.proposedURI,
                    voteDeadline: p.voteDeadline,
                    yesVotes: p.yesVotes,
                    noVotes: p.noVotes,
                    resolved: p.resolved,
                    voters: p.voters,
                    title: p.title,
                    description: p.description,
                    contribType: p.contribType,
                    status: p.status
                });
                counter++;
            }
        }
        return userProposals;
    }

    function getApprovedProposals(address _user) external view returns (ProposalData[] memory) {
        uint count = 0;
        for (uint i = 1; i <= proposalCount; i++) {
            if (proposals[i].status == ProposalStatus.Approved && proposals[i].proposer == _user) {
                count++;
            }
        }

        ProposalData[] memory userProposals = new ProposalData[](count);
        if (count == 0) {
            return userProposals;
        }
        
        uint counter = 0;
        for (uint i = 1; i <= proposalCount; i++) {
            if (proposals[i].status == ProposalStatus.Approved && proposals[i].proposer == _user) {
                ContributionProposal storage p = proposals[i];
                userProposals[counter] = ProposalData({
                    proposalId: i,
                    datasetId: p.datasetId,
                    proposer: p.proposer,
                    proposedURI: p.proposedURI,
                    voteDeadline: p.voteDeadline,
                    yesVotes: p.yesVotes,
                    noVotes: p.noVotes,
                    resolved: p.resolved,
                    voters: p.voters,
                    title: p.title,
                    description: p.description,
                    contribType: p.contribType,
                    status: p.status
                });
                counter++;
            }
        }
        return userProposals;
    }

    function userVoteStatusByProposalId(address _user, uint256 proposalId) external view returns(bool) {
        require(proposalId <= proposalCount && proposalId > 0, "Invalid proposal Id");
        return userReviewDetails[_user][proposalId];
    }

    function getFavouriteDatasets(address _user) external view returns (DatasetView[] memory) {
        uint count = 0;
        for (uint i = 1; i <= datasetCount; i++) {
            if (userFavorites[i][_user] == true) {
                count++;
            }
        }

        if (count == 0) {
            return new DatasetView[](0);
        }

        DatasetView[] memory favoriteDatasets = new DatasetView[](count);
        uint counter = 0;

        for (uint i = 1; i <= datasetCount; i++) {
            if (userFavorites[i][_user] == true) {
                Dataset storage d = datasets[i];
                favoriteDatasets[counter] = DatasetView({
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
                    category: d.category,
                    downloads: d.downloads
                });
                counter++;
            }
        }

        return favoriteDatasets;
    }


    function toggleFavourite(uint256 _datasetId) external {
        require(datasets[_datasetId].creator != address(0), "Dataset does not exist");

        // Toggle the favorite status for the message sender
        bool isCurrentlyFavorite = userFavorites[_datasetId][msg.sender];
        userFavorites[_datasetId][msg.sender] = !isCurrentlyFavorite;

        emit DatasetFavorited(_datasetId, msg.sender, !isCurrentlyFavorite);
    }

    function checkUpkeep(bytes calldata /* checkData */) external view returns (bool upkeepNeeded, bytes memory performData) {
        for (uint256 i = 1; i < proposalCount; i++) {
            ContributionProposal storage p = proposals[i];
            if (block.timestamp >= p.voteDeadline && !p.resolved) {
                upkeepNeeded = true;
                performData = abi.encode(i); // Pass the proposalId
                return (upkeepNeeded, performData);
            }
        }
        upkeepNeeded = false;
        performData = bytes("");
        return (upkeepNeeded, performData);
    }

    function getVerifierVote(uint256 proposalId, address verifier) external view returns (bool) {
        require(proposalId > 0 && proposalId <= proposalCount, "Invalid proposal ID");
        require(proposals[proposalId].hasVoted[verifier], "Verifier has not voted on this proposal");
        
        return proposals[proposalId].voteChoice[verifier];
    }


}