import * as db from './actions';

import * as utils from '../utils';
import Web3 from 'web3';
import winston from 'winston';
import Twit from 'twit';

import SolidityCoder from 'web3/lib/solidity/coder.js';
// import config from './config.json';

winston.level = 'debug';

const MANA_DECIMALS = 18;
const DCL_MARKET_ADDRESS = '0xB3BCa6F5052c7e24726b44da7403b56A8A1b98f8';
const DCL_MARKET_ABI =
[{"constant":false,"inputs":[{"name":"ownerCut","type":"uint8"}],"name":"setOwnerCut","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"nonFungibleRegistry","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"unpause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"acceptedToken","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"assetId","type":"uint256"}],"name":"cancelOrder","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"paused","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"ownerCutPercentage","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"destroy","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"pause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"assetId","type":"uint256"},{"name":"priceInWei","type":"uint256"},{"name":"expiresAt","type":"uint256"}],"name":"createOrder","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"publicationFeeInWei","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"publicationFee","type":"uint256"}],"name":"setPublicationFee","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"auctionByAssetId","outputs":[{"name":"id","type":"bytes32"},{"name":"seller","type":"address"},{"name":"price","type":"uint256"},{"name":"expiresAt","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"assetId","type":"uint256"},{"name":"price","type":"uint256"}],"name":"executeOrder","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_recipient","type":"address"}],"name":"destroyAndSend","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_acceptedToken","type":"address"},{"name":"_nonFungibleRegistry","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"id","type":"bytes32"},{"indexed":true,"name":"assetId","type":"uint256"},{"indexed":true,"name":"seller","type":"address"},{"indexed":false,"name":"priceInWei","type":"uint256"},{"indexed":false,"name":"expiresAt","type":"uint256"}],"name":"AuctionCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"id","type":"bytes32"},{"indexed":true,"name":"assetId","type":"uint256"},{"indexed":true,"name":"seller","type":"address"},{"indexed":false,"name":"totalPrice","type":"uint256"},{"indexed":true,"name":"winner","type":"address"}],"name":"AuctionSuccessful","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"id","type":"bytes32"},{"indexed":true,"name":"assetId","type":"uint256"},{"indexed":true,"name":"seller","type":"address"}],"name":"AuctionCancelled","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"publicationFee","type":"uint256"}],"name":"ChangedPublicationFee","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"ownerCut","type":"uint256"}],"name":"ChangedOwnerCut","type":"event"},{"anonymous":false,"inputs":[],"name":"Pause","type":"event"},{"anonymous":false,"inputs":[],"name":"Unpause","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"}]

// from https://github.com/decentraland/auction/blob/578219535f962232dc984f76adf79c77a15c9603/scripts/recovery.js

const web3 = new Web3(new Web3.providers.HttpProvider('http://159.65.138.91:8545/'));
// const T = new Twit(config.twitter);
const GENESIS_BLOCK = 5283772;
const main = async () => {
	try {	
		const dclMarketContract = web3.eth.contract(DCL_MARKET_ABI);
		const dclMarketInstance = dclMarketContract.at(DCL_MARKET_ADDRESS);
		const auctionCreatedEvent = dclMarketInstance.AuctionCreated({}, {fromBlock: 5310000, toBlock: 'latest'}, async (err, eventData) => {
			if (err) {
				winston.error(err);
				return false;
			}
			const { blockNumber, transactionHash } = eventData;
			const { assetId, seller, priceInWei, expiresAt } = eventData.args;
			const landId = utils.decodeTokenId(assetId.toString(16));
			const landPrice = utils.weiToRealPrice(priceInWei);
			db.dbAuctionCreated(landId, landPrice, seller, transactionHash, blockNumber);
		});

		const auctionSuccessfulEvent = dclMarketInstance.AuctionSuccessful({}, {fromBlock: 5310000, toBlock: 'latest'}, async (err, eventData) => {
			if (err) {
				winston.error(err);
				return false;
			}

			const { blockNumber, transactionHash } = eventData;
			const { assetId, seller, totalPrice, buyer, expiresAt } = eventData.args;
			const landId = utils.decodeTokenId(assetId.toString(16));
			const landPrice = utils.weiToRealPrice(totalPrice);
			db.dbAuctionSuccess(landId, landPrice, seller, buyer, transactionHash, blockNumber);
		});

		const auctionCancelledEvent = dclMarketInstance.AuctionCancelled({}, {fromBlock: 5310000, toBlock: 'latest'}, async (err, eventData) => {
			if (err) {
				winston.error(err);
				return false;
			}
			
			const { blockNumber, transactionHash } = eventData;
			const { assetId, seller } = eventData.args;
			const landId = utils.decodeTokenId(assetId.toString(16));
			const landPrice = 0;
			// const usdPrice = await utils.toUsdPrice(landPrice);
			db.dbAuctionCancelled(landId, landPrice, seller, transactionHash, blockNumber);
		});
	} catch(err) {
		winston.error(err);
	}
}

main();
