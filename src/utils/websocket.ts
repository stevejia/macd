class WebSocketClient {
  private client: WebSocket = null as any;
  private messageEvents: { [key: string]: Function } = {};
  constructor(code: string) {
    if ("WebSocket" in window) {
      console.log("环境支持WebSocket");
      const wsUrl = this.getWsUrl(code);
      this.client = new WebSocket(wsUrl);
      this.init(this.client);
    }
  }

  private init(client: WebSocket) {
    client.onmessage = (event: MessageEvent<any>) => {
      const dataJson = event.data;
      const message = JSON.parse(dataJson);
      const { key, data } = message;
      console.log(key, data);
      const msgFunc = this.messageEvents[key];
      if (!!msgFunc) {
        msgFunc(data);
      }
    };
  }

  private getWsUrl(code: string) {
    let baseUrl = "";
    if (process.env.NODE_ENV === "development") {
      baseUrl = `ws://localhost:8080/distribute-game-oss/websocket/${code}`;
    } else if (process.env.NODE_ENV === "production") {
      baseUrl = "XXXXXXXXXXXXXXXX";
    }
    return baseUrl;
  }

  addMessageEvent(messageKey: string, event: Function) {
    this.messageEvents = this.messageEvents || {};
    this.messageEvents[messageKey] = event;
  }
}

export default WebSocketClient;
