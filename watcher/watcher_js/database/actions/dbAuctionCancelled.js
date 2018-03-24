import { upsert, remove } from '../mongo/common';

export default async function dbAuctionCancelled(landId, price, seller, txHash, blockNumber) {
	const result = await upsert('Auctions',{
		landId,
		price,
		seller,
		buyer: null,
		txHash,
		blockNumber,
		timestamp: new Date(),
		status: 'cancel'
	});

	return true;
}