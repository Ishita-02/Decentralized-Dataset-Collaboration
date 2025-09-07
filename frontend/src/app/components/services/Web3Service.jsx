// Web3 Service for interacting with the DataMarketplace smart contract
import Web3 from 'web3';

class Web3Service {
  constructor() {
    this.web3 = null;
    this.contract = null;
    this.account = "0xDC984157F54F2e186cb6E9082bb998CbE7C44c23";
    
    // Replace with your deployed contract address
    this.contractAddress = "0x892289a0cBc5A41e2bD46b462310546cEf46cc97"; // UPDATE THIS
    
    // Contract ABI (simplified - add full ABI from your compiled contract)
    this.contractABI = [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_tokenAddress",
            "type": "address"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "proposalId",
            "type": "uint256"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "datasetId",
            "type": "uint256"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "proposer",
            "type": "address"
          }
        ],
        "name": "ContributionProposed",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "proposalId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "bool",
            "name": "approved",
            "type": "bool"
          }
        ],
        "name": "ContributionResolved",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "proposalId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "bool",
            "name": "approved",
            "type": "bool"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "rewardsDistributed",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "totalSlashed",
            "type": "uint256"
          }
        ],
        "name": "ContributionResolved",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "datasetId",
            "type": "uint256"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "creator",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "price",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "tokenURI",
            "type": "string"
          }
        ],
        "name": "DatasetUploaded",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "user",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "RewardsClaimed",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "proposalId",
            "type": "uint256"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "verifier",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "bool",
            "name": "vote",
            "type": "bool"
          }
        ],
        "name": "VerifierVoted",
        "type": "event"
      },
      {
        "inputs": [],
        "name": "CONTRIBUTOR_REWARD_SHARES",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "CREATOR_INITIAL_SHARES",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "MINIMUM_STAKE",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "REWARD_POOL_DISTRIBUTION_PERCENT",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "SLASH_PERCENTAGE",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "VOTE_DURATION",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "claimRewards",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "dataToken",
        "outputs": [
          {
            "internalType": "contract IERC20",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "datasetCount",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "datasets",
        "outputs": [
          {
            "internalType": "address",
            "name": "creator",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "currentURI",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "price",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalSharePoints",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "proposalCount",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "proposals",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "datasetId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "proposer",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "proposedURI",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "voteDeadline",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "yesVotes",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "noVotes",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "resolved",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "datasetId",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "proposedURI",
            "type": "string"
          }
        ],
        "name": "proposeContribution",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "datasetId",
            "type": "uint256"
          }
        ],
        "name": "purchaseDataset",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "proposalId",
            "type": "uint256"
          }
        ],
        "name": "resolveContribution",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "stakeToVerify",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "unstake",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "price",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "tokenURI",
            "type": "string"
          }
        ],
        "name": "uploadDataset",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "verifierRewardPool",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "verifiers",
        "outputs": [
          {
            "internalType": "bool",
            "name": "isVerifier",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "stakedAmount",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "proposalId",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "vote",
            "type": "bool"
          }
        ],
        "name": "voteOnContribution",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "withdrawableBalance",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ];
  }

  async init() {
    if (typeof window.ethereum !== 'undefined') {
      // Modern dapp browsers
      this.web3 = new Web3(window.ethereum);
      
      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await this.web3.eth.getAccounts();
        this.account = accounts[0];
        
        // Initialize contract
        this.contract = new this.web3.eth.Contract(this.contractABI, this.contractAddress);
        
        return true;
      } catch (error) {
        console.error("User denied account access");
        return false;
      }
    } else {
      console.error("No ethereum provider detected");
      return false;
    }
  }

  async connectWallet() {
    try {
      const initialized = await this.init();
      if (initialized) {
        console.log("Wallet connected:", this.account);
        return this.account;
      }
      throw new Error("Failed to connect wallet");
    } catch (error) {
      console.error("Error connecting wallet:", error);
      throw error;
    }
  }

  async isConnected() {
    if (!this.web3) {
      return false;
    }
    
    try {
      const accounts = await this.web3.eth.getAccounts();
      return accounts.length > 0;
    } catch {
      return false;
    }
  }

  getAccount() {
    return this.account;
  }

  async getCurrentUser() {
    // Derive a pseudo user from wallet. No DB.
    const connected = await this.isConnected();
    const address = connected ? this.account : null;
    const balance = connected ? await this.getWithdrawableBalance().catch(() => 0) : 0;
    return {
      id: address || 'guest',
      email: address ? `${address.toLowerCase()}@wallet` : 'guest@wallet',
      full_name: address || 'Guest',
      role: 'both',
      tokens_balance: Number(balance) || 0,
      reputation_score: 0,
      contributions_count: 0,
      verifications_count: 0,
      total_earned: 0,
      specializations: []
    };
  }

  async getVerifierInfo() {
    if (!this.contract || !this.account) {
      throw new Error("Web3 not initialized");
    }

    try {
      const verifierData = await this.contract.methods.verifiers(this.account).call();
      return {
        isVerifier: verifierData.isVerifier,
        stakedAmount: this.web3.utils.fromWei(verifierData.stakedAmount, 'ether')
      };
    } catch (error) {
      console.error("Error getting verifier info:", error);
      return { isVerifier: false, stakedAmount: 0 };
    }
  }

  async stakeToVerify(amount = 1000) {
    if (!this.contract || !this.account) {
      throw new Error("Web3 not initialized");
    }

    try {
      const amountWei = this.web3.utils.toWei(amount.toString(), 'ether');
      
      // First approve the contract to spend tokens (if using ERC20)
      // Note: You'll need the DATA token contract for this
      // await this.approveTokenSpend(amountWei);
      
      const tx = await this.contract.methods.stakeToVerify().send({
        from: this.account,
        gas: 200000
      });
      
      return tx.transactionHash;
    } catch (error) {
      console.error("Error staking tokens:", error);
      throw error;
    }
  }

  async uploadDataset(price, tokenURI) {
    if (!this.contract || !this.account) {
      throw new Error("Web3 not initialized");
    }

    try {
      const priceWei = this.web3.utils.toWei(price.toString(), 'ether');
      
      const tx = await this.contract.methods.uploadDataset(priceWei, tokenURI).send({
        from: this.account,
        gas: 300000
      });
      
      return tx.transactionHash;
    } catch (error) {
      console.error("Error uploading dataset:", error);
      throw error;
    }
  }

  async proposeContribution(datasetId, proposedURI) {
    if (!this.contract || !this.account) {
      throw new Error("Web3 not initialized");
    }

    try {
      const tx = await this.contract.methods.proposeContribution(datasetId, proposedURI).send({
        from: this.account,
        gas: 200000
      });
      
      return tx.transactionHash;
    } catch (error) {
      console.error("Error proposing contribution:", error);
      throw error;
    }
  }

  async voteOnContribution(proposalId, vote) {
    if (!this.contract || !this.account) {
      throw new Error("Web3 not initialized");
    }

    try {
      const tx = await this.contract.methods.voteOnContribution(proposalId, vote).send({
        from: this.account,
        gas: 150000
      });
      
      return tx.transactionHash;
    } catch (error) {
      console.error("Error voting on contribution:", error);
      throw error;
    }
  }

  async purchaseDataset(datasetId) {
    if (!this.contract || !this.account) {
      throw new Error("Web3 not initialized");
    }

    try {
      const tx = await this.contract.methods.purchaseDataset(datasetId).send({
        from: this.account,
        gas: 200000
      });
      
      return tx.transactionHash;
    } catch (error) {
      console.error("Error purchasing dataset:", error);
      throw error;
    }
  }

  async claimRewards() {
    if (!this.contract || !this.account) {
      throw new Error("Web3 not initialized");
    }

    try {
      const tx = await this.contract.methods.claimRewards().send({
        from: this.account,
        gas: 100000
      });
      
      return tx.transactionHash;
    } catch (error) {
      console.error("Error claiming rewards:", error);
      throw error;
    }
  }

  async getWithdrawableBalance() {
    if (!this.contract || !this.account) {
      throw new Error("Web3 not initialized");
    }

    try {
      const balance = await this.contract.methods.withdrawableBalance(this.account).call();
      return this.web3.utils.fromWei(balance, 'ether');
    } catch (error) {
      console.error("Error getting withdrawable balance:", error);
      return 0;
    }
  }

  // READ HELPERS (graceful fallbacks if contract lacks these views)
  async getAllDatasets() {
    // Try to initialize for read if not already
    if (!this.web3 && typeof window !== 'undefined' && window.ethereum) {
      await this.init();
    }
    try {
      if (this.contract?.methods?.getAllDatasets) {
        const items = await this.contract.methods.getAllDatasets().call();
        return (items || []).map((d, idx) => ({
          id: Number(d.id ?? idx),
          owner: d.owner || this.account || '0x0',
          currentURI: d.currentURI || d.tokenURI || '',
          title: d.title || `Dataset #${Number(d.id ?? idx)}`,
          description: d.description || (d.currentURI ? `IPFS URI: ${d.currentURI}` : ''),
          tags: d.tags || [],
          category: d.category || 'other',
          created_date: d.createdAt ? new Date(Number(d.createdAt) * 1000).toISOString() : new Date().toISOString(),
          downloads: Number(d.downloads || 0),
          contribution_reward: Number(d.contributionReward || 0),
          verification_reward: Number(d.verificationReward || 0),
          download_price: Number(d.price ? this.web3.utils.fromWei(String(d.price), 'ether') : 0),
          file_url: d.fileUrl || d.currentURI || ''
        }));
      }
    } catch (e) {
      console.warn('getAllDatasets view failed, returning empty list');
    }
    // Fallback: return empty list so UI still renders
    return [];
  }
}

export default new Web3Service();