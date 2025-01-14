const moment = require("moment");
const Sequelize = require("sequelize");
const sequelize = require("../../server/util/database");
const Orders = require("../../server/models/Orders");
const orders = Orders(sequelize, Sequelize);
const Order_Details = require("../../server/models/Order_details");
const orderDetails = Order_Details(sequelize, Sequelize);
const Employee = require("../../server/models/Employee");
const employee = Employee(sequelize, Sequelize);

exports.pieChart = (req, res, nxt) => {
    const service_id = req.body.service_id;
    const start_date = req.body.start_date;
    const end_date = req.body.end_date;
    sequelize
        .query(
            "SELECT *  FROM  Orders INNER JOIN Order_details ON Orders.order_id=Order_details.order_id INNER JOIN Universal_Product_List ON Order_details.product_id=Universal_Product_List.product_id WHERE Orders.order_time BETWEEN  ? AND  ? &&  service_id=? && Orders.delivered=true",
            {
                replacements: [[start_date], [end_date], [service_id]],
                type: sequelize.QueryTypes.SELECT,
            }
        )
        .then((result) => {
            let hotproducts = new Map();
            result.forEach((element) => {
                let ord =
                    hotproducts.get(element.product_name) === undefined
                        ? 1
                        : hotproducts.get(element.product_name) + 1;
                //console.log(ord);
                hotproducts.set(element.product_name, ord);
            });

            let product_name = [],
                product_ordered = [];
            let ck=0;
            for (let [key, value] of hotproducts) {
                if(ck===5)
                    break;
                product_name.push(key + ": " + value);
                product_ordered.push(value);
                ck++;
            }

            // let products = [];

            // for (let i = 0; i < product_name.length; i++) {
            //     const name = product_name[i];
            //     const ordered = product_ordered[i];

            //     let product =
            //     {
            //         "name" : name,
            //         "ordered" : ordered
            //     }
            //     products.push(product);

            // }

            let details = [];
            details.push(product_name);
            details.push(product_ordered);
            res.status(200).json({
                //orders : success,
                details: details,
                message: "Successfully fetched the chart",
            });

           // console.log(hotproducts);
        })
        .catch((err) => {
            res.status(504).json({ message: "Failed to fetch the chart" });
        });
};

exports.lineChart = (req, res, nxt) => {
    const start_date = req.body.start_date;
    const end_date = req.body.end_date;
    const service_id = req.body.service_id;

    sequelize
        .query(
            "SELECT * FROM Orders INNER JOIN Employee ON Orders.employee_id=Employee.employee_id WHERE order_time BETWEEN  ? AND  ? && Orders.service_id=?",
            {
                replacements: [[start_date], [end_date], [service_id]],
                type: sequelize.QueryTypes.SELECT,
            }
        )
        .then((result) => {
            let delivered_date = new Map();
            result.forEach((element) => {
                if (element.delivered === 1) {
                    var time = element.order_time;
                    time = moment(time).format("YYYY-MM-DD");
                    //console.log(time);
                    // console.log(time.toString());
                    //time = time.toString();
                    //let time = element.order_time.getDate()+'-'+element.order_time.getMonth()+'-'+element.order_time.getFullYear();
                    let ord =
                        delivered_date.get(time) === undefined
                            ? 1
                            : delivered_date.get(time) + 1;
                    //console.log(ord);
                    delivered_date.set(time, ord);
                }
            });
            const mapSort1 = new Map(
                [...delivered_date.entries()].sort((a, b) => b[1] - a[1])
            );
            //console.log(mapSort1);
            let date = [],
                orders_date = [],
                pairs = [],
                finalpairs = [];

            // //console.log(demo);
            for (let [key, value] of mapSort1) {
                pairs.push({ key, value });
            }

            const newPair = pairs.length>5 ? pairs.slice(0,5) : pairs;

            const sortedArray = newPair.sort(
                (a, b) =>
                    moment(a.key).format("YYYYMMDD") -
                    moment(b.key).format("YYYYMMDD")
            );
            //console.log(sortedArray);
            for (let [key, value] of sortedArray.entries()) {
                // console.log(value);
                date.push(moment(value.key).format("MMM DD, YY"));
                orders_date.push(value.value);
            }

            // console.log(employeeincome);
            // console.log(employeedelivered);
            //  let linechartdetails = [];
            // for (let i = 0; i < (date.length || 5) ; i++) {
            //     var data = {
            //         "date" : date[i],
            //         "orders": orders_date[i],
            //     };
            //     linechartdetails.push(data);
            // }
            let details = [];
            details.push(date);
            details.push(orders_date);
            res.status(200).json({
                //orders : success,
                details: details,
                message: "Successfully fetched the chart.",
            });
        })
        .catch((err) => {
            res.status(504).json({ message: "Failed to fetch the chart." });
        });
};

exports.horizontalBar = (req, res, nxt) => {
    const start_date = req.body.start_date;
    const end_date = req.body.end_date;
    const service_id = req.body.service_id;

    sequelize
        .query(
            "SELECT * FROM Orders INNER JOIN Employee ON Orders.employee_id=Employee.employee_id WHERE order_time BETWEEN  ? AND  ? && Orders.service_id=?",
            {
                replacements: [[start_date], [end_date], [service_id]],
                type: sequelize.QueryTypes.SELECT,
            }
        )
        .then((result) => {
            let emplpoyee_income = new Map();
            let employee_name = new Map();
            result.forEach((element) => {
                if (element.delivered === 1) {
                    let inc =
                        emplpoyee_income.get(element.phone_number) === undefined
                            ? 0 + parseInt(element.payment)
                            : emplpoyee_income.get(element.phone_number) +
                              parseInt(element.payment);
                    emplpoyee_income.set(element.phone_number, inc);
                    employee_name.set(
                        element.phone_number,
                        element.employee_name
                    );
                }
            });

            const mapSort1 = new Map(
                [...emplpoyee_income.entries()].sort((a, b) => b[1] - a[1])
            );
           // console.log(mapSort1);

            let employeename = [],
                employeeincome = [];
            let ck = 0;
            for (let [key, value] of mapSort1) {
                if (ck === 5) break;
                let name = employee_name.get(key);
                employeename.push(name.split(" "));
                employeeincome.push(value);
                ck++;
            }

            let details = [];
            details.push(employeename);
            details.push(employeeincome);
            res.status(200).json({
                //orders : success,
                details: details,
                message: "Successfully fetched the chart.",
            });
        })
        .catch((err) => {
            res.status(504).json({ message: "Failed to fetch the chart." });
        });
};
