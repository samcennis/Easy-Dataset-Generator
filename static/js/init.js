(function ($) {
    var generateDataForRequest = function () {
        var numOrders = getNumOrders();
        var typOrderLinesVal = getTypOrderLinesVal();
        var typOrderLinesRange = getTypOrderLinesRange();
        var startDate = getStartDate();
        var endDate = getEndDate();
        var timePerf = getTimePerf();
        var productDim = getProductDim();
        var storeDim = getStoreDim();
        var promotionDim = getPromotionDim();
        return {
            numOrders: numOrders
            , typOrderLinesVal: typOrderLinesVal
            , typOrderLinesRange: typOrderLinesRange
            , startDate: startDate
            , endDate: endDate
            , timePerf: timePerf
            , productDim: productDim
            , storeDim: storeDim
            , promotionDim: promotionDim
        };
    };
    /*
        Functions to get values from form inputs
    */
    var getNumOrders = function () {
        return $("#num_orders").val();
    };
    var getTypOrderLinesVal = function () {
        return $("#typical_order_lines_value").val();
    };
    var getTypOrderLinesRange = function () {
        return $("#typical_order_lines_range").val();
    };
    var getStartDate = function () {
        return $("#start_date").val();
    };
    var getEndDate = function () {
        return $("#end_date").val();
    };
    var getTimePerf = function () {
        var time_perf = [];
        $('#date_performance_rows *').filter('.row').each(function () {
            var $this = $(this);
            console.log("DATE PERF ROW:" + $this.attr('id'));
            var this_date_performance_row = {
                'year': 0
                , 'Q1': 0
                , 'Q2': 0
                , 'Q3': 0
                , 'Q4': 0
            };
            this_date_performance_row['year'] = $this.attr('id').split("_").shift();
            $this.find('input').each(function () {
                quarter = $(this).attr('id').split("_").pop(); //quarter
                this_date_performance_row[quarter] = $(this).val();
            });
            time_perf.push(this_date_performance_row);
        });
        return time_perf;
    };
    var getProductDim = function () {
        var product_dimension = [];
        $('#product_rows *').filter('.row').each(function () {
            var $this = $(this);
            console.log("PRODUCT ROW:" + $this.attr('id'));
            var this_product_row = {
                'key': ''
                , 'name': ''
                , 'category': ''
                , 'price': ''
                , 'quantity': ''
                , 'range': ''
                , 'performance': 50
            };
            $this.find('input').each(function () {
                //Last part of id is 'key', 'name', 'category', etc.
                object_key = $(this).attr('id').split("_").pop();
                this_product_row[object_key] = $(this).val().trim();
            });
            //Check that non of the inputs were left blank
            if (!!this_product_row['key'] && !!this_product_row['name'] && !!this_product_row['category'] && !!this_product_row['quantity'] && !!this_product_row['range']) {
                product_dimension.push(this_product_row);
            }
            else {
                console.log('WARNING: Skipping product ' + $this.attr('id') + ' due to not all fields having values.');
            }
        });
        return product_dimension;
    };
    var getStoreDim = function () {
        var store_dimension = [];
        $('#store_rows *').filter('.row').each(function () {
            var $this = $(this);
            console.log("STORE ROW:" + $this.attr('id'));
            var this_store_row = {
                'key': ''
                , 'name': ''
                , 'state': ''
                , 'city': ''
                , 'performance': 50
            };
            $this.find('input:not(.select-dropdown), select').each(function () {
                //Last part of id is 'key', 'name', 'category', etc.
                object_key = $(this).attr('id').split("_").pop();
                this_store_row[object_key] = $(this).val().trim();
            });
            //Check that non of the inputs were left blank
            if (!!this_store_row['key'] && !!this_store_row['name'] && !!this_store_row['state'] && !!this_store_row['city']) {
                store_dimension.push(this_store_row);
            }
            else {
                console.log('WARNING: Skipping store ' + $this.attr('id') + ' due to not all fields having values.');
            }
        });
        return store_dimension;
    };
    var getPromotionDim = function () {
        var promotion_dimension = [];
        //Add the "no promotion" row
        promotion_dimension.push({
                'key': 0
                , 'name': 'No Promotion'
                , 'type': 'None'
                , 'startDate': 0
                , 'endDate': 0
                , 'performance': $('#0_promotion_performance').val().trim()
            })
            //Add all other promotion rows (do not add no promotion again)
        $('#promotion_rows *').filter('.row:not(#0_promotion_row)').each(function () {
            var $this = $(this);
            console.log("PROMOTION ROW:" + $this.attr('id'));
            var this_promotion_row = {
                'key': ''
                , 'name': ''
                , 'type': ''
                , 'startDate': 0
                , 'endDate': 0
                , 'performance': 50
            };
            $this.find('input:not(.select-dropdown), select').each(function () {
                //Last part of id is 'key', 'name', 'category', etc.
                object_key = $(this).attr('id').split("_").pop();
                //If its a date, remove '-' and convert to string
                // "2014-01-06" -> 20140106
                if ($(this).attr('type') == 'date') {
                    this_promotion_row[object_key] = parseInt($(this).val().replace(/-/g, ""));
                }
                else {
                    this_promotion_row[object_key] = $(this).val().trim();
                }
            });
            //Check that non of the inputs were left blank
            if (!!this_promotion_row['key'] && !!this_promotion_row['name'] && !!this_promotion_row['type'] && !!this_promotion_row['startDate'] && !!this_promotion_row['endDate']) {
                promotion_dimension.push(this_promotion_row);
            }
            else {
                console.log('WARNING: Skipping store ' + $this.attr('id') + ' due to not all fields having values.');
            }
        });
        return promotion_dimension;
    };
    var initialize = function () {
        $('#generate_dataset_button').click(function () {
            var req_data = generateDataForRequest();
            console.log(req_data);
            $.postJSON("/api/dataset/create", req_data, function (resp_data) {
                console.log("POST REQUEST RETURNED")
                console.log(resp_data);
                resp_data_json = JSON.stringify(resp_data['result']);
                console.log(resp_data_json);
                var csv_string = Papa.unparse(resp_data_json);
                console.log(csv_string);
                downloadCSV(csv_string, "sales-fact.csv");
            });
        });
    };
    var downloadCSV = function (csv_string, exportFilename) {
        var csvData = new Blob([csv_string], {
            type: 'text/csv;charset=utf-8;'
        });
        //IE11 & Edge
        if (navigator.msSaveBlob) {
            navigator.msSaveBlob(csvData, exportFilename);
        }
        else {
            //In FF link must be added to DOM to be clicked
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(csvData);
            link.setAttribute('download', exportFilename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
    $.postJSON = function (url, data, success, args) {
        args = $.extend({
            url: url
            , type: 'POST'
            , data: JSON.stringify(data)
            , contentType: 'application/json; charset=utf-8'
            , dataType: 'json'
            , async: true
            , success: success
        }, args);
        return $.ajax(args);
    };
    $(function () {
        $('.button-collapse').sideNav();
        $('select').material_select();
        initialize();
    }); // end of document ready
})(jQuery); // end of jQuery name space