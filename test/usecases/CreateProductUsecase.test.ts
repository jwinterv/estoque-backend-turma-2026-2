import { Product } from "../../src/entities/Product";
import { InfrastructureError } from "../../src/InfrastructureError";
import type { ProductRepositoryInterface } from "../../src/repositories/ProductRepository";
import { CreateProductUsecase } from "../../src/usecases/CreateProductUsecase";

describe("CreateProductUsecase tests", () => {

    test("should create a new product successfully", () => {

        class MockProductRepository implements ProductRepositoryInterface {
            findByBarcode(barcode: string): Product | InfrastructureError | null {
                return null;
            }
            create(product: Product): void | InfrastructureError {
                
            }
        }

        const barcode = "1234567890123";
        const name = "Coca Cola 2L";

        const mockProductRepository = new MockProductRepository();
        const createProductUsecase = new CreateProductUsecase(mockProductRepository );

        const result = createProductUsecase.execute(barcode, name);
        
        expect(result).toEqual({
            barcode: barcode,
            name: name,
            quantityInStock: 0
        });
    });

    test("should return an error if the product already exists", () => {

        class MockProductRepository implements ProductRepositoryInterface {
            findByBarcode(barcode: string): Product | InfrastructureError | null {
                return Product.rebuild(barcode, "Coca Cola 2L", 10);
            }
            create(product: Product): void | InfrastructureError {

            }
        }

        const barcode = "1234567890123";
        const name = "Coca Cola 2L";

        const mockProductRepository = new MockProductRepository();
        const createProductUsecase = new CreateProductUsecase(mockProductRepository );

        const result = createProductUsecase.execute(barcode, name);

        expect(result).toBeInstanceOf(Error);
        if (result instanceof Error) {
            expect(result.message).toBe("Product already exists");
        }
    });

    test("should return an InfrastructureError if the method findByBarcode of the ProductRepository throws an exception", () => {
        class MockProductRepository implements ProductRepositoryInterface {
            findByBarcode(barcode: string): Product | InfrastructureError | null {
                return new InfrastructureError("Database error");
            }
            create(product: Product): void | InfrastructureError {
                
            }
        }

        const barcode = "1234567890123";
        const name = "Coca Cola 2L";

        const mockProductRepository = new MockProductRepository();
        const createProductUsecase = new CreateProductUsecase(mockProductRepository );

        const result = createProductUsecase.execute(barcode, name);

        expect(result).toBeInstanceOf(InfrastructureError);
        if (result instanceof InfrastructureError) {
            expect(result.message).toBe("Database error");
        }
    });

    test("should return an error if the name is empty", () => {

        class MockProductRepository implements ProductRepositoryInterface {
            findByBarcode(barcode: string): Product | InfrastructureError | null {
                return null;
            }
            create(product: Product): void | InfrastructureError {
                
            }
        }

        const barcode = "1234567890123";
        const name = "";

        const mockProductRepository = new MockProductRepository();
        const createProductUsecase = new CreateProductUsecase(mockProductRepository );

        const result = createProductUsecase.execute(barcode, name);
        
        expect(result).toBeInstanceOf(Error);
        if (result instanceof Error) {
            expect(result.message).toBe("Name is required");
        }
    });
    
    test("should return an InfrastructureError if the method create of the ProductRepository throws an exception", () => {
        class MockProductRepository implements ProductRepositoryInterface {
            findByBarcode(barcode: string): Product | InfrastructureError | null {
                return null;
            }
            create(product: Product): void | InfrastructureError {
                return new InfrastructureError("Database error");
            }
        }

        const barcode = "1234567890123";
        const name = "Coca Cola 2L";

        const mockProductRepository = new MockProductRepository();
        const createProductUsecase = new CreateProductUsecase(mockProductRepository );

        const result = createProductUsecase.execute(barcode, name);

        expect(result).toBeInstanceOf(InfrastructureError);
        if (result instanceof InfrastructureError) {
            expect(result.message).toBe("Database error");
        }
    });    
});