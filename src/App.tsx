import React, { Suspense, lazy } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import "./App.css";

const Dashboard = lazy(() => import('./pages/dashboard/dashboard'));


function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <Switch>
            <Route exact path="/" component={Dashboard} />
          </Switch>
        </Suspense>
      </BrowserRouter>
    </div>
  );
}

export default App;
