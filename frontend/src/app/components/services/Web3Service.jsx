// Web3 Service for interacting with the DataMarketplace smart contract
import Web3 from 'web3';
import dataMarketplaceABI from '@/app/abis/DataMarketplace';
import dataTokenABI from '@/app/abis/DataToken';

class Web3Service {
  constructor() {

    this.contract = null;
    
    this.account = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    this.tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    this.contractABI = dataMarketplaceABI;
    this.tokenContractABI = dataTokenABI;
    
    // Replace with your deployed contract address
    this.contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // UPDATE THIS

  }

  
  async init() {
    if (typeof window.ethereum !== 'undefined') {
      // Modern dapp browsers
      this.web3 = new Web3("http://127.0.0.1:8545/");
      
      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await this.web3.eth.getAccounts();
        this.account = accounts[0];
        
        // Initialize contract
        this.contract = new this.web3.eth.Contract(this.contractABI, this.contractAddress);
        this.tokenContract = new this.web3.eth.Contract(this.tokenContractABI, this.tokenAddress);
        
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
    if (typeof window.ethereum === 'undefined') {
      throw new Error("No Ethereum provider found. Please install MetaMask.");
    }
    this.web3 = new Web3(window.ethereum);
    
    // This line specifically triggers the MetaMask pop-up
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    this.account = accounts[0];

    // Re-initialize the contract after connecting to ensure it uses the user's provider
    await this.init(true);
    return this.account;
  }

  async isConnected() {
    if (typeof window.ethereum === 'undefined') {
      return false;
    }
    this.web3 = new Web3(window.ethereum);
    // eth_accounts returns an array of accounts if already connected, or empty if not
    const accounts = await this.web3.eth.getAccounts();
    return accounts.length > 0;
  }

  getAccount() {
    return this.account;
  }

  async approveTokenSpend(amountInWei) {
    if (!this.tokenContract || !this.account) {
      throw new Error("Web3 not initialized. Please connect your wallet.");
    }
  
    try {

      // console.log(this.tokenContract, this.contractAddress)
      // CORRECT: Get the current allowance using await, .call(), and the correct arguments.
      const currentAllowance = await this.tokenContract.methods
        .allowance(this.account, this.contractAddress)
        .call();
  
      console.log("Current allowance:", currentAllowance);
      console.log("Amount needed:", amountInWei);
  
      // CORRECT: Compare the allowance to the required amount.
      // Use BigInt for safety, as token amounts can be very large.
      if (BigInt(currentAllowance) >= BigInt(amountInWei)) {
        console.log("Sufficient allowance already exists.");
        return true; // Return a value indicating no transaction was needed.
      } else {
        console.log("Allowance is insufficient. Sending approve transaction...");
        const tx = await this.tokenContract.methods
          .approve(this.contractAddress, amountInWei)
          .send({ from: this.account });
          
        console.log("Approve transaction successful:", tx.transactionHash);
        return tx.transactionHash; // Return the transaction hash.
      }
    } catch (error) {
      console.error("Error approving token spend:", error);
      throw error;
    }
  }


  async getCurrentUser() {
    // Derive a pseudo user from wallet. No DB.
    const connected = await this.isConnected();
    console.log("connected", connected)
    const address = connected ? this.account : null;
    const earned = connected ? await this.getWithdrawableBalance().catch(() => 0) : 0;
    const balance = connected ? await this.dataTokenBalance() : 0;
    console.log("balance", balance);
    const varificationsDone = connected ? await this.contract.methods.totalVerificattions().call() : 0;
    const activeContributors = await this.contract.methods.getContributorCount().call();
    console.log("active contributors web3js", activeContributors)
    return {
      id: address || 'guest',
      email: address ? `${address.toLowerCase()}@wallet` : 'guest@wallet',
      full_name: address || 'Guest',
      role: 'both',
      tokens_balance: Number(balance) || 0,
      reputation_score: 0,
      contributions_count: activeContributors,
      verifications_count: varificationsDone,
      total_earned: Number(earned) || 0,
      specializations: []
    };
  }

  async getVerifierInfo() {
    if (!this.contract || !this.account) {
      throw new Error("Web3 not initialized");
    }

    try {
      const verifierData = await this.contract.methods.verifiers(this.account).call();
      console.log("verifier data", verifierData);
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
      await this.approveTokenSpend(amountWei);
      
      const tx = await this.contract.methods.stakeToVerify().send({
        from: this.account,
        gas: 200000
      });
      console.log(tx)
      
      return tx.transactionHash;
    } catch (error) {
      console.error("Error staking tokens:", error);
      throw error;
    }
  }

  async uploadDataset(params) {
    if (!this.contract || !this.account) {
      throw new Error("Web3 not initialized");
    }

    try {
      console.log(params)

      const tx = await this.contract.methods.uploadDataset(params).send({
        from: this.account
      });
      
      return tx.transactionHash;
    } catch (error) {
      console.error("Error uploading dataset:", error);
      throw error;
    }
  }

  async proposeContribution(datasetId, proposedURI, title, description, contribType) {
    if (!this.contract || !this.account) {
      throw new Error("Web3 not initialized");
    }

    try {
      const tx = await this.contract.methods.proposeContribution(datasetId, proposedURI, title, description, contribType).send({
        from: this.account
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
        from: this.account
      });
      console.log("verify txn", tx.transactionHash)
      
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
        from: this.account
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
      console.log("balance from withdrawable balance", balance)
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
        console.log("items from datasets", items)
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
          file_url: d.fileUrl || d.currentURI || '',
          size: Number(d.size)
        }));
      }
    } catch (e) {
      console.warn('getAllDatasets view failed, returning empty list');
    }
    // Fallback: return empty list so UI still renders
    return [];
  }

  async getUserDatasetCurrentId(id) {
    if (!this.web3 && typeof window !== 'undefined' && window.ethereum) {
      await this.init();
    }
    try {
      const tokenURI = await this.contract.methods.getUserDatasetCurrentURI(id).call();
      console.log("web3", tokenURI);
      return tokenURI;
    } catch (e) {
      console.warn('getAllDatasets view failed, returning empty list');
      return;
    }
  }

  async getActiveContributors() {
    if (!this.web3 && typeof window !== 'undefined' && window.ethereum) {
      await this.init();
    }
    try {
      const contributors = await this.contract.methods.getContributorCount().call();
      console.log("contributors", contributors);
      return contributors;
    } catch (e) {
      console.warn('Active contribuotrs failed, returning empty list');
      return;
    }
    
  }

  async totalVerificattions() {
    if (!this.web3 && typeof window !== 'undefined' && window.ethereum) {
      await this.init();
    }
    try {
      const verifications = await this.contract.methods.totalVerificattions().call();
      console.log("verifications", verifications);
      return verifications;
    } catch (e) {
      console.warn('Active contribuotrs failed, returning empty list');
      return;
    }
    
  }

  async dataTokenBalance() {
    if (!this.web3 && typeof window !== 'undefined' && window.ethereum) {
      await this.init();
    }
    try {
      const balance = await this.contract.methods.dataTokenBalance(this.account).call();
      console.log("balance", balance);
      return balance;
    } catch (e) {
      console.warn('Balance failed, returning empty list');
      return;
    }
    
  }

  async userContributions() {
    if (!this.web3 && typeof window !== 'undefined' && window.ethereum) {
      await this.init();
    }
    try {
      const userContributions = await this.contract.methods.userContributions(this.account).call();
      console.log("userContributions", userContributions);
      return userContributions;
    } catch (e) {
      console.warn('No user contributions or failed to fetch, returning empty list');
      return [];
    }
  }

  async getDatasetById(id) {
    if (!this.web3 && typeof window !== 'undefined' && window.ethereum) {
      await this.init();
    }
    try {
      console.log("id", id)
      const datasetById = await this.contract.methods.getDatasetById(id).call();
      console.log("datasetById", datasetById);
      return datasetById;
    } catch (e) {
      console.warn('No dataset found or failed to fetch, returning empty list');
      return;
    }
  }

  async getPendingProposals() {
    if (!this.web3 && typeof window !== 'undefined' && window.ethereum) {
      await this.init();
    }
    try {
      const result = await this.contract.methods.getPendingProposals(this.account).call();
      console.log("result", result[0])
      if (result[0][0].proposer == "0x0000000000000000000000000000000000000000") {
        result[0] = [];
      }
      return result[0];
    } catch (e) {
      console.warn('No dataset found or failed to fetch, returning empty list');
      return [];
    }
  }

  async getReviewedProposals() {
    if (!this.web3 && typeof window !== 'undefined' && window.ethereum) {
      await this.init();
    }
    try {
      const result = await this.contract.methods.getReviewedProposals(this.account).call();
      console.log("result", result[0])
      if (result[0][0].proposer == "0x0000000000000000000000000000000000000000") {
        result[0] = [];
      }
      return result[0];
    } catch (e) {
      console.warn('No dataset found or failed to fetch, returning empty list');
      return [];
    }
  }

  async getPendingReviews() {
    if (!this.web3 && typeof window !== 'undefined' && window.ethereum) {
      await this.init();
    }
    try {
      const result = await this.contract.methods.getPendingReviews(this.account).call();
      console.log("result", result[0])
      if (result[0][0].proposer == "0x0000000000000000000000000000000000000000") {
        result[0] = [];
      }
      return result[0];
    } catch (e) {
      console.warn('No dataset found or failed to fetch, returning empty list');
      return [];
    }
  }

  async getRejectedProposals() {
    if (!this.web3 && typeof window !== 'undefined' && window.ethereum) {
      await this.init();
    }
    try {
      const result = await this.contract.methods.getRejectedProposals(this.account).call();
      console.log("result", result[0])
      if (result[0][0].proposer == "0x0000000000000000000000000000000000000000") {
        result[0] = [];
      }
      return result[0];
    } catch (e) {
      console.warn('No dataset found or failed to fetch, returning empty list');
      return [];
    }
  }

  async getApprovedProposals() {
    if (!this.web3 && typeof window !== 'undefined' && window.ethereum) {
      await this.init();
    }
    try {
      const result = await this.contract.methods.getApprovedProposals(this.account).call();
      console.log("result", result[0])
      if (result[0][0].proposer == "0x0000000000000000000000000000000000000000") {
        result[0] = [];
      }
      return result[0];
    } catch (e) {
      console.warn('No dataset found or failed to fetch, returning empty list');
      return [];
    }
  }

  async userVoteStatusByProposalId(id) {
    if (!this.web3 && typeof window !== 'undefined' && window.ethereum) {
      await this.init();
    }
    try {
      const result = await this.contract.methods.userVoteStatusByProposalId(id).call();
      return result;
    } catch (e) {
      console.warn('No dataset found or failed to fetch, returning empty list');
      return [];
    }
  }


}

export default new Web3Service();