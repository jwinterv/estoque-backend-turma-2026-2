create table if not exists products (
    barcode varchar(255) primary key,
    name varchar(255) not null,
    quantity_in_stock integer not null
);

create table if not exists product_input(
    input_id integer primary key,
    barcode varchar(255) not null references products(barcode),
    quantity integer not null,
    input_date timestamp not null default current_timestamp,
    order_date varchar(255) not null
);