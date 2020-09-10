import React, { useEffect, useState, useRef } from "react";
import moment from "moment";
import { Table } from "antd";
import { Chart } from "react-google-charts";

import "./dashboard.css";
import useAPI from "../../helperhooks/useAPI";
import dashboardService from "../../services/dashboardService";

// data models
interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  created: string;
  orders: number;
}

interface Order {
  id: string;
  customer: string;
  product: string;
  created: string;
  price: string;
}

const Dashboard: React.FC = () => {
  const { callAPI: getCustomerList, ...customerList } = useAPI(
    dashboardService.getCustomerData
  );
  const [groupedCustomers, setGroupedCustomers] = useState<Array<Array<{}>>>(
    []
  );
  const [groupedOrders, setGroupedOrders] = useState<Array<Array<{}>>>([]);

  // call the customerlist service
  useEffect(() => {
    getCustomerList({});
  }, [getCustomerList]);

  // format customers data for the orders count per day graph and table
  useEffect(() => {
    if (customerList.response) {
      const formattedData: Array<Array<any>> = [["Date", "Orders Count"]];

      const res = groupandOrderBy(customerList.response.orders, "created");
      enumerateDaysBetweenDates("2020-04-01", "2020-04-30").forEach((date) => {
        formattedData.push([date, res[date]?.length || 0]);
      });
      // Object.entries(res).map((group: Array<any>) =>
      //   formattedData.push([group[0].split("-")[0],
      //   group[1].length
      // ])
      // );
      setGroupedCustomers(formattedData);
    }
  }, [customerList.response]);

  const enumerateDaysBetweenDates = function (startDate: any, endDate: any) {
    let date = [];
    while (moment(startDate) <= moment(endDate)) {
      date.push(startDate);
      startDate = moment(startDate).add(1, "days").format("YYYY-MM-DD");
    }
    return date;
  };

  // format orders data for the orders total price
  useEffect(() => {
    if (customerList.response) {
      const formattedData: Array<Array<any>> = [["Date", "Total Price"]];
      const res = groupandOrderBy(customerList.response.orders, "created");
      Object.entries(res).map((group: any) =>
        formattedData.push([
          group[0].split("-")[0],
          group[1].reduce((a: number, b: Order) => a + parseFloat(b.price), 0),
        ])
      );
      setGroupedOrders(formattedData);
    }
  }, [customerList.response]);

  // util function to sort and group the customers and orders list
  const groupandOrderBy = (list: Array<any>, key: string) => {
    return list
      .sort((a, b) => a[key].localeCompare(b[key]))
      .reduce((r: any, a) => {
        const date = moment.utc(a.created).format("YYYY-MM-DD");
        r[date] = [...(r[date] || []), a];
        return r;
      }, {});
  };

  // columns for the customer table
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "First Name",
      dataIndex: "firstName",
      key: "firstName",
    },
    {
      title: "Last Name",
      dataIndex: "lastName",
      key: "lastName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Created",
      dataIndex: "created",
      key: "created",
    },
    {
      title: "Orders",
      dataIndex: "orders",
      key: "orders",
    },
  ];

  const tableRef: any = useRef(null);
  const chartRef: any = useRef(null);

  const [activeCharacter, setActiveCharacter] = useState("");
  useEffect(() => {
    const handleIntersection = function (entries: any[]) {
      entries.forEach((entry: { target: any; isIntersecting: any }) => {
        if (entry.target.id !== activeCharacter && entry.isIntersecting) {
          setActiveCharacter(entry.target.id);
        }
      });
    };
    const observer = new IntersectionObserver(handleIntersection);
    observer.observe(tableRef.current);
    observer.observe(chartRef.current);
    return () => observer.disconnect(); // Clenaup the observer if
  }, [activeCharacter, setActiveCharacter, tableRef, chartRef]);

  useEffect(() => {
    const allEls = document.getElementsByClassName('selected');
    while (allEls.length) {
      allEls[0].className = allEls[0].className.replace(/\ selected\b/g, "");
    }
    const el = document.querySelector(`a[href*='${activeCharacter}']`);
    if (el && Object.keys(el).length) {
      el.className = el.className + " selected";
    }
  }, [activeCharacter]);

  return (
    <div className="page-layout" id="page">
      <div className="header" id="header">
        <h1>Header</h1>
        <a href="#charts">Graph</a>
        <a href="#table">Table</a>
      </div>
      <div className="nav">
        Empty Container
      </div>
      <div className="dashboard-container" id="body">
        <div className="charts-container" ref={chartRef} id="charts">
          <div className="chart-card">
            <h3>Orders Count</h3>
            <Chart
              chartType="Bar"
              data={groupedCustomers}
              loader={<div>Loading Chart</div>}
              width="100%"
              height="90%"
              options={{
                axes: { y: { 0: { side: "left", label: "Orders Count" } } },
                legend: { position: "none" },
                chartArea: { right: "10%" },
              }}
            />
          </div>
          <div className="chart-card">
            <h3>Orders Total Price</h3>
            <Chart
              chartType="LineChart"
              data={groupedOrders}
              loader={<div>Loading Chart</div>}
              width="100%"
              height="90%"
              options={{
                hAxis: {
                  title: "Date",
                },
                vAxis: {
                  title: "Total Price",
                },
                legend: { position: "none" },
                chartArea: { left: "15%", right: "5%" },
              }}
            />
          </div>
        </div>
        <div className="table-container" ref={tableRef} id="table">
          <Table
            columns={columns}
            rowKey={"id"}
            dataSource={customerList.response?.customers}
          ></Table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
