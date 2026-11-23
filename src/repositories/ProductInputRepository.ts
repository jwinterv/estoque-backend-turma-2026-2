import { InfrastructureError } from '../InfrastructureError';
import Database from "better-sqlite3";
import type { SqliteConnection } from './SqliteConnection';

export interface ProductInputRepositoryInterface {
    create(barcode: string, quantity: number, orderDate: Date): void | InfrastructureError;
}

export class ProductInputRepository implements ProductInputRepositoryInterface {

    private connection: SqliteConnection;
    
    constructor(connection: SqliteConnection) {
        this.connection = connection;
    }

    public create(barcode: string, quantity: number, orderDate: Date): void | InfrastructureError {
        try {
            const database = this.connection.getDatabase();
                const transaction = database.transaction(() => {
                    const updateProduct = database.prepare(`
                        UPDATE products
                        SET quantity_in_stock = quantity_in_stock + ?
                        WHERE barcode = ?
                    `).run(quantity, barcode);
                
                    if (updateProduct.changes === 0) {
                        throw new Error("Product not found");
                    }

                    database.prepare(`
                        INSERT INTO product_input (barcode, quantity, order_date)
                        VALUES (?, ?, ?)
                    `).run(barcode, quantity, orderDate.toISOString());
                });
                
                transaction();

        } catch (error) {
            return new InfrastructureError("Database error");
        }
    }

}