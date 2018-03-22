const Web3 = require('web3');
const winston = require('winston');
const BigNumber = require('bignumber.js');
const Twit = require('twit');

const SolidityCoder = require('web3/lib/solidity/coder.js');
const config = require('./config.json');

winston.level = 'debug';

const MANA_DECIMALS = 18;
const DCL_MARKET_ADDRESS = '0xB3BCa6F5052c7e24726b44da7403b56A8A1b98f8';
const DCL_MARKET_ABI =
[{"constant":false,"inputs":[{"name":"ownerCut","type":"uint8"}],"name":"setOwnerCut","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"nonFungibleRegistry","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"unpause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"acceptedToken","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"assetId","type":"uint256"}],"name":"cancelOrder","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"paused","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"ownerCutPercentage","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"destroy","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"pause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"assetId","type":"uint256"},{"name":"priceInWei","type":"uint256"},{"name":"expiresAt","type":"uint256"}],"name":"createOrder","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"publicationFeeInWei","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"publicationFee","type":"uint256"}],"name":"setPublicationFee","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"auctionByAssetId","outputs":[{"name":"id","type":"bytes32"},{"name":"seller","type":"address"},{"name":"price","type":"uint256"},{"name":"expiresAt","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"assetId","type":"uint256"},{"name":"price","type":"uint256"}],"name":"executeOrder","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_recipient","type":"address"}],"name":"destroyAndSend","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_acceptedToken","type":"address"},{"name":"_nonFungibleRegistry","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"id","type":"bytes32"},{"indexed":true,"name":"assetId","type":"uint256"},{"indexed":true,"name":"seller","type":"address"},{"indexed":false,"name":"priceInWei","type":"uint256"},{"indexed":false,"name":"expiresAt","type":"uint256"}],"name":"AuctionCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"id","type":"bytes32"},{"indexed":true,"name":"assetId","type":"uint256"},{"indexed":true,"name":"seller","type":"address"},{"indexed":false,"name":"totalPrice","type":"uint256"},{"indexed":true,"name":"winner","type":"address"}],"name":"AuctionSuccessful","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"id","type":"bytes32"},{"indexed":true,"name":"assetId","type":"uint256"},{"indexed":true,"name":"seller","type":"address"}],"name":"AuctionCancelled","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"publicationFee","type":"uint256"}],"name":"ChangedPublicationFee","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"ownerCut","type":"uint256"}],"name":"ChangedOwnerCut","type":"event"},{"anonymous":false,"inputs":[],"name":"Pause","type":"event"},{"anonymous":false,"inputs":[],"name":"Unpause","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"}]

// from https://github.com/decentraland/auction/blob/578219535f962232dc984f76adf79c77a15c9603/scripts/recovery.js
const max = new BigNumber('0x7fffffffffffffffffffffffffffffff');
const base = new BigNumber('0x100000000000000000000000000000000');

const decodeTokenId = (hexRepresentation) => {
  const yLength = hexRepresentation.length - 32;
  let x = new BigNumber('0x' + hexRepresentation.slice(yLength, hexRepresentation.length));
  let y = new BigNumber('0x' + (hexRepresentation.slice(0, yLength) || '0'));
  if (x.gt(max)) x = base.minus(x).times(-1);
  if (y.gt(max)) y = base.minus(y).times(-1);
  return [ x.toString(10), y.toString(10) ];
}

const web3 = new Web3(new Web3.providers.HttpProvider("http://geth:8545"));
// const web3 = new Web3(new Web3.providers.HttpProvider(config.serverURL));
const T = new Twit(config.twitter);

const main = async () => {
	try {
		const dclMarketContract = web3.eth.contract(DCL_MARKET_ABI);
		const dclMarketInstance = dclMarketContract.at(DCL_MARKET_ADDRESS);

		const auctionCreatedEvent = dclMarketInstance.AuctionCreated({}, {}, (err, eventData) => {
			if (err) {
				winston.error(err);
				return false;
			}
			console.log(eventData)
			const assetId = decodeTokenId(eventData.args.assetId.toString(16));
			const price = eventData.args.priceInWei.toNumber() / 10 ** MANA_DECIMALS;
			const expiry = new Date(eventData.args.expiresAt.toNumber()).toDateString();
			winston.verbose(eventData.transactionHash);
			winston.info(`auctionCreatedEvent data: assetId [${assetId}] | MANAprice ${price} | expiry ${expiry}`);
			T.post('statuses/update', { status: `Auction created... \n\n Coordinates: [${assetId}] \n Price: ${price} MANA \n Expiry: ${expiry}` }, (err, data, response) => {
				if (err) winston.error(err);
			});
		});

		const auctionSuccessfulEvent = dclMarketInstance.AuctionSuccessful({}, {}, (err, eventData) => {
			if (err) {
				winston.error(err);
				return false;
			}
			console.log(eventData)
			const assetId = decodeTokenId(eventData.args.assetId.toString(16));
			const price = eventData.args.totalPrice.toNumber() / 10 ** MANA_DECIMALS;
			winston.verbose(eventData.transactionHash);
			winston.info(`auctionSuccessfulEvent data: assetId [${assetId}] | MANAprice ${price}`);
			T.post('statuses/update', { status: `Auction successful... \n\n Coordinates: [${assetId}] \n Price: ${price} MANA` }, (err, data, response) => {
				if (err) winston.error(err);
			});
		});

		const auctionCancelledEvent = dclMarketInstance.AuctionCancelled({}, {}, (err, eventData) => {
			if (err) {
				winston.error(err);
				return false;
			}
			console.log(eventData)
			const assetId = decodeTokenId(eventData.args.assetId.toString(16));
			winston.verbose(eventData.transactionHash);
			winston.info(`auctionCancelledEvent data: assetId [${assetId}]`);
			T.post('statuses/update', { status: `Auction cancelled... \n\n Coordinates: [${assetId}]` }, (err, data, response) => {
				if (err) winston.error(err);
			});
		});
	} catch(err) {
		winston.error(err);
	}
}

main();
