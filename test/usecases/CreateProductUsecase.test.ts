import { Product } from "../../src/entities/Product";
import type { InfrastructureError } from "../../src/InfrastructureError";
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
});