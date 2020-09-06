import React, { useEffect, useState } from "react";
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
      const res = groupandOrderBy(customerList.response.customers, "created");
      Object.entries(res).map((group: Array<any>) =>
        formattedData.push([group[0].split("-")[0], group[1].length])
      );
      setGroupedCustomers(formattedData);
    }
  }, [customerList.response]);

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
        const date = moment.utc(a.created).format("DD-MM-YYYY");
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

  return (
    <div className="dashboard-container">
      <div className="charts-container">
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
      <div className="table-container">
        <Table
          columns={columns}
          rowKey={"id"}
          dataSource={customerList.response?.customers}
        ></Table>
      </div>
    </div>
  );
};

export default Dashboard;
