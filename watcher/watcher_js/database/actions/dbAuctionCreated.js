import { upsert, remove } from '../mongo/common';
import moment from 'moment';

export default async function dbAuctionCreated(landId, price, seller, txHash, blockNumber, timestamp) {
	const result = await upsert('Auctions',{
		landId,
		price,
		seller,
		buyer: null,
		txHash,
		blockNumber,
		timestamp: moment.valueOf(),
		status: 'create'
	});

	return true;
}