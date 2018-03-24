import rp from 'request-promise';

const API_ENDPOINT = 'https://api.coinmarketcap.com/v1/ticker/decentraland/?convert=USD';

export default async function toUsdPrice(realPrice) {
	let usdPrice = JSON.parse(await rp(API_ENDPOINT));
	usdPrice = realPrice * parseFloat(usdPrice[0].price_usd);
	return usdPrice;
}