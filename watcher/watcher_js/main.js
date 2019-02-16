const Web3 = require('web3');
const BigNumber = require('bignumber.js');
const winston = require('winston');
const Twit = require('twit');
const rp = require('request-promise');
const SolidityCoder = require('web3/lib/solidity/coder.js');
const config = require('./config.json');

const utils = require('./utils.js');
const abis = require('./abis.js')

winston.level = 'debug';

const web3 = new Web3(new Web3.providers.HttpProvider(config.serverURL));
const T = new Twit(config.twitter);

const main = async () => {
	try {
		const dclMarketContract = web3.eth.contract(abis.MPLACE_ABI);
		const dclMarketInstance = dclMarketContract.at(utils.MPlACE_ADDR);

		const auctionSuccessfulEvent = dclMarketInstance.OrderSuccessful({}, {}, async (err, eventData) => {
			if (err) {
				winston.error(err);
				return false;
			}

			const landPrice = eventData.args.totalPrice.toNumber() / 10 ** utils.MANA_DEC;
			let usdPrice = JSON.parse(await rp(utils.CMC_API));
			usdPrice = Math.round(landPrice * parseFloat(usdPrice[0].price_usd) * 100) / 100;

			let mplaceURL, logString, imgURL;
			switch(eventData.args.nftAddress) {
				case utils.LAND_ADDR:
					const coords = utils.decodeTokenId(eventData.args.assetId.toString(16));
					mplaceURL = `https://market.decentraland.org/${coords[0]}/${coords[1]}/detail`;
					logString = `Auction successful! \n\nLAND Coordinates: [${coords[0]}, ${coords[1]}] \nPrice: ${landPrice.toLocaleString()} MANA ($${usdPrice.toLocaleString()} USD) \n${mplaceURL}`;
					imgURL = `https://api.decentraland.org/v1/parcels/${coords[0]}/${coords[1]}/map.png?height=500&width=500&size=10`;
					break;
				case utils.EST_ADDR:
					const tokenId = eventData.args.assetId.toNumber();
					// coords = utils.getEstateLandCoords(web3, tokenId);
					mplaceURL = `https://market.decentraland.org/estates/${tokenId}/detail`;
					logString = `Auction successful! \n\nEstate Id: ${tokenId} \nPrice: ${landPrice.toLocaleString()} MANA ($${usdPrice.toLocaleString()} USD) \n${mplaceURL}`;
					imgURL = `https://api.decentraland.org/v1/estates/${tokenId}/map.png?height=500&width=500&size=10`;
					break;
				default:
					throw new Error('unknown nftAddress');
			}
			winston.verbose(eventData.transactionHash);
			winston.verbose(logString);
			if (!config.disableTwitter) {
				//
				// post a tweet with media
				//
				const b64content = await utils.getBase64(imgURL);
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
