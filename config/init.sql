CREATE SCHEMA IF NOT EXISTS stocks_tracker;

CREATE TABLE IF NOT EXISTS stocks_tracker.stocks (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(18) NOT NULL,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_date_stored DATE,
    most_recent_date_stored DATE,
    market_price DECIMAL,
    stock_name VARCHAR(255),
    exchange VARCHAR(255),
    exchange_name VARCHAR(255),
    exchange_currency VARCHAR(255),
    CONSTRAINT unique_ticker UNIQUE (ticker)
);

CREATE TABLE IF NOT EXISTS stocks_tracker.prices (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(18) NOT NULL,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date DATE NOT NULL,
    open DECIMAL,
    high DECIMAL,
    low DECIMAL,
    close DECIMAL,
    CONSTRAINT stock_ticker FOREIGN KEY (ticker) REFERENCES stocks_tracker.stocks(ticker),
    CONSTRAINT unique_ticker_date UNIQUE (ticker, date)
);

CREATE UNIQUE INDEX idx_ticker_date ON stocks_tracker.prices (ticker, date);
