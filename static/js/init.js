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
        var oneFileFlag = getOneFileFlag();
        var fineGrainAdjustments = getFineGrainAdjustments();
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
            , oneFileFlag: oneFileFlag
            , fineGrainAdjustments: fineGrainAdjustments
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
                alert('WARNING: Skipping product ' + $(this).attr('id').split("_").shift() + ' due to not all fields having values.');
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
                alert('WARNING: Skipping store ' + $(this).attr('id').split("_").shift() + ' due to not all fields having values.');
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
                alert('WARNING: Skipping store ' + $(this).attr('id').split("_").shift() + ' due to not all fields having values.');
            }
        });
        return promotion_dimension;
    };
    var getOneFileFlag = function () {
        return $("#download_as_file").is(":checked");
    };
    var getFineGrainAdjustments = function () {
        // Get { [id of row] : performance }
        // TODO: write this. Also think about it, is this the best way to store data for python datagen?
        return {};
    };
    var initialize = function () {
        /* Button handlers */
        $("#product_add_btn").click(function () {
            last_key = $("#product_rows .row:last").attr('id').split("_").shift();
            last_key++;
            //https://stackoverflow.com/a/12000127
            $("#product_rows").append($([
                "<div id='" + last_key + "_product_row' class='row'>"
                , "   <div class='input-field col s1'>"
                , "       <input disabled value='" + last_key + "' id='" + last_key + "_product_key' type='text' class='validate'>"
                , "   </div>"
                , "   <div class='input-field col s3'>"
                , "       <input placeholder='Cherry Coke' id='" + last_key + "_product_name' type='text' class='validate'>"
                , "   </div>"
                , "   <div class='input-field col s2'>"
                , "       <input placeholder='Soft Drink' id='" + last_key + "_product_category' type='text' class='validate'>"
                , "   </div>"
                , "   <div class='input-field col s1'>"
                , "       <input value='1.99' step='0.01' id='" + last_key + "_product_price' type='number' class='validate' min='0'>"
                , "   </div>"
                , "    <div class='input-field col s1'>"
                , "       <input value='2' id='" + last_key + "_product_quantity' type='number' class='validate' min='1'>"
                , "   </div>"
                , "   <div class='input-field col s1'>"
                , "       <input value='1' id='" + last_key + "_product_range' type='number' class='validate' min='1'>"
                , "   </div>"
                , "   <div class='input-field col s3'>"
                , "       <p class='range-field'>"
                , "           <input type='range' id='" + last_key + "_product_performance' min='0' max='100' />"
                , "       </p>"
                , "   </div>"
                , "</div>"
            ].join("\n")));
        });
        $("#product_remove_btn").click(function () {
            //Do not allow removal of the last product:
            if ($("#product_rows > .row").size() > 1) {
                $("#product_rows .row:last").remove();
            }
        });
        $("#store_add_btn").click(function () {
            last_key = $("#store_rows .row:last").attr('id').split("_").shift();
            last_key++;
            //https://stackoverflow.com/a/12000127
            $("#store_rows").append($([
                "<div id='" + last_key + "_store_row' class='row'>"
                , "   <div class='input-field col s1'>"
                , "       <input disabled value='" + last_key + "' id='" + last_key + "_store_key' type='text' class='validate'>"
                , "   </div>"
                , "   <div class='input-field col s3'>"
                , "       <input placeholder='Whole Foods' id='" + last_key + "_store_name' type='text' class='validate'>"
                , "   </div>"
                , "   <div class='input-field col s3'>"
                , "       <select id='" + last_key + "_store_state'>"
                , "            <option selected value='AL'>Alabama</option>"
                , "            <option value='AK'>Alaska</option>"
                , "            <option value='AZ'>Arizona</option>"
                , "            <option value='AR'>Arkansas</option>"
                , "            <option value='CA'>California</option>"
                , "            <option value='CO'>Colorado</option>"
                , "            <option value='CT'>Connecticut</option>"
                , "            <option value='DE'>Delaware</option>"
                , "            <option value='DC'>District Of Columbia</option>"
                , "            <option value='FL'>Florida</option>"
                , "            <option value='GA'>Georgia</option>"
                , "            <option value='HI'>Hawaii</option>"
                , "            <option value='ID'>Idaho</option>"
                , "            <option value='IL'>Illinois</option>"
                , "            <option value='IN'>Indiana</option>"
                , "            <option value='IA'>Iowa</option>"
                , "            <option value='KS'>Kansas</option>"
                , "            <option value='KY'>Kentucky</option>"
                , "            <option value='LA'>Louisiana</option>"
                , "            <option value='ME'>Maine</option>"
                , "            <option value='MD'>Maryland</option>"
                , "            <option value='MA'>Massachusetts</option>"
                , "            <option value='MI'>Michigan</option>"
                , "            <option value='MN'>Minnesota</option>"
                , "            <option value='MS'>Mississippi</option>"
                , "            <option value='MO'>Missouri</option>"
                , "            <option value='MT'>Montana</option>"
                , "            <option value='NE'>Nebraska</option>"
                , "            <option value='NV'>Nevada</option>"
                , "            <option value='NH'>New Hampshire</option>"
                , "            <option value='NJ'>New Jersey</option>"
                , "            <option value='NM'>New Mexico</option>"
                , "            <option value='NY'>New York</option>"
                , "            <option value='NC'>North Carolina</option>"
                , "            <option value='ND'>North Dakota</option>"
                , "            <option value='OH'>Ohio</option>"
                , "            <option value='OK'>Oklahoma</option>"
                , "            <option value='OR'>Oregon</option>"
                , "            <option value='PA'>Pennsylvania</option>"
                , "            <option value='RI'>Rhode Island</option>"
                , "            <option value='SC'>South Carolina</option>"
                , "            <option value='SD'>South Dakota</option>"
                , "            <option value='TN'>Tennessee</option>"
                , "            <option value='TX'>Texas</option>"
                , "            <option value='UT'>Utah</option>"
                , "            <option value='VT'>Vermont</option>"
                , "            <option value='VA'>Virginia</option>"
                , "            <option value='WA'>Washington</option>"
                , "            <option value='WV'>West Virginia</option>"
                , "            <option value='WI'>Wisconsin</option>"
                , "            <option value='WY'>Wyoming</option>"
                , "        </select>"
                , "   </div>"
                , "   <div class='input-field col s2'>"
                , "       <input placeholder='Birmingham' id='" + last_key + "_store_city' type='text' class='validate'>"
                , "   </div>"
                , "   <div class='input-field col s3'>"
                , "       <p class='range-field'>"
                , "           <input type='range' id='" + last_key + "_store_performance' min='0' max='100' />"
                , "       </p>"
                , "   </div>"
                , "</div>"
            ].join("\n")));
            $('select').material_select();
        });
        $("#store_remove_btn").click(function () {
            //Do not allow removal of the last product:
            if ($("#store_rows > .row").size() > 1) {
                $("#store_rows .row:last").remove();
            }
        });
        $("#promotion_add_btn").click(function () {
            last_key = $("#promotion_rows .row:last").attr('id').split("_").shift();
            last_key++;
            //https://stackoverflow.com/a/12000127
            $("#promotion_rows").append($([
                "<div id='" + last_key + "_promotion_row' class='row'>"
                , "   <div class='input-field col s1'>"
                , "       <input disabled value='" + last_key + "' id='" + last_key + "_promotion_key' type='text' class='validate'>"
                , "   </div>"
                , "   <div class='input-field col s3'>"
                , "       <input placeholder='Valentine&#39;s Day Special' id='" + last_key + "_promotion_name' type='text' class='validate'>"
                , "   </div>"
                , "   <div class='input-field col s2'>"
                , "       <select id='" + last_key + "_promotion_type'>"
                , "           <option selected value='Email'>Email</option>"
                , "           <option value='Online Ad'>Online Ad</option>"
                , "           <option value='In-store'>In-store</option>"
                , "       </select>"
                , "   </div>"
                , "   <div class='input-field col s2'>"
                , "       <input value='2014-02-01' id='" + last_key + "_promotion_startDate' type='date' class='datepicker'>"
                , "   </div>"
                , "   <div class='input-field col s2'>"
                , "       <input value='2014-02-14' id='" + last_key + "_promotion_endDate' type='date' class='datepicker'>"
                , "   </div>"
                , "   <div class='input-field col s2'>"
                , "       <p class='range-field'>"
                , "           <input type='range' id='" + last_key + "_promotion_performance' min='0' max='100' />"
                , "       </p>"
                , "   </div>"
                , "</div>"
            ].join("\n")));
            $('select').material_select();
        });
        $("#promotion_remove_btn").click(function () {
            //Do not allow removal of the last product:
            if ($("#promotion_rows > .row").size() > 1) {
                $("#promotion_rows .row:last").remove();
            }
        });
        $("#fine_grain_add_button").click(function () {
            var date = $("#fine_grain_date").val();
            var product = $("#fine_grain_product").val();
            var store = $("#fine_grain_store").val();
            var promotion = $("#fine_grain_promotion").val();
            var performance = $("#fine_grain_performance").val();
            var fine_grain_key = date + "-" + product + "-" + store + "-" + promotion;
            //Check to see that this row doesn't already exist
            var already_exists = false;
            $('#fine_grain_rows .row').each(function () {
                if ($(this).attr('id') == fine_grain_key) {
                    already_exists = true;
                }
            });
            if (!already_exists) {
                $("#fine_grain_rows").append($([
                 "<div class='row' id='" + fine_grain_key + "' >"
                , "  <div class='col s2'>"
                , "     <p>" + date + "</p>"
                , "  </div>"
                , "  <div class='col s2'>"
                , "     <p>" + product + "</p>"
                , "  </div>"
                , "  <div class='col s2'>"
                , "     <p>" + store + "</p>"
                , "  </div>"
                , "  <div class='col s2'>"
                , "     <p>" + promotion + "</p>"
                , "  </div>"
                , "  <div class='col s2'>"
                , "     <p>" + performance + "</p>"
                , "  </div>"
                , "  <div class='col s2'>"
                , "     <a id='" + fine_grain_key + "_remove_button' class='fine_grain_remove_button btn-floating waves-effect waves-light red'><i class='material-icons'>remove</i></a>"
                , "  </div>"
                , "</div>"

            ].join("\n")))
            }
            else {
                alert("You have already added a fine-grain adjustment for the selected dimensions. If you would like to change it, please delete the existing adjustment first.");
            }
            $("#" + fine_grain_key + "_remove_button").click(function () {
                $("#" + fine_grain_key).remove();
            });
        });
        $('#generate_dataset_button').click(function () {
            $("#loader").show();
            $(this).attr('disabled', 'disabled');
            var req_data = generateDataForRequest();
            console.log(req_data);
            $.postJSON("/api/dataset/create", req_data, function (resp_data) {
                console.log("POST REQUEST RETURNED")
                    //console.log(resp_data);
                resp_data_json = JSON.stringify(resp_data['result']);
                //console.log(resp_data_json);
                var csv_string = Papa.unparse(resp_data_json);
                downloadCSV(csv_string, "sales-fact.csv");
                if (!getOneFileFlag()) {
                    //Need to download other dimension tables as well
                    var prodDim_d = prepProductDimObjForDownload(req_data['productDim']);
                    var storeDim_d = prepStoreDimObjForDownload(req_data['storeDim']);
                    var promoDim_d = prepPromoDimObjForDownload(req_data['promotionDim']);
                    var prod_csv_string = Papa.unparse(prodDim_d);
                    var store_csv_string = Papa.unparse(storeDim_d);
                    var promo_csv_string = Papa.unparse(promoDim_d);
                    downloadCSV(prod_csv_string, "product-dimension.csv");
                    downloadCSV(store_csv_string, "store-dimension.csv");
                    downloadCSV(promo_csv_string, "promo-dimension.csv");
                    downloadDateDimensionCSV();
                }
                $("#loader").hide();
                $("#generate_dataset_button").removeAttr('disabled');
            });
        });
    };
    var prepProductDimObjForDownload = function (product_dimension) {
        var retProdDim = [];
        for (var i = 0; i < product_dimension.length; i++) {
            retProdDim.push({
                'ProductKey': product_dimension[i]['key']
                , 'Product Name': product_dimension[i]['name']
                , 'Product Category': product_dimension[i]['category']
            })
        }
        return retProdDim;
    };
    var prepStoreDimObjForDownload = function (store_dimension) {
        var retStoreDim = [];
        for (var i = 0; i < store_dimension.length; i++) {
            retStoreDim.push({
                'StoreKey': store_dimension[i]['key']
                , 'Store Name': store_dimension[i]['name']
                , 'State': store_dimension[i]['state']
                , 'City': store_dimension[i]['city']
            })
        }
        return retStoreDim;
    };
    var prepPromoDimObjForDownload = function (promo_dimension) {
        var retPromoDim = [];
        for (var i = 0; i < promo_dimension.length; i++) {
            retPromoDim.push({
                'PromotionKey': promo_dimension[i]['key']
                , 'Promotion Name': promo_dimension[i]['name']
                , 'Promotion Type': promo_dimension[i]['type']
                , 'Promotion Start Date': promo_dimension[i]['startDate']
                , 'Promotion End Date': promo_dimension[i]['endDate']
            })
        }
        return retPromoDim;
    };
    var downloadDateDimensionCSV = function () {
        var link = document.createElement('a');
        link.href = 'static/csv/date-dimension.csv';
        link.setAttribute('download', '');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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