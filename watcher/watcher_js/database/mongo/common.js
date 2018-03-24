import { MongoClient } from 'mongodb';
import config from './config.json';
const url = `mongodb://${config.dbUser}:${config.dbPassword}GyxzuEG6A4dEbGMqgLUiQC7JTFf7w0@ds121999.mlab.com:21999/dclandbot`;
export const upsert = (dbName, dbFilter) => {
	return new Promise((resolve, reject) => {
		MongoClient.connect(url, (err, client) => {
			if (err) reject('MongoDB error ', err);
			client.db('dclandbot').collection(dbName).update(dbFilter, {$set: dbFilter}, {upsert: true}, (err2, result2) => {
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