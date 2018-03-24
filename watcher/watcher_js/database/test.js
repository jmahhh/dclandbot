// import dbAuctionCreated from './actions/dbAuctionCreated';
// import dbAuctionCancelled from './actions/dbAuctionCancelled';
// import dbAuctionSuccess from './actions/dbAuctionSuccess';
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

const main = async () => {
	try {
		const dclMarketContract = web3.eth.contract(DCL_MARKET_ABI);
		const dclMarketInstance = dclMarketContract.at(DCL_MARKET_ADDRESS);
		const auctionCreatedEvent = dclMarketInstance.AuctionCreated({}, {fromBlock: 5283772, toBlock: 	5284090}, async (err, eventData) => {
			if (err) {
				winston.error(err);
				return false;
			}
			const { blockNumber, transactionHash } = eventData;
			const { assetId, seller, priceInWei, expiresAt } = eventData.args;
			console.log("===START===");
			const realAssetId = utils.decodeTokenId(assetId.toString(16));
			const landPrice = utils.weiToRealPrice(priceInWei);
			const usdPrice = await utils.toUsdPrice(landPrice);
			console.log('landId: ', realAssetId);
			console.log('price: ', landPrice);
			console.log('usdPrice: ', usdPrice);
			console.log('seller: ', seller);
			console.log('txHash: ', transactionHash);
			console.log('blockNumber: ', blockNumber);
			// const landPrice = eventData.args.priceInWei.toNumber() / 10 ** MANA_DECIMALS;
			// let usdPrice = JSON.parse(await rp('https://api.coinmarketcap.com/v1/ticker/decentraland/?convert=USD'));
			// usdPrice = landPrice * parseFloat(usdPrice[0].price_usd);
			// const expiry = new Date(eventData.args.expiresAt.toNumber()).toDateString();
			// winston.verbose(eventData.transactionHash);
			// winston.info(`auctionCreatedEvent data: assetId [${assetId}] | MANAprice ${landPrice} (${usdPrice} USD) | expiry ${expiry}`);
			console.log("===END===");
			// T.post('statuses/update', { status: `Auction created... \n\n Coordinates: [${assetId}] \n Price: ${landPrice} MANA ($${usdPrice} USD) \n Expiry: ${expiry}` }, (err, data, response) => {
			// 	if (err) winston.error(err);
			// });
		});

		// const auctionSuccessfulEvent = dclMarketInstance.AuctionSuccessful({}, {}, async (err, eventData) => {
		// 	if (err) {
		// 		winston.error(err);
		// 		return false;
		// 	}
		// 	console.log(eventData)
		// 	const assetId = decodeTokenId(eventData.args.assetId.toString(16));
		// 	const landPrice = eventData.args.totalPrice.toNumber() / 10 ** MANA_DECIMALS;
		// 	let usdPrice = JSON.parse(await rp('https://api.coinmarketcap.com/v1/ticker/decentraland/?convert=USD'));
		// 	usdPrice = landPrice * parseFloat(usdPrice[0].price_usd);
		// 	winston.verbose(eventData.transactionHash);
		// 	const logString = `Auction successful! \n\n Coordinates: [${assetId}] \n Price: ${landPrice.toLocaleString()} MANA ($${usdPrice.toLocaleString()} USD)`;
		// 	winston.verbose(logString);
		// 	if (!config.disableTwitter) {
		// 		T.post('statuses/update', { status: logString }, (err, data, response) => {
		// 			if (err) winston.error(err);
		// 		});
		// 	}
		// });

		// const auctionCancelledEvent = dclMarketInstance.AuctionCancelled({}, {}, (err, eventData) => {
		// 	if (err) {
		// 		winston.error(err);
		// 		return false;
		// 	}
		// 	console.log(eventData)
		// 	const assetId = decodeTokenId(eventData.args.assetId.toString(16));
		// 	winston.verbose(eventData.transactionHash);
		// 	winston.info(`auctionCancelledEvent data: assetId [${assetId}]`);
		// 	T.post('statuses/update', { status: `Auction cancelled... \n\n Coordinates: [${assetId}]` }, (err, data, response) => {
		// 		if (err) winston.error(err);
		// 	});
		// });
	} catch(err) {
		winston.error(err);
	}
}

main();
