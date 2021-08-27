import { Redirect } from "react-router-dom";
import Kline from "../pages/Kline";


const routes = [
  { path: "/", exact: true, render: () => <Redirect to={"/kline"} /> },
  { path: "/kline", component: Kline },
];

export default routes;
