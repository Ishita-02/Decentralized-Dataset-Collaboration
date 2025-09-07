// Web3 Service for interacting with the DataMarketplace smart contract
class Web3Service {
  constructor() {
    this.web3 = null;
    this.contract = null;
    this.account = null;
    
    // Replace with your deployed contract address
    this.contractAddress = "0x..."; // UPDATE THIS
    
    // Contract ABI (simplified - add full ABI from your compiled contract)
    this.contractABI = [
      {
        "inputs": [{"internalType": "address", "name": "_tokenAddress", "type": "address"}],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [],
        "name": "stakeToVerify",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {"internalType": "uint256", "name": "price", "type": "uint256"},
          {"internalType": "string", "name": "tokenURI", "type": "string"}
        ],
        "name": "uploadDataset",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {"internalType": "uint256", "name": "datasetId", "type": "uint256"},
          {"internalType": "string", "name": "proposedURI", "type": "string"}
        ],
        "name": "proposeContribution",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {"internalType": "uint256", "name": "proposalId", "type": "uint256"},
          {"internalType": "bool", "name": "vote", "type": "bool"}
        ],
        "name": "voteOnContribution",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [{"internalType": "uint256", "name": "datasetId", "type": "uint256"}],
        "name": "purchaseDataset",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "claimRewards",
        "outputs": [],
        "stateMutability": "nonpayable",
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
}

export default new Web3Service();