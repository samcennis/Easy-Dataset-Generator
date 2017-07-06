import numpy as np
import pandas as pd
import datetime
import radar 
import random

def generateDataset(input):
    
    #Dimensions
    num_orders = int(input['numOrders'])
    typ_order_lines_val = int(input['typOrderLinesVal'])
    typ_order_lines_range = int(input['typOrderLinesRange'])
    start_date = input['startDate']
    end_date = input['endDate']
    product_dim = input['productDim']
    store_dim = input['storeDim']
    promotion_dim = input['promotionDim']
    time_performance = input['timePerf']
    
    #Probability lookup tables
    product_probs = generateProbsFromPerformance(product_dim)
    store_probs = generateProbsFromPerformance(store_dim)
    promotion_probs = generateProbsFromPerformance(promotion_dim)
    
    #Quarter probability
    date_probs = generateProbsFromeTimePerformance(time_performance)
    
    #print dict(product_probs)[1002] how to lookup probabilities
    
    #Create Sales Fact Table
    #d = pd.DataFrame({},columns=["DateKey","ProductKey","StoreKey","PromotionKey","Sales Units", "Sales Dollars"])
    
    sales_facts = []
    #product_opts = range(1001, 1001 + len(product_dim)) #product keys range
    #store_opts = range(4001, 4001 + len(store_dim)) #store keys range
    #promotion_opts = [0] + range(3001, 3001 + len(promotion_dim) - 1) #promotion keys range
    
    order_num_counter = 800001 #to generate a unique order number for each order
    
    for n in range(num_orders):
        order_num = order_num_counter
        order_num_counter = order_num_counter + 1
        
        #Booster/inhibitor to be set appropriately based on desired patterns
        #1 is normal, >1 is a sales boost, <1 is a sales inhibitor
        num_lines_per_order_booster = 1
        sales_units_booster = 1
        #^^^replace above with # of lines per order, range lines per order
        # sales units booster replaced by product_probs and typical quanity and range ordered
        
        #DATE GENERATION
        date_key = 0
        
        quarter_choice = np.random.choice(list(x[0] for x in date_probs),p=list(x[1] for x in date_probs))
        date_key = generateDateKeyFromQuarter(quarter_choice)
        
        #STORE GENERATION
        store_key = np.random.choice(list(x[0] for x in store_probs),p=list(x[1] for x in store_probs))
        
        num_lines_in_order = generateSalesNumber(typical_value=typ_order_lines_val, typical_range=typ_order_lines_range, performance_multiplier=1.0)
        
        #print num_lines_in_order
        
        product_key = 0
        for x in range( num_lines_in_order ):
            product_key = np.random.choice(list(x[0] for x in product_probs), p=list(x[1] for x in product_probs))

            this_product_row = next((x for x in product_dim if int(x['key']) == product_key), None)
            
            sales_units = generateSalesNumber(typical_value=int(this_product_row['quantity']), typical_range=int(this_product_row['range']), performance_multiplier=1.0);
            
            sales_dollars = round(sales_units * float(this_product_row['price']),2)
            sales_facts.append({"DateKey":date_key,"ProductKey":product_key,"StoreKey":store_key,"PromotionKey":"Promo","Order Number": order_num, "Sales Units":sales_units,"Sales Dollars":sales_dollars})
            
        #Todo: flatten any duplicate products in an order into one product.

    return sales_facts


#Function to help generate a distribution of sales numbers, 
#Optionally taking a multiplier to increase likelihood of a higher number
"""def generateSalesNumbers(n, typical_range=1, typical_value=1, multiplier=1):
    list = []
    for x in range(n):
        num = int(round(abs(np.random.normal(1,1.5))*multiplier))
        if num is 0:
            num = 1
        #print num
        list += [num]
    if len(list) == 0:
        return -1
    elif len(list) is 1:
        return list[0]
    else:
        return list"""
    
    
#Performance multiplier between 0.0 and 2.0 to effect probability within the distribution
# If perf multiplier is 2.0, typical value increases to maximum of range and range goes to 0
# If perf multiplier is 1.0, no change
# If perf multiplier is 0.0, typical value decreases to minimum of range and range goes to 0
# This function is pretty much good to go. Can use it for sales numbers as well.
def generateSalesNumber(typical_value=3, typical_range=3, performance_multiplier=1.0):
    new_typical_value = typical_value
    new_typical_range = typical_range
    
    m = performance_multiplier - 1.0
    new_typical_value = typical_value + 2 * (typical_range/2.0) * m
    
    #Contain the typical value between range of possible values
    if new_typical_value > typical_value + typical_range:
        new_typical_value = typical_value + typical_range
        
    if new_typical_value < typical_value - typical_range:
        new_typical_value = typical_value - typical_range
        
    new_typical_range = typical_range - typical_range * abs(m)
    
    if new_typical_range <= 0.0:
        new_typical_range = 0.01
        
    num = int(round(np.random.normal(new_typical_value, 1.0 * new_typical_range / 2)))
    if num < 0:
        num = 0
        
    return num
    
    
#Takes a dimension table with rows that includes a "key" value and a performance value between 0-100
#Returns a list of tuples with the key and the relative probability it should show up in an order
def generateProbsFromPerformance(dimension_table):
    performance_sum = sum(int(r['performance']) for r in dimension_table)
    
    prob_list = []
    
    for r in dimension_table:
        prob = 1.0 * int(r['performance']) / performance_sum
        prob_list.append((int(r['key']),prob))
        
    return prob_list

def generateProbsFromeTimePerformance(time_performance):
    performance_sum = sum(int(r['Q1'])+int(r['Q2'])+int(r['Q3'])+int(r['Q4']) for r in time_performance)
    
    prob_list = []
    
    for r in time_performance:
        prob_list.append((r['year'] + "_" + 'Q1', 1.0 * int(r['Q1']) / performance_sum))
        prob_list.append((r['year'] + "_" + 'Q2', 1.0 * int(r['Q2']) / performance_sum))
        prob_list.append((r['year'] + "_" + 'Q3', 1.0 * int(r['Q3']) / performance_sum))
        prob_list.append((r['year'] + "_" + 'Q4', 1.0 * int(r['Q4']) / performance_sum))
    
    return prob_list

def generateDateKeyFromQuarter(quarter_choice):
    year, quarter = quarter_choice.split("_")
    
    if quarter == "Q1":
        return str(radar.random_datetime(start=str(year + '-01-01'), stop=str(year + '-3-31')).date()).replace("-","")
    elif quarter == "Q2":
        return str(radar.random_datetime(start=str(year + '-04-01'), stop=str(year + '-6-30')).date()).replace("-","")
    elif quarter == "Q3":
        return str(radar.random_datetime(start=str(year + '-07-01'), stop=str(year + '-9-30')).date()).replace("-","")

    return str(radar.random_datetime(start=str(year + '-10-01'), stop=str(year + '-12-31')).date()).replace("-","")
    


