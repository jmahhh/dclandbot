import { upsert, remove } from '../mongo/common';

export default async function dbAuctionSuccess(landId, price, from, to, timestamp) {
	const result = await upsert('Auctions',{
		landId,
		price,
		from,
		to,
		timestamp
	});

	return true;
}