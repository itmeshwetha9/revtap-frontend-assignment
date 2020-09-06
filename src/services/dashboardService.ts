import data from "./db.json";

class DashboardService {
  public getCustomerData() {
    // to setup axios for backend service calls
    return data;
  }
}

const dashboardService = new DashboardService();
export default dashboardService;
