import { SqliteConnection } from './repositories/SqliteConnection';
import { ProductRepository } from './repositories/ProductRepository';
import { CreateProductUsecase } from './usecases/CreateProductUsecase';
import readlineSync from "readline-sync";
import { InfrastructureError } from './InfrastructureError';

const sqliteConnection = new SqliteConnection("db/estoque.sqlite");
const productRepository = new ProductRepository(sqliteConnection);
const createProductUsecase = new CreateProductUsecase(productRepository);

const barcode = readlineSync.question("Digite o código de barras do produto: ");
const name = readlineSync.question("Digite o nome do produto: ");

const result = createProductUsecase.execute(barcode, name);

if (result instanceof InfrastructureError) {
  console.error("Erro na infraestrutura:", result.message);
} else if (result instanceof Error) {
  console.error("Erro de regra de negócio: ", result.message);
} else {
    console.log("Produto criado com sucesso:");
    console.log("Código de barras: ", result.barcode);
    console.log("Nome: ", result.name);
    console.log("Quantidade em estoque: ", result.quantityInStock);
}