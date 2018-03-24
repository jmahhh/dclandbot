import { findOne } from '../mongo/common';
import moment from 'moment';

export default async function dbGetLatestMigration() {
	const result = await findOne('Migration',{
		type: 'latest'
	});

	return result;
}