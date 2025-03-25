import yaml
import requests
import json
import time

with open("./config.yaml", "r") as file:
    config_data = yaml.safe_load(file)

url_base = config_data['url_base']
interval = config_data['interval']
period_start = config_data['period_start']
period_end = config_data['period_end']
include_pre_post = config_data['include_pre_post']
events = config_data['events']

def printFile(stockInfo, symbol):
    f = open(f"{symbol}.json", "w")
    f.write(json.dumps(stockInfo, indent=4, sort_keys=True))
    f.close()

def formatDaily(response):
    resultData = response['chart']['result'][0]
    timeStamp = resultData['timestamp']

    pricingInfo = resultData['indicators']['quote'][0]
    priceHigh = pricingInfo['high']
    priceLow = pricingInfo['low']
    priceOpen = pricingInfo['open']
    priceClose = pricingInfo['close']
    
    dataDict = {}
    for i in range(len(timeStamp)):
        formatted_time = time.strftime('%Y-%m-%d', time.gmtime(timeStamp[i]))
        dataDict[formatted_time] = {
            "low": priceLow[i],
            "high": priceHigh[i],
            "open": priceOpen[i],
            "close": priceClose[i],
            "change": priceClose[i]-priceOpen[i],
        }
    return dataDict
    

def getStockData(symbol):
    headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36"
    }
    url = f"{url_base}/{symbol}?period1={period_start}&period2={period_end}&interval={interval}&includePrePost={include_pre_post}&events={events}&lang=en-CA&region=CA"
    # headers required for faking a browser since yahoo does not allow direct api connection
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        response = response.json()
        data = formatDaily(response)
        printFile(data, symbol)
    else:
        print(f"Failed to fetch data. HTTP Status Code: {response.status_code}")
        print("Response:", response.text)
    
getStockData('SPY')
getStockData('XQQ.TO')
getStockData('AAPL.NE')
