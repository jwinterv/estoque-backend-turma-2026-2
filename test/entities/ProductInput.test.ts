import { Product } from '../../src/entities/Product';
import { ProductInput } from '../../src/entities/ProductInput';

describe('ProductInput entity', () => {
    const product = Product.rebuild('1234567890123', 'Coca-Cola 2L', 0);

    test('should create a product input with valid properties', () => {

        const dateOrder = new Date(2026, 0, 10);
        const dateInput = new Date(2026, 0, 15);
        const productInput = ProductInput.create(product, dateOrder, dateInput, 20);

        expect(productInput).toBeInstanceOf(ProductInput);
        if (productInput instanceof ProductInput) {
            expect(productInput.getProduct()).toBe(product);
            expect(productInput.getDateOrder()).toEqual(dateOrder);
            expect(productInput.getDateInput()).toEqual(dateInput);
            expect(productInput.getQuantity()).toBe(20);
        }
    });

    test('should calculate lead time in days', () => {

        const productInput = ProductInput.create(
            product,
            new Date('2026-01-10T23:59:00-03:00'),
            new Date('2026-01-15T01:00:00-03:00'),
            20,
        );

        expect(productInput).toBeInstanceOf(ProductInput);
        if (productInput instanceof ProductInput) {
            expect(productInput.leadTime()).toBe(5);
        }
    });

    test.each([
        ['quantity must be positive', 0, 'Quantity must be a positive integer'],
        ['quantity must be an integer', 1.5, 'Quantity must be a positive integer'],
    ])('should reject invalid %s', (_description, quantity, message) => {
 
        const productInput = ProductInput.create(
            product,
            new Date(2026, 0, 10),
            new Date(2026, 0, 15),
            quantity,
        );

        expect(productInput).toBeInstanceOf(Error);
        if (productInput instanceof Error) {
            expect(productInput.message).toBe(message);
        }
    });

    test('should reject an input date before the order date', () => {

        const productInput = ProductInput.create(
            product,
            new Date(2026, 0, 15),
            new Date(2026, 0, 10),
            20,
        );

        expect(productInput).toBeInstanceOf(Error);
        if (productInput instanceof Error) {
            expect(productInput.message).toBe('Input date cannot be before order date');
        }
    });

    test('should reject a missing product', () => {
        const result = ProductInput.create(null as unknown as Product, new Date(), new Date(), 1);
        expect(result).toEqual(new Error('Product is invalid'));
    });


    test.each(['invalid-date', new Date('invalid-date')])('should reject invalid order date %s', (dateOrder) => {
        if (!(product instanceof Product)) throw new Error('Invalid test product');
        expect(ProductInput.create(product, dateOrder as unknown as Date, new Date(), 1))
            .toEqual(new Error('Order date is invalid'));
    });

    test.each(['invalid-date', new Date('invalid-date')])('should reject invalid input date %s', (dateInput) => {
        if (!(product instanceof Product)) throw new Error('Invalid test product');
        expect(ProductInput.create(product, new Date(), dateInput as unknown as Date, 1))
            .toEqual(new Error('Input date is invalid'));
    });

    test.each([-1, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])('should reject invalid quantity %s', (quantity) => {
        if (!(product instanceof Product)) throw new Error('Invalid test product');
        expect(ProductInput.create(product, new Date(), new Date(), quantity))
            .toEqual(new Error('Quantity must be a positive integer'));
    });

    test('should protect dates from changes to arguments and returned values', () => {
        if (!(product instanceof Product)) throw new Error('Invalid test product');
        const order = new Date('2026-01-10T00:00:00Z');
        const input = new Date('2026-01-15T00:00:00Z');
        const result = ProductInput.create(product, order, input, 1);
        expect(result).toBeInstanceOf(ProductInput);
        if (!(result instanceof ProductInput)) return;

        order.setUTCFullYear(2000);
        input.setUTCFullYear(2000);
        result.getDateOrder().setUTCFullYear(2001);
        result.getDateInput().setUTCFullYear(2001);

        expect(result.getDateOrder().toISOString()).toBe('2026-01-10T00:00:00.000Z');
        expect(result.getDateInput().toISOString()).toBe('2026-01-15T00:00:00.000Z');
        expect(result.leadTime()).toBe(5);
    });
});
