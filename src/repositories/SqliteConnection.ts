import Database from "better-sqlite3";
import { readFileSync } from "node:fs";

export class SqliteConnection {

    private database: Database.Database;

    constructor(databaseFilePath: string) {
        this.database = new Database(databaseFilePath);

        this.database.pragma("foreign_keys = ON");

        const schema = readFileSync("db/schema.sql", "utf8");
        this.database.exec(schema);
    } 

    public getDatabase(): Database.Database {
        return this.database;
    }

}