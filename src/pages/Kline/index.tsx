import React from "react";

import * as api from "./services";

import ReactEcharts from "echarts-for-react";
import { formatDate } from "../../utils/utils";
import CheckableTag from "antd/lib/tag/CheckableTag";

import "./index.less";
import { Modal, Popover, Tag, Tooltip } from "antd";
import WebSocketClient from "../../utils/websocket";
import Sider from "antd/lib/layout/Sider";
import ContextMenu from "./components";
class Kline extends React.Component<any, any> {
  private keydownBindThis: any = null;
  private timer: any = null;
  private static UP_COLOR = "#ec0000";
  private static UP_BORDER_COLOR = "#8A0000";
  private static DOWN_COLOR = "#00da3c";
  private static DOWN_BORDER_COLOR = "#008F28";

  private periodList = [
    {
      title: "30s",
      period: 30,
    },
    {
      title: "1min",
      period: 60,
    },
    {
      title: "3min",
      period: 180,
    },
    {
      title: "5min",
      period: 300,
    },
    {
      title: "10min",
      period: 600,
    },
    {
      title: "15min",
      period: 900,
    },
    {
      title: "30min",
      period: 1800,
    },
    {
      title: "60min",
      period: 3600,
    },
    {
      title: "90min",
      period: 5400,
    },
    {
      title: "120min",
      period: 7200,
    },
    {
      title: "240min",
      period: 14400,
    },
    {
      title: "1D",
      period: 86400,
    },
    {
      title: "1W",
      period: 604800,
    },
    {
      title: "1M",
      period: 86400,
    },
  ];

  //1500ms 1.5s
  private DURATION = 5000;

  state = {
    option: null,
    checkedIndex: 0,
    modalVisible: false,
    contextMenuVisible: false,
    contextMenuLeft: 0,
    contextMenuTop: 0,
    optionalList: [],
    instrumentid: "rb2110",
    dataZoom: {
      start: null as any,
      end: null as any,
    },
    contracts: [],
  };

  private klineList = [];
  private echartsRef = null;
  componentDidMount() {
    this.keydownBindThis = this.onKeyDown.bind(this);
    console.log(this.echartsRef);
    window.addEventListener("keydown", this.keydownBindThis, false);
    // this.queryKline();
    // this.refreshKline();

    // this.initWebsocket();

    // this.getOptionalList();
    this.query();
    this.queryContract();
  }

  private async query() {
    await this.queryKline();
    this.refreshKline();

    this.initWebsocket();

    this.getOptionalList();
  }

  private async queryContract() {
    const { data: contracts } = await api.queryContract();
    this.setState({ contracts });
  }

  private getOptionalList() {
    let value = localStorage.getItem("Optional_LISt") || "[]";
    value = value || "[]";
    const optionalList = JSON.parse(value) as Array<string | undefined>;
    this.setState({ optionalList });
    return optionalList;
  }

  private setOptionalList(optionalList: Array<any>) {
    localStorage.setItem("Optional_LISt", JSON.stringify(optionalList));
  }

  private initWebsocket() {
    const client: WebSocketClient = (window as any).client;
    client?.addMessageEvent("OPEN_POSITION_MESSAGE", (data: any) =>
      console.log(data)
    );
  }

  private refreshKline() {
    this._refreshKline();
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.timer = setInterval(async () => {
      this._refreshKline();
    }, this.DURATION);
  }

  private async _refreshKline() {
    const { checkedIndex, instrumentid } = this.state;
    const periodItem = this.periodList[checkedIndex];
    const params = { instrumentid, period: periodItem.period };
    const {
      data: { klines: newKlines, tdStructures },
    } = await api.refreshKline(params);

    if (newKlines?.length > 0 || tdStructures?.length > 0) {
      this.klineList = this.klineList.concat(newKlines);
      const {
        dataZoom: { end },
      } = this.state;

      if (end < 100) {
        return;
      }
      this.processKlineData(this.klineList, tdStructures);
    }
  }

  private async queryKline() {
    const { checkedIndex, instrumentid } = this.state;
    const periodItem = this.periodList[checkedIndex];
    const params = {
      period: periodItem.period,
      instrumentid,
    };
    const { data: klineList } = await api.queryKline(params);
    this.klineList = klineList;
    this.processKlineData(klineList, []);
  }

  private processKlineData(klineList: Array<any>, tdStructures: Array<any>) {
    const klineDataList = klineList.map((line) => [
      formatDate(line.klineTime),
      line.openprice,
      line.closeprice,
      line.lowestprice,
      line.highestprice,
    ]);

    const { tdMarkers, tdMarkLines } = this.processTdStructures(
      klineList,
      tdStructures
    );
    const splitData = this.splitData(klineDataList);
    const option = this.getOption(splitData, tdMarkers, tdMarkLines);
    this.setState({ option });
  }

  private processTdStructures(klineList: Array<any>, tdStructures: Array<any>) {
    const tdMarkers: Array<any> = [];
    //趋势支撑 压力线
    const tdMarkLines: Array<any> = [];
    tdStructures.forEach((td) => {
      const klineTimes = td.klineTimes;
      const klineTimeList = klineTimes.split(",");
      const price = td.reversal ? td.supportPrice : td.pressurePrice;
      if (td.structureComplete) {
        const line = [
          {
            coord: [formatDate(klineTimeList[0]), price],
          },

          {
            coord: [formatDate(klineTimeList[klineTimeList.length - 1]), price],
          },
        ];
        tdMarkLines.push(line);
      }

      klineTimeList.forEach((kt: any, index: number) => {
        const kline = klineList.find((kl) => kl.klineTime === kt);
        if (kline) {
          const marker = {
            name: "TD结构",
            coord: [formatDate(kt), kline.highestprice],
            value: index + 1,
            symbolSize: 0,
            itemStyle: {
              color: "red",
            },
          };
          tdMarkers.push(marker);
        }
      });
    });
    return { tdMarkers, tdMarkLines };
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.keydownBindThis, false);
  }

  /**
   * 按键精灵
   * @param e event
   */
  private onKeyDown(e: any) {
    this.setState({ modalVisible: true });
    return;
  }

  splitData(rawData: Array<any>) {
    var categoryData = [];
    var values = [];
    let min = Number.MAX_VALUE;
    let max = Number.MIN_VALUE;
    for (var i = 0; i < rawData.length; i++) {
      const data = rawData[i].splice(0, 1)[0];

      categoryData.push(data);

      values.push(rawData[i]);
      min = Math.min(min, ...rawData[i]);
      max = Math.max(max, ...rawData[i]);
    }
    return {
      categoryData: categoryData,
      values: values,
      min,
      max,
    };
  }

  private getVisibleList(start: number, end: number, data0: any) {
    const startIndex = Math.floor((data0.categoryData.length / 100) * start);
    const endIndex = Math.ceil((data0.categoryData.length / 100) * end + 1);
    const visibleKline = {
      categoryData: data0.categoryData.slice(startIndex, endIndex),
      values: data0.values.slice(startIndex, endIndex),
    };
    return visibleKline;
  }

  getOption(data0: any, tdMarkers: Array<any>, tdMarkLines: Array<any>) {
    let {
      dataZoom: { start, end },
    } = this.state;

    let count = 120;
    let visibleKlineData = { categoryData: [], values: [] };
    if (start === null || end === null) {
      end = 100;
      start = this.getPercent();
      // visibleKlineData.categoryData = data0.categoryData.slice(
      //   data0.categoryData.length - count,
      //   data0.categoryData.length
      // );
      // visibleKlineData.values = data0.values.slice(
      //   data0.values.length - count,
      //   data0.values.length
      // );
    } else {
      // visibleKlineData = this.getVisibleList(start, end, data0);
    }

    const option = {
      // title: {
      //   text: "上证指数",
      //   left: 0,
      // },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
        },
      },
      // legend: {
      //   data: ["日K", "MA5", "MA10", "MA20", "MA30"],
      // },
      grid: {
        left: 70,
        right: 20,
        bottom: "5%",
      },
      xAxis: {
        show: false,
        type: "category",
        data: data0.categoryData,
        scale: true,
        boundaryGap: false,
        axisLine: { onZero: false },
        splitLine: { show: false },
        splitNumber: 20,
        min: "dataMin",
        max: "dataMax",
        offset: 20,
      },
      yAxis: {
        scale: true,
        splitArea: {
          show: true,
        },
      },
      dataZoom: [
        {
          type: "inside",
          start,
          end,
        },
      ],
      series: [
        {
          name: "日K",
          type: "candlestick",
          data: data0.values,
          itemStyle: {
            color: Kline.UP_COLOR,
            color0: Kline.DOWN_COLOR,
            borderColor: Kline.UP_BORDER_COLOR,
            borderColor0: Kline.DOWN_BORDER_COLOR,
          },
          markPoint: {
            label: {
              normal: {
                formatter: function (param: any) {
                  return param != null ? Math.round(param.value) : "";
                },
              },
            },
            data: tdMarkers,
            tooltip: {
              formatter: function (param: any) {
                return param.name + "<br>" + (param.data.coord || "");
              },
            },
          },
          markLine: { symbol: ["none", "none"], data: tdMarkLines },
        },
      ],
    };
    return option;
  }

  private getPercent() {
    const showLen = 120;
    const allLen = this.klineList.length;
    if (!allLen) {
      return 0;
    }
    return ((allLen - showLen) / allLen) * 100;
  }

  private onChange(checked: boolean, index: number) {
    let { checkedIndex } = this.state;
    if (checked) {
      if (checkedIndex !== index) {
        checkedIndex = index;
        this.setState({ checkedIndex }, () => {
          this.queryKline();
          this.refreshKline();
        });
      }
    }
  }

  private onOk() {
    this.setState({ modalVisible: false });
  }

  private onRightClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const { clientX, clientY } = e;
    console.log(clientX, clientY);
    this.setState({
      contextMenuVisible: true,
      contextMenuLeft: clientX,
      contextMenuTop: clientY,
    });
  }

  onContextMenuOk(optionalList: Array<any>) {
    this.setOptionalList(optionalList);
    console.log(optionalList);
    this.setState({ optionalList, contextMenuVisible: false });
  }

  selectInstrument(instrumentid: string) {
    this.setState({ instrumentid, modalVisible: false }, () => {
      this.query();
    });
  }

  onChartReady(instance: any) {
    console.log(instance);
    instance.on("datazoom", (event: any) => {
      console.log(event);
      const batch = event.batch[0];
      const start = batch.start;
      const end = batch.end;
      this.setState({
        dataZoom: {
          start,
          end,
        },
      });
    });
  }

  render() {
    const {
      option,
      checkedIndex,
      modalVisible,
      contextMenuVisible,
      contextMenuLeft,
      contextMenuTop,
      optionalList,
      instrumentid,
      contracts,
    } = this.state;
    if (!option) {
      return null;
    }
    return (
      <div className="kline-wrapper">
        <Sider>
          <div className="comodity-list-wrapper flex">
            <div className="title">自选列表</div>
            <div className="content flex-1">
              {optionalList?.map((item: any, index: number) => (
                <div key={index} className="optional-item">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="message-list-wrapper flex">
            <div className="title">自选列表</div>
            <div className="content flex-1"></div>
          </div>
        </Sider>

        <div className="kline-container flex-1">
          <div className="period-container">
            {this.periodList.map((period, index) => (
              <CheckableTag
                key={index}
                checked={checkedIndex === index}
                onChange={(checked) => this.onChange(checked, index)}
              >
                {period.title}
              </CheckableTag>
            ))}
          </div>

          <div
            onContextMenu={(e) => this.onRightClick(e)}
            className="kline-echarts-container"
          >
            <ReactEcharts
              onChartReady={(instance) => this.onChartReady(instance)}
              className="kline-echarts"
              style={{ height: "100%" }}
              option={option}
            ></ReactEcharts>
          </div>
          {modalVisible && (
            <Modal
              footer={null}
              title="选择合约"
              onCancel={() => this.setState({ modalVisible: false })}
              visible={modalVisible}
            >
              {contracts?.map((contract: any) => (
                <Tag
                  className="m-b-sm"
                  style={{marginBottom: 10}}
                  color="green"
                  onClick={() => this.selectInstrument(contract.instrumentid)}
                >
                  {contract.instrumentname}({contract.instrumentid})
                </Tag>
              ))}
            </Modal>
          )}
          <ContextMenu
            style={{ left: contextMenuLeft, top: contextMenuTop }}
            instrumentId={instrumentid}
            optionalList={optionalList}
            visible={contextMenuVisible}
            onOk={(optionalList) => this.onContextMenuOk(optionalList)}
            onCancel={() => this.setState({ contextMenuVisible: false })}
          ></ContextMenu>
        </div>
      </div>
    );
  }
}

export default Kline;
