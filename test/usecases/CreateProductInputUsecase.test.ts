import { Product } from "../../src/entities/Product";
import { InfrastructureError } from "../../src/InfrastructureError";
import type { ProductInputRepositoryInterface } from "../../src/repositories/ProductInputRepository";
import type { ProductRepositoryInterface } from "../../src/repositories/ProductRepository";
import { CreateProductInputUsecase } from "../../src/usecases/CreateProductInputUsecase";

describe("CreateProductInputUsecase tests", () => {

    test("should create a new product input successfully", () => {
        const barcode = "1234567890123";
        const dateOrder = new Date("2026-10-01T10:00:00.000Z");
        const dateInput = new Date("2026-10-05T10:00:00.000Z");
        const quantity = 15;

        let createdBarcode = "";
        let createdQuantity = 0;
        let createdOrderDate: Date | null = null;

        class MockProductRepository implements ProductRepositoryInterface {
            findByBarcode(barcode: string): Product | InfrastructureError | null {
                return Product.rebuild(barcode, "Coca Cola 2L", 10);
            }
            create(product: Product): void | InfrastructureError {}
        }

        class MockProductInputRepository implements ProductInputRepositoryInterface {
            create(barcode: string, quantity: number, orderDate: Date): void | InfrastructureError {
                createdBarcode = barcode;
                createdQuantity = quantity;
                createdOrderDate = orderDate;
            }
        }

        const mockProductRepository = new MockProductRepository();
        const mockProductInputRepository = new MockProductInputRepository();
        const usecase = new CreateProductInputUsecase(mockProductRepository, mockProductInputRepository);

        const result = usecase.execute(barcode, dateOrder, dateInput, quantity);

        expect(createdBarcode).toBe(barcode);
        expect(createdQuantity).toBe(quantity);
        expect(createdOrderDate).toEqual(dateOrder);

        expect(result).toEqual({
            barcode: barcode,
            dateOrder: dateOrder,
            dateInput: dateInput,
            quantity: quantity,
            quantityInStock: 25
        });
    });

    test("should return an error if the product does not exist", () => {
        class MockProductRepository implements ProductRepositoryInterface {
            findByBarcode(barcode: string): Product | InfrastructureError | null {
                return null;
            }
            create(product: Product): void | InfrastructureError {}
        }

        class MockProductInputRepository implements ProductInputRepositoryInterface {
            create(barcode: string, quantity: number, orderDate: Date): void | InfrastructureError {}
        }

        const usecase = new CreateProductInputUsecase(
            new MockProductRepository(),
            new MockProductInputRepository()
        );

        const result = usecase.execute(
            "1234567890123",
            new Date("2026-10-01T10:00:00.000Z"),
            new Date("2026-10-05T10:00:00.000Z"),
            15
        );

        expect(result).toBeInstanceOf(Error);
        if (result instanceof Error) {
            expect(result.message).toBe("Product not found");
        }
    });

    test("should return an InfrastructureError if findByBarcode fails", () => {
        class MockProductRepository implements ProductRepositoryInterface {
            findByBarcode(barcode: string): Product | InfrastructureError | null {
                return new InfrastructureError("Database error");
            }
            create(product: Product): void | InfrastructureError {}
        }

        class MockProductInputRepository implements ProductInputRepositoryInterface {
            create(barcode: string, quantity: number, orderDate: Date): void | InfrastructureError {}
        }

        const usecase = new CreateProductInputUsecase(
            new MockProductRepository(),
            new MockProductInputRepository()
        );

        const result = usecase.execute(
            "1234567890123",
            new Date("2026-10-01T10:00:00.000Z"),
            new Date("2026-10-05T10:00:00.000Z"),
            15
        );

        expect(result).toBeInstanceOf(InfrastructureError);
        if (result instanceof InfrastructureError) {
            expect(result.message).toBe("Database error");
        }
    });

    test("should return an error if ProductInput creation fails (e.g. invalid quantity or dates)", () => {
        class MockProductRepository implements ProductRepositoryInterface {
            findByBarcode(barcode: string): Product | InfrastructureError | null {
                return Product.rebuild(barcode, "Coca Cola 2L", 10);
            }
            create(product: Product): void | InfrastructureError {}
        }

        class MockProductInputRepository implements ProductInputRepositoryInterface {
            create(barcode: string, quantity: number, orderDate: Date): void | InfrastructureError {}
        }

        const usecase = new CreateProductInputUsecase(
            new MockProductRepository(),
            new MockProductInputRepository()
        );

        const result = usecase.execute(
            "1234567890123",
            new Date("2026-10-05T10:00:00.000Z"),
            new Date("2026-10-01T10:00:00.000Z"), // dateInput anterior à dateOrder
            15
        );

        expect(result).toBeInstanceOf(Error);
        if (result instanceof Error) {
            expect(result.message).toBe("Input date cannot be before order date");
        }
    });

    test("should return an InfrastructureError if ProductInputRepository.create fails", () => {
        class MockProductRepository implements ProductRepositoryInterface {
            findByBarcode(barcode: string): Product | InfrastructureError | null {
                return Product.rebuild(barcode, "Coca Cola 2L", 10);
            }
            create(product: Product): void | InfrastructureError {}
        }

        class MockProductInputRepository implements ProductInputRepositoryInterface {
            create(barcode: string, quantity: number, orderDate: Date): void | InfrastructureError {
                return new InfrastructureError("Database error");
            }
        }

        const usecase = new CreateProductInputUsecase(
            new MockProductRepository(),
            new MockProductInputRepository()
        );

        const result = usecase.execute(
            "1234567890123",
            new Date("2026-10-01T10:00:00.000Z"),
            new Date("2026-10-05T10:00:00.000Z"),
            15
        );

        expect(result).toBeInstanceOf(InfrastructureError);
        if (result instanceof InfrastructureError) {
            expect(result.message).toBe("Database error");
        }
    });

});