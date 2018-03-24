import { upsert, remove } from '../mongo/common';
import moment from 'moment';

export default async function dbAuctionSuccess(landId, price, seller, buyer, txHash, blockNumber) {
	const result = await upsert('Auctions',{
		landId,
		price,
		seller,
		buyer,
		txHash,
		blockNumber,
		timestamp: moment.valueOf(),
		status: 'success'
	});

	return true;
}