const pinataSDK = require('@pinata/sdk');
const fs = require('fs');
const dotenv = require('dotenv');
const {Dataset} = require('../models/datasetModel.js');
const {User} = require('../models/userModel.js');
const { Readable } = require('stream'); 
dotenv.config();

class UserController {

    constructor() {
        this.pinata = new pinataSDK(
          `${PINATA_API_KEY}`, 
          `${PINATA_SECRET_KEY}`
        );
      }

    async uploadDataset(req, res) {
        try {
          const walletAddress = req.query.walletAddress;
          console.log(walletAddress)
      
          if (!walletAddress) {
            return res.status(400).json({
              success: false,
              message: 'Wallet address is required',
            });
          }
      
          // Find user by walletAddress
          const user = await User.findOne({ walletAddress });
          if (!user) {
            return res.status(404).json({
              success: false,
              message: 'User not found',
            });
          }
          console.log("users", user)
      
          if (user.role !== 'uploader') {
            return res.status(403).json({
              success: false,
              message: 'Only uploaders can upload datasets',
            });
          }
      
          const file = req.file;
          if (!file) {
            return res.status(400).json({
              success: false,
              message: 'No file uploaded',
            });
          }
      
          // Convert buffer to a readable stream
          const bufferStream = new Readable();
          bufferStream.push(file.buffer);  // Push the buffer into the stream
          bufferStream.push(null); // End the stream
      
          // Additional metadata for Pinata
          const options = {
            pinataMetadata: {
              name: file.originalname,
              keyvalues: {
                userId: user._id.toString(),
                uploadedBy: user.username,
                category: req.body.category || 'uncategorized',
              },
            },
            pinataOptions: {
              cidVersion: 0,
            },
          };
      
          // Upload to IPFS via Pinata
          const result = await this.pinata.pinFileToIPFS(bufferStream, options);
      
          // Create dataset object
          const newDataset = new Dataset({
            title: req.body.title || file.originalname,
            description: req.body.description || '',
            uploader: user._id,
            dataType: req.body.dataType || 'unstructured',
            fileFormat: file.mimetype,
            fileSize: file.size,
            price: req.body.price || 0,
            dataHash: result.IpfsHash,
            storageLocation: `ipfs://${result.IpfsHash}`,
            tags: req.body.tags ? req.body.tags.split(',') : [],
          });
          console.log("newDataset", newDataset)
      
          // Save dataset
          const savedDataset = await newDataset.save();
      
          // Update user's uploaded datasets
          await User.findByIdAndUpdate(user._id, {
            $push: { datasetsUploaded: savedDataset._id },
          });
      
          // Prepare response
          res.status(201).json({
            success: true,
            message: 'Dataset uploaded to IPFS successfully',
            dataset: {
              id: savedDataset._id,
              title: savedDataset.title,
              ipfsHash: result.IpfsHash,
              storageLocation: savedDataset.storageLocation,
              size: savedDataset.fileSize,
              tokenUri: savedDataset.storageLocation,
              price: savedDataset.price
            },
          });
      
        } catch (error) {
          console.error('Dataset upload error:', error);
      
          res.status(500).json({
            success: false,
            message: 'Internal server error during dataset upload',
            error: process.env.NODE_ENV === 'production' ? {} : error.message,
          });
        }
    }

    async getDatasets(req, res) {
        try {
          const datasets = await Dataset.find(); 
      
          if (!datasets || datasets.length === 0) {
            return res.status(404).json({
              success: false,
              message: 'No datasets found',
            });
          }
      
          res.status(200).json({
            success: true,
            message: 'Datasets retrieved successfully',
            datasets,
          });
        } catch (error) {
          console.error('Error fetching datasets:', error);
      
          res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'production' ? {} : error.message,
          });
        }
    }

    async search(req, res) {
        try {
            const { tag, dataType } = req.query;
    
            const filter = {};
    
            if (tag) {
                filter.tags = { $in: tag.split(',').map(t => t.trim()) };
            }
    
            if (dataType) {
                filter.dataType = dataType;
            }
    
            const datasets = await Dataset.find(filter);
    
            if (datasets.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No datasets found matching the search criteria',
                });
            }
    
            res.status(200).json({
                success: true,
                message: 'Datasets retrieved successfully',
                datasets,
            });
        } catch (error) {
            console.error('Search error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during search',
                error: process.env.NODE_ENV === 'production' ? {} : error.message,
            });
        }
    }

    async verifyDataset(req, res) {
        try {
            const { datasetId } = req.params; 
            const { verifierId, rating } = req.body;
    
            if (rating < 0 || rating > 100) {
                return res.status(400).json({ success: false, message: 'Rating must be between 0 and 100' });
            }
    
            const dataset = await Dataset.findById(datasetId);
            if (!dataset) {
                return res.status(404).json({ success: false, message: 'Dataset not found' });
            }
    
            const verifier = await User.findById(verifierId);
            if (!verifier) {
                return res.status(404).json({ success: false, message: 'Verifier not found' });
            }
            if (verifier.role !== 'verifier') {
                return res.status(403).json({ success: false, message: 'User is not authorized to verify' });
            }
    
            dataset.verificationStatus = 'verified';
            dataset.totalVotes = (dataset.totalVotes || 0) + 1;
            dataset.cumulativeRating = (dataset.cumulativeRating || 0) + rating;
    
            if (dataset.totalVotes >= 20) { 
                const averageRating = dataset.cumulativeRating / dataset.totalVotes;
                dataset.isVerified = averageRating >= 50; 
            }
    
            await dataset.save();
    
            if (!verifier.verificationsDone.includes(datasetId)) {
                verifier.verificationsDone.push(datasetId);
                await verifier.save();
            }
    
            return res.status(200).json({
                success: true,
                message: 'Dataset verified successfully',
                dataset,
                verifier,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error during dataset verification',
                error: error.message,
            });
        }
    }
      
}

module.exports = new UserController();
