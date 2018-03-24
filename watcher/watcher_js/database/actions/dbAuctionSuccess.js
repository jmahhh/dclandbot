import { upsert, remove } from '../mongo/common';

export default async function dbAuctionSuccess(landId, price, seller, buyer, txHash, blockNumber) {
	const result = await upsert('Auctions',{
		landId,
		price,
		seller,
		buyer,
		txHash,
		blockNumber,
		timestamp: new Date(),
		status: 'success'
	});

	return true;
}