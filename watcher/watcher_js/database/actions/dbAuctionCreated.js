import { upsert, remove } from '../mongo/common';

export default async function dbAuctionCreated(landId, price, seller, txHash, blockNumber) {
	const result = await upsert('Auctions',{
		landId,
		price,
		seller,
		buyer: null,
		txHash,
		blockNumber,
		timestamp: new Date(),
		status: 'create'
	});

	return true;
}