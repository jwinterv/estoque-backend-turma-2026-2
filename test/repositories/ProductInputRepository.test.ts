import { SqliteConnection } from '../../src/repositories/SqliteConnection';
import { ProductInputRepository } from '../../src/repositories/ProductInputRepository';
import { InfrastructureError } from "../../src/InfrastructureError";

describe ('ProductInputRepository', () => {
    test('should save the input and increase the product stock quantity', () => {
        const connection = new SqliteConnection(':memory:');
        const database = connection.getDatabase();
        const barcode = '123456';
        const orderDate = new Date("2026-01-10T00:00:00Z");
        const quantity = 10;
        const quantityToAdd = 5;

        try {
            database.prepare(
                "INSERT INTO products (barcode, name, quantity_in_stock) VALUES (?, ?, ?)"
            ).run(barcode, 'Test Product', quantity);

            const repository = new ProductInputRepository(connection);
            const creationResult = repository.create(barcode, quantityToAdd, orderDate);

            expect(creationResult).toBeUndefined();

            expect(database.prepare(
                "SELECT quantity_in_stock FROM products WHERE barcode = ?"
                ).get(barcode)).toMatchObject({ quantity_in_stock: quantity + quantityToAdd });

            expect(database.prepare(
                "SELECT barcode, quantity, order_date FROM product_input WHERE barcode = ?"
                ).get(barcode)).toMatchObject({ 
                    barcode: barcode, 
                    quantity: quantityToAdd, 
                    order_date: orderDate.toISOString() 
                });
        } finally {
            database.close();
        }
    });

    test("should rollback the stock update if saving the input fails", () => {
        const connection = new SqliteConnection(':memory:');
        const database = connection.getDatabase();
        const barcode = '123456';
        const quantity = 10;
        const quantityToAdd = 5;

        try {
            database.prepare(
                "INSERT INTO products (barcode, name, quantity_in_stock) VALUES (?, ?, ?)"
            ).run(barcode, 'Test Product', quantity);

            database.exec(`
                CREATE TRIGGER fail_insert_product_input
                BEFORE INSERT ON product_input
                BEGIN
                    SELECT RAISE(FAIL, 'Simulated failure');
                END;
            `);

            const repository = new ProductInputRepository(connection);
            const creationResult = repository.create(barcode, quantityToAdd, new Date("2026-01-10T00:00:00Z"));

            expect(creationResult).toBeInstanceOf(InfrastructureError);
            
            expect(database.prepare(
                "SELECT quantity_in_stock FROM products WHERE barcode = ?"
                ).get(barcode)).toMatchObject({ quantity_in_stock: quantity }); 
                
            expect(database.prepare(
                "SELECT COUNT(*) as count FROM product_input"
            ).get()).toMatchObject({ count: 0 });
        } finally {
            database.close();
        }
    });

    test ("should return an InfrastructureError if the product does not exist", () => {
        const connection = new SqliteConnection(':memory:');
        const database = connection.getDatabase();
        const barcode = '123456';
        const quantityToAdd = 5;

        try {
            const repository = new ProductInputRepository(connection);
            const creationResult = repository.create(barcode, quantityToAdd, new Date("2026-01-10T00:00:00Z"));

            expect(creationResult).toBeInstanceOf(InfrastructureError);

            expect(database.prepare(
                "SELECT COUNT(*) as count FROM product_input"
            ).get()).toMatchObject({ count: 0 });
        }finally {
            database.close();
        }
    });
});