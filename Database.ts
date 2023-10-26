// Import external filesystem module
import { promises as fs } from 'fs';
import fsSync from 'fs';

// Import external object management library
import _, { Many } from 'lodash';

// Import external cryptography library
import crypto from 'crypto';

class Database {

    // The path to the database file
    filePath: string;


    constructor(filePath: string) {
        this.filePath = filePath;

        this.fileExists();
    }

    // Internal method: Test that the file exists - if not, create it
    async fileExists(): Promise<void> {
        let pathFile = this.filePath;
        fsSync.access(this.filePath, fsSync.constants.R_OK, function (error) {
            if (error) {
                fs.writeFile(pathFile, '{}');
            }
        });
    }

    // Internal method: Load the database from the file and convert to JS object type
    async loadDB(): Promise<any> {
        const data: Buffer = await fs.readFile(this.filePath);
        return JSON.parse(data.toString());
    }

    // Internal method: Convert a string path (eg. '/posts/123/' to an array eg. ['posts', '123'])
    pathToArray(path: string): string[] {
        if (path) {
            const arr = path.split('/');
        
            return arr.filter(n => n);
        }  else return [''];
    }

    // Internal method: Converts an array path back into a string
    arrayToPath(array: string[]): string {
        return _.join(array, '/');
    }

    // Public method: takes a string path and returns the data stored at that location
    async get(path: string): Promise<any> {
        const db = await this.loadDB();

        let data: object;
        if (path) {
            data = _.get(db, this.pathToArray(path));
        } else {
            data = db;
        }

        return data;
    }

    // Public method; takes a string path and data, and sets the value of the path to the data provided
    async set(path: string, value: any) {
        const db = await this.loadDB();

        _.set(db, this.pathToArray(path), value);
        await fs.writeFile(this.filePath, JSON.stringify(db));
        return true;
    }

    // Public method: takes a path and an amount, and increments the value at that path by the given amount
    async increase(path: string, amount = 1) {
        const db = await this.loadDB();
        const parsed = this.pathToArray(path);
        let data: number = _.get(db, parsed);
        data += amount;
        _.set(db, parsed, data);
        return await fs.writeFile(this.filePath, JSON.stringify(db));
    }

    // Public method:
    // Takes a path, data and options
    // Adds the data to the end of the list at the given path, with a new random id
    // Returns the path of the pushed item, and its id
    async push(path: string, value: any, { length=8, includeID=false }): Promise<{ id: string, path: string, result: boolean }> {
        let key: string = '';
        let exists: boolean = true;
        let fullPath: string = path;

        while (exists) {
            key = crypto.randomBytes(length).toString('hex');

            const pathArray = this.pathToArray(path);
            pathArray.push(key);
            fullPath = this.arrayToPath(pathArray);

            const check = await this.get(fullPath);
            if (!check) break;
        }

        let result = false;
        if (value) {

            if (includeID) {
                result = await this.set(fullPath, {...value, id: key});
            } else {
                result = await this.set(fullPath, value);
            }

        }

        return ({ path: fullPath, id: key, result });
    }

    // Public method: takes a path and sort parameters, and returns a sorted array of the data at the given location
    async orderedList(path: string, sortBy: string, sortOrder: Many<boolean | 'asc' | 'desc'> = 'asc'): Promise<any[]> {
        let list: object = await this.get(path);

        const sorted: object[] = _.orderBy(list, (o: any) => {
            return o[sortBy];
        }, sortOrder);
        return sorted;
    }

    // Public/internal method: used to simply get the server time
    timestamp(): number {
        return Date.now();
    }

    // Public method: takes a path, and deletes all data at that path
    async remove(path: string): Promise<void> {
        const db = await this.loadDB();
        const parsed = this.pathToArray(path);
        _.unset(db, parsed);
        return await fs.writeFile(this.filePath, JSON.stringify(db));
    }

    // Public method: takes a path, and an object value, and updates the object at that path with any changed properties in the given object
    async update(path: string, value: any): Promise<object> {
        const db = await this.loadDB();
        const parsed = this.pathToArray(path);

        const oldData = await this.get(path);

        let newData: object;
        if (oldData) {
            newData = Object.assign(oldData, value);
        } else {
            newData = value;
        }

        _.set(db, parsed, newData);

        await fs.writeFile(this.filePath, JSON.stringify(db));
        return newData;
    }
}

export default Database;