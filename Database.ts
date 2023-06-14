import { promises as fs } from 'fs';
import fsSync from 'fs';
import _, { Many } from 'lodash';
import crypto from 'crypto';

class Database {

    filePath: string;


    constructor(filePath: string) {
        this.filePath = filePath;

        this.fileExists();
    }

    async fileExists(): Promise<void> {
        let pathFile = this.filePath;
        fsSync.access(this.filePath, fsSync.constants.R_OK, function (error) {
            if (error) {
                fs.writeFile(pathFile, '{}');
            }
        });
    }

    async loadDB(): Promise<any> {
        const data: Buffer = await fs.readFile(this.filePath);
        return JSON.parse(data.toString());
    }

    pathToArray(path: string): string[] {
        if (path) {
            const arr = path.split('/');
        
            return arr.filter(n => n);
        }  else return [''];
    }

    arrayToPath(array: string[]): string {
        return _.join(array, '/');
    }

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

    async set(path: string, value: any) {
        const db = await this.loadDB();

        _.set(db, this.pathToArray(path), value);
        await fs.writeFile(this.filePath, JSON.stringify(db));
        return true;
    }

    async increase(path: string, amount = 1) {
        const db = await this.loadDB();
        const parsed = this.pathToArray(path);
        let data: number = _.get(db, parsed);
        data += amount;
        _.set(db, parsed, data);
        return await fs.writeFile(this.filePath, JSON.stringify(db));
    }

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

    async orderedList(path: string, sortBy: string, sortOrder: Many<boolean | 'asc' | 'desc'> = 'asc'): Promise<any[]> {
        let list: object = await this.get(path);

        const sorted: object[] = _.orderBy(list, (o: any) => {
            return o[sortBy];
        }, sortOrder);
        return sorted;
    }

    timestamp(): number {
        return Date.now();
    }

    async remove(path: string): Promise<void> {
        const db = await this.loadDB();
        const parsed = this.pathToArray(path);
        _.unset(db, parsed);
        return await fs.writeFile(this.filePath, JSON.stringify(db));
    }

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