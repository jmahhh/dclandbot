const Web3 = require('web3');
const winston = require('winston');
const BigNumber = require('bignumber.js');
const Twit = require('twit');
const rp = require('request-promise');
const axios = require('axios');
const SolidityCoder = require('web3/lib/solidity/coder.js');
const config = require('./config.json');

const path = require('path');
const lib = path.join(path.dirname(require.resolve('axios')),'lib/adapters/http');
const http = require(lib);

winston.level = 'debug';

const MANA_DECIMALS = 18;
// New version is a proxy (ZOS app 0x049F42a3D670D31Da129451dE81bFCAEE6D7f4A4)
const DCL_MARKET_ADDRESS = '0x8e5660b4Ab70168b5a6fEeA0e0315cb49c8Cd539';
// ABI of implementation @ 0x19a8ed4860007a66805782ed7e0bed4e44fc6717
const DCL_MARKET_ABI =
[{"constant":false,"inputs":[{"name":"_ownerCutPerMillion","type":"uint256"}],"name":"setOwnerCutPerMillion","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_legacyNFTAddress","type":"address"}],"name":"setLegacyNFTAddress","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"ERC721_Interface","outputs":[{"name":"","type":"bytes4"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"InterfaceId_ValidateFingerprint","outputs":[{"name":"","type":"bytes4"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"unpause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"acceptedToken","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"assetId","type":"uint256"}],"name":"cancelOrder","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"paused","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"nftAddress","type":"address"},{"name":"assetId","type":"uint256"}],"name":"cancelOrder","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"nftAddress","type":"address"},{"name":"assetId","type":"uint256"},{"name":"priceInWei","type":"uint256"},{"name":"expiresAt","type":"uint256"}],"name":"createOrder","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"initialize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"pause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"nftAddress","type":"address"},{"name":"assetId","type":"uint256"},{"name":"price","type":"uint256"},{"name":"fingerprint","type":"bytes"}],"name":"safeExecuteOrder","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"ownerCutPerMillion","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"assetId","type":"uint256"},{"name":"priceInWei","type":"uint256"},{"name":"expiresAt","type":"uint256"}],"name":"createOrder","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"publicationFeeInWei","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"nftAddress","type":"address"},{"name":"assetId","type":"uint256"},{"name":"price","type":"uint256"}],"name":"executeOrder","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_publicationFee","type":"uint256"}],"name":"setPublicationFee","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"contractName","type":"string"},{"name":"migrationId","type":"string"}],"name":"isMigrated","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_acceptedToken","type":"address"},{"name":"_legacyNFTAddress","type":"address"},{"name":"_owner","type":"address"}],"name":"initialize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_sender","type":"address"}],"name":"initialize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"legacyNFTAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"assetId","type":"uint256"}],"name":"auctionByAssetId","outputs":[{"name":"","type":"bytes32"},{"name":"","type":"address"},{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"uint256"}],"name":"orderByAssetId","outputs":[{"name":"id","type":"bytes32"},{"name":"seller","type":"address"},{"name":"nftAddress","type":"address"},{"name":"price","type":"uint256"},{"name":"expiresAt","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"assetId","type":"uint256"},{"name":"price","type":"uint256"}],"name":"executeOrder","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":false,"name":"id","type":"bytes32"},{"indexed":true,"name":"assetId","type":"uint256"},{"indexed":true,"name":"seller","type":"address"},{"indexed":false,"name":"nftAddress","type":"address"},{"indexed":false,"name":"priceInWei","type":"uint256"},{"indexed":false,"name":"expiresAt","type":"uint256"}],"name":"OrderCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"id","type":"bytes32"},{"indexed":true,"name":"assetId","type":"uint256"},{"indexed":true,"name":"seller","type":"address"},{"indexed":false,"name":"nftAddress","type":"address"},{"indexed":false,"name":"totalPrice","type":"uint256"},{"indexed":true,"name":"buyer","type":"address"}],"name":"OrderSuccessful","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"id","type":"bytes32"},{"indexed":true,"name":"assetId","type":"uint256"},{"indexed":true,"name":"seller","type":"address"},{"indexed":false,"name":"nftAddress","type":"address"}],"name":"OrderCancelled","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"publicationFee","type":"uint256"}],"name":"ChangedPublicationFee","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"ownerCutPerMillion","type":"uint256"}],"name":"ChangedOwnerCutPerMillion","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"legacyNFTAddress","type":"address"}],"name":"ChangeLegacyNFTAddress","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"id","type":"bytes32"},{"indexed":true,"name":"assetId","type":"uint256"},{"indexed":true,"name":"seller","type":"address"},{"indexed":false,"name":"priceInWei","type":"uint256"},{"indexed":false,"name":"expiresAt","type":"uint256"}],"name":"AuctionCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"id","type":"bytes32"},{"indexed":true,"name":"assetId","type":"uint256"},{"indexed":true,"name":"seller","type":"address"},{"indexed":false,"name":"totalPrice","type":"uint256"},{"indexed":true,"name":"winner","type":"address"}],"name":"AuctionSuccessful","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"id","type":"bytes32"},{"indexed":true,"name":"assetId","type":"uint256"},{"indexed":true,"name":"seller","type":"address"}],"name":"AuctionCancelled","type":"event"},{"anonymous":false,"inputs":[],"name":"Pause","type":"event"},{"anonymous":false,"inputs":[],"name":"Unpause","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"contractName","type":"string"},{"indexed":false,"name":"migrationId","type":"string"}],"name":"Migrated","type":"event"}]
// from https://github.com/decentraland/auction/blob/578219535f962232dc984f76adf79c77a15c9603/scripts/recovery.js
const max = new BigNumber('0x7fffffffffffffffffffffffffffffff');
const base = new BigNumber('0x100000000000000000000000000000000');

const decodeTokenId = (hexRepresentation) => {
  const yLength = hexRepresentation.length - 32;
	let x = new BigNumber('0x' + (hexRepresentation.slice(0, yLength) || '0'));
  let y = new BigNumber('0x' + hexRepresentation.slice(yLength, hexRepresentation.length));
  if (x.gt(max)) x = base.minus(x).times(-1);
  if (y.gt(max)) y = base.minus(y).times(-1);
  return [ x.toString(10), y.toString(10) ];
}

const web3 = new Web3(new Web3.providers.HttpProvider(config.serverURL));
const T = new Twit(config.twitter);

const getBase64 = (url) => {
  return axios
    .get(url, {
			adapter: http,
      responseType: 'arraybuffer'
    })
    .then(response => new Buffer(response.data, 'binary').toString('base64'));
}

const main = async () => {
	try {
		const dclMarketContract = web3.eth.contract(DCL_MARKET_ABI);
		const dclMarketInstance = dclMarketContract.at(DCL_MARKET_ADDRESS);

		const auctionSuccessfulEvent = dclMarketInstance.AuctionSuccessful({}, {}, async (err, eventData) => {
			if (err) {
				winston.error(err);
				return false;
			}
			console.log(eventData)
			const assetId = decodeTokenId(eventData.args.assetId.toString(16));
			const landPrice = eventData.args.totalPrice.toNumber() / 10 ** MANA_DECIMALS;
			let usdPrice = JSON.parse(await rp('https://api.coinmarketcap.com/v1/ticker/decentraland/?convert=USD'));
			usdPrice = Math.round(landPrice * parseFloat(usdPrice[0].price_usd) * 100) / 100;
			winston.verbose(eventData.transactionHash);
			const mplaceURL = `https://market.decentraland.org/${assetId[0]}/${assetId[1]}/detail`;
			const logString = `Auction successful! \n\n Coordinates: [${assetId}] \n Price: ${landPrice.toLocaleString()} MANA ($${usdPrice.toLocaleString()} USD) \n ${mplaceURL}`;
			winston.verbose(logString);
			if (!config.disableTwitter) {
				//
				// post a tweet with media
				//
				const imgURL = `https://api.decentraland.org/v1/parcels/${assetId[0]}/${assetId[1]}/map.png?height=500&width=500&size=10`;
				const b64content = await getBase64(imgURL);
				T.post('media/upload', { media_data: b64content }, function (err, data, response) {
				  const mediaIdStr = data.media_id_string
				  const altText = 'Decentraland Parcel Sale';
				  const meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }
					if (!err) {
						T.post('media/metadata/create', meta_params, function (err, data, response) {
					    if (!err) {
					      const params = { status: logString, media_ids: [mediaIdStr] }
					      T.post('statuses/update', params, function (err, data, response) {
									if (err) winston.error('statuses/update ', err);
					      })
					    } else {
								winston.error('media/metadata ', err);
							}
					  })
					} else {
						winston.error('media/upload ', err);
					}
				})
			}
		});
	} catch(err) {
		winston.error(err);
	}
}

main();
