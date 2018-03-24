import { MongoClient } from 'mongodb';
import config from './config.json';
const url = `mongodb://${config.dbUser}:${config.dbPassword}@ds223559-a0.mlab.com:23559,ds223559-a1.mlab.com:23559/dclandbot?replicaSet=rs-ds223559`;
export const upsert = (dbName, dbFilter, dataToUpdate = {}) => {
	return new Promise((resolve, reject) => {
		console.log('dbName, dbFilter, dataToUpdate ', dbName, dbFilter, dataToUpdate);
		if (!Object.keys(dataToUpdate).length) {
			dataToUpdate = Object.assign({},dbFilter);
		}

		MongoClient.connect(url, (err, client) => {
			if (err) reject('MongoDB error ', err);
			client.db('dclandbot').collection(dbName).update(dbFilter, {$set: dataToUpdate}, {upsert: true}, (err2, result2) => {
				if (err2) reject('MongoDB upsert error', err2);
				resolve(true);
			});

		})
	}) 
}


export const remove = (dbName, dbFilter, options) => {
	return new Promise((resolve, reject) => {
		MongoClient.connect(url, (err, client) => {
			if (err) reject('MongoDB error ', err);
			client.db('dclandbot').collection(dbName).remove(dbFilter, (err2, result2) => {
				if (err2) reject('MongoDB remove error', err2);
				resolve(true);
			});
		})
	})
}

export const findOne = (dbName, dbFilter) => {
	return new Promise((resolve, reject) => {
		MongoClient.connect(url, (err, client) => {
			if (err) reject('MongoDB error ', err);
			client.db('dclandbot').collection(dbName).findOne(dbFilter, (err2, result2) => {
				if (err2) reject('MongoDB remove error', err2);
				resolve(result2);
			});
		})
	})
}