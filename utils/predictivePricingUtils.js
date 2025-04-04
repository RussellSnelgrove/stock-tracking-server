const { SimpleLinearRegression } = require('ml-regression');
const { PolynomialRegression } = require("ml-regression-polynomial");
const ARIMA = require('arima');
const tf = require('@tensorflow/tfjs-node');

const { logger } = require('./logger.js')

const getPredictionFormattedData = (data) => {
    const startDate = new Date(data[0].date);
    const x = data.map(d => (new Date(d.date) - startDate) / (1000 * 60 * 60 * 24));
    const y = data.map(d => d.close);
    return { x, y };
}

const getLinearRegressionEstimate = ({ x, y }) => {
    const regression = new SimpleLinearRegression(x, y);
    const nextX = x[x.length - 1] + 1;
    return regression.predict(nextX).toFixed(2);
}

const calculateMSE = (trueValues, predictedValues) => {
    const errors = trueValues.map((val, i) => Math.pow(val - predictedValues[i], 2));
    return errors.reduce((acc, err) => acc + err, 0) / trueValues.length;
};

const getInitialPolynomialRegression = ({ x, y, degree }) => {
    const regression = new PolynomialRegression(x, y, degree);
    return regression.predict(x);
};

// uses Mean Squared Error method
const getPolynomialRegressionDegree = (x, y, maxDegree = 5) => {
    let bestDegree = 1;
    let bestMSE = Infinity;

    for (let degree = 1; degree <= maxDegree; degree++) {
        const predictions = getInitialPolynomialRegression({ x, y, degree });

        const mse = calculateMSE(y, predictions);

        if (mse < bestMSE) {
            bestMSE = mse;
            bestDegree = degree;
        }
    }

    return bestDegree;
}

const getPolynomialRegression = ({ x, y }) => {
    // degree of 3 is chosen for...i dunno why
    const degree = getPolynomialRegressionDegree(x, y);
    const regression = new PolynomialRegression(x, y, degree);
    const nextX = x[x.length - 1] + 1;
    return regression.predict(nextX).toFixed(2);
}

// I dont currently see a way this is helpful since it looks like it just works using a sliding window of averages
const getMovingAverage = ({ x, y }) => {
    // if (data.length < period) return null;
    // return data.slice(-period).reduce((a, b) => a + b, 0) / period;
}

// AutoRegressive Integrated Moving Average
async function getArimaModelPrediction(data, numPredictions = 5) {
    let bestModel = null;
    let bestMSE = Infinity;
    let bestPredictions = [];
    const { y } = data;
    const pValues = [0, 1, 2, 3];
    const dValues = [0, 1, 2];
    const qValues = [0, 1, 2, 3];

    const modelPromises = [];

    for (let p of pValues) {
        for (let d of dValues) {
            for (let q of qValues) {
                modelPromises.push(
                    new Promise((resolve) => {
                        try {
                            const arima = new ARIMA({ p, d, q, verbose: false });
                            arima.train(y);

                            const predictions = arima.predict(numPredictions);

                            const actual = y.slice(-numPredictions);
                            const mse = actual.reduce((sum, actualValue, i) => {
                                return sum + Math.pow((predictions[i] || actualValue) - actualValue, 2);
                            }, 0) / actual.length;

                            resolve({ p, d, q, mse, predictions });
                        } catch (error) {
                            logger.error(`Error training ARIMA(${p},${d},${q}):`, error);
                            resolve(null);
                        }
                    })
                );
            }
        }
    }

    const results = await Promise.all(modelPromises);

    results.forEach((result) => {
        if (result && result.mse < bestMSE) {
            bestMSE = result.mse;
            bestModel = { p: result.p, d: result.d, q: result.q };
            bestPredictions = result.predictions;
        }
    });
    const arima = new ARIMA({ ...bestModel, verbose: false });
    arima.train(y);
    const prediction = arima.predict(1);
    return `${prediction[0][0].toFixed(2)}`;
}

const getTensorFlowNeuralNetworks = async ({ x, y }) => {
    const data = y;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const normalizedPrices = data.map(price => (price - min) / (max - min));

    const X = normalizedPrices.slice(0, -1);
    const Y = normalizedPrices.slice(1);

    const xs = tf.tensor2d(X, [X.length, 1]);
    const ys = tf.tensor2d(Y, [Y.length, 1]);

    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 10, activation: 'relu', inputShape: [1] }));
    model.add(tf.layers.dense({ units: 1 }));

    model.compile({
        optimizer: tf.train.adam(),
        loss: 'meanSquaredError'
    });

    await model.fit(xs, ys, { epochs: 100, verbose: 0 });

    const lastPrice = normalizedPrices[normalizedPrices.length - 1];
    const nextPriceTensor = model.predict(tf.tensor2d([lastPrice], [1, 1]));
    const nextPriceNormalized = nextPriceTensor.dataSync()[0];

    const nextPrice = nextPriceNormalized * (max - min) + min;

    return `${nextPrice.toFixed(2)}`;
}

const getStockPredictions = async (formattedData) => {
    logger.info('Started Predictions for next stock price');
    const predictionData = getPredictionFormattedData(formattedData);
    const linearRegressionPredictedValue = getLinearRegressionEstimate(predictionData);
    const polynomialRegressionValue = getPolynomialRegression(predictionData);
    const arimaValue = await getArimaModelPrediction(predictionData, Math.ceil(predictionData.x * 0.05));
    const neuralNetworkValue = await getTensorFlowNeuralNetworks(predictionData);
    logger.info('Finished Predictions for next stock price');
    return {
        linearRegression: linearRegressionPredictedValue,
        polynomialRegression: polynomialRegressionValue,
        arima: arimaValue,
        neuralNetwork: neuralNetworkValue,
    }
}


module.exports = { getStockPredictions };