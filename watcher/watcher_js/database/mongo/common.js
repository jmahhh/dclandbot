
export const upsert = (dbName, dbFilter, dataToUpdate = {}) => {
	return new Promise((resolve, reject) => {
		if (!globalVar.mongodbClient) reject('MongoDB error: mongodbClient not instantiated');
		console.log('dbName, dbFilter, dataToUpdate ', dbName, dbFilter, dataToUpdate);
		if (!Object.keys(dataToUpdate).length) dataToUpdate = Object.assign({}, dbFilter);
		globalVar.mongodbClient.db('dclandbot').collection(dbName).update(dbFilter, {$set: dataToUpdate}, {upsert: true}, (err2, result2) => {
			if (err2) reject(err2);
			resolve(true);
		});
	}) 
}


export const remove = (dbName, dbFilter, options) => {
	return new Promise((resolve, reject) => {
		if (!globalVar.mongodbClient) reject('MongoDB error: mongodbClient not instantiated');
		globalVar.mongodbClient.db('dclandbot').collection(dbName).remove(dbFilter, (err2, result2) => {
			if (err2) reject('MongoDB remove error', err2);
			resolve(true);
		});
	})
}

export const findOne = (dbName, dbFilter) => {
	return new Promise((resolve, reject) => {
		if (!globalVar.mongodbClient) reject('MongoDB error: mongodbClient not instantiated');
		globalVar.mongodbClient.db('dclandbot').collection(dbName).findOne(dbFilter, (err2, result2) => {
			if (err2) reject('MongoDB remove error', err2);
			resolve(result2);
		});
	})
}