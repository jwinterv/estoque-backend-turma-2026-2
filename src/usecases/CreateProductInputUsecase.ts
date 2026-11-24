import { Product } from "../entities/Product";
import { ProductInput } from "../entities/ProductInput";
import { InfrastructureError } from "../InfrastructureError";
import type { ProductInputRepositoryInterface } from "../repositories/ProductInputRepository";
import type { ProductRepositoryInterface } from "../repositories/ProductRepository";

export interface CreateProductInputUsecaseOutput {
    barcode: string;
    dateOrder: Date;
    dateInput: Date;
    quantity: number;
    quantityInStock: number;
}

export class CreateProductInputUsecase {

    private productRepository: ProductRepositoryInterface;
    private productInputRepository: ProductInputRepositoryInterface;

    constructor(
        productRepository: ProductRepositoryInterface,
        productInputRepository: ProductInputRepositoryInterface
    ) {
        this.productRepository = productRepository;
        this.productInputRepository = productInputRepository;
    }

    public execute(
        barcode: string,
        dateOrder: Date,
        quantity: number
    ): CreateProductInputUsecaseOutput | Error {
        const product = this.productRepository.findByBarcode(barcode);

        if (product instanceof InfrastructureError) {
            return new InfrastructureError(product.message);
        }

        if (!(product instanceof Product)) {
            return new Error("Product not found");
        }

        const dateInput = new Date();
        const productInput = ProductInput.create(product, dateOrder, dateInput, quantity);

        if (productInput instanceof Error) {
            return new Error(productInput.message);
        }

        const result = this.productInputRepository.create(
            productInput.getProduct().getBarcode(),
            productInput.getQuantity(),
            productInput.getDateOrder()
        );

        if (result instanceof InfrastructureError) {
            return new InfrastructureError(result.message);
        }

        return {
            barcode: productInput.getProduct().getBarcode(),
            dateOrder: productInput.getDateOrder(),
            dateInput: productInput.getDateInput(),
            quantity: productInput.getQuantity(),
            quantityInStock: product.getQuantityInStock() + productInput.getQuantity()
        };
    }

}