CREATE SCHEMA IF NOT EXISTS stocks_tracker;

CREATE TABLE IF NOT EXISTS stocks_tracker.prices (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(10) NOT NULL,
    date DATE NOT NULL,
    open NUMERIC,
    high NUMERIC,
    low NUMERIC,
    close NUMERIC
);

CREATE TABLE IF NOT EXISTS stocks_tracker.stocks (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(10) NOT NULL,
    created_date DATE NOT NULL,
    last_updated_date DATE NOT NULL,
    exchange VARCHAR(255),
    exchange_currency VARCHAR(255),
    stock_predictions JSONB
);