import { Product } from "../entities/Product";
import { InfrastructureError } from "../InfrastructureError";
import type { ProductRepository, ProductRepositoryInterface } from "../repositories/ProductRepository";

export interface CreateProductUsecaseOutput {
    barcode: string;
    name: string;
    quantityInStock: number;
}

export class CreateProductUsecase {

    private productRepository: ProductRepositoryInterface;

    constructor(productRepository: ProductRepositoryInterface) {
        this.productRepository = productRepository;
    }

    public execute(barcode: string, name: string): CreateProductUsecaseOutput | Error {
        const product = this.productRepository.findByBarcode(barcode);
        if (product instanceof Product) {
            return new Error("Product already exists");
        }
        if (product instanceof InfrastructureError) {
            return new InfrastructureError("Database error");
        }

        const newProduct = Product.create(barcode, name);

        if (newProduct instanceof Error) {
            return new Error(newProduct.message);
        }

        const result = this.productRepository.create(newProduct);
        if (result instanceof InfrastructureError) {
            return new Error("Database error");
        }
        
        return {
            barcode: newProduct.getBarcode(),
            name: newProduct.getName(),
            quantityInStock: newProduct.getQuantityInStock()
        };

    }

}