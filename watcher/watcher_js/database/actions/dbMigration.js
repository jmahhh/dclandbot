import { upsert } from '../mongo/common';

export default async function dbMigration(blockNumber) {
	const result = await upsert('Migration',{
		type: 'latest'
	}, {
		blockNumber,
		timestamp: new Date(),
	});

	return true;
}