import { upsert, remove } from '../mongo/common';
import moment from 'moment';

export default async function dbAuctionCancelled(landId, price, seller, txHash, blockNumber) {
	const result = await upsert('Auctions',{
		landId,
		price,
		seller,
		buyer: null,
		txHash,
		blockNumber,
		timestamp: moment.valueOf(),
		status: 'cancel'
	});

	return true;
}