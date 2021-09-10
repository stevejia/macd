import "./App.nomodule.less";
import "antd/dist/antd.css";
import routes from "./router";
import { HashRouter } from "react-router-dom";

import { renderRoutes } from "react-router-config";
import React from "react";
import { Layout } from "antd";
import WebSocketClient from "./utils/websocket";

const { Footer, Sider, Content } = Layout;

class App extends React.Component<any, any> {
  componentDidMount() {
    new WebSocketClient("33333");
  }
  render() {
    return (
      <Layout className="container-wrapper">
        <Layout>
          <Sider>Sider</Sider>
          <Content className="main-content">
            <HashRouter>{renderRoutes(routes)}</HashRouter>
          </Content>
        </Layout>
        <Footer>Footer</Footer>
      </Layout>
    );
  }
}

export default App;
