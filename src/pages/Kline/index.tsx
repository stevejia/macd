import React from "react";

import echarts from "echarts/lib/echarts";

import * as api from "./services";

import ReactEcharts from "echarts-for-react";
import { formatDate } from "../../utils/utils";
import CheckableTag from "antd/lib/tag/CheckableTag";

import "./index.less";
import { Modal } from "antd";
import WebSocketClient from "../../utils/websocket";
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
  };

  private klineList = [];

  componentDidMount() {
    this.keydownBindThis = this.onKeyDown.bind(this);

    window.addEventListener("keydown", this.keydownBindThis, false);

    this.queryKline();
    this.refreshKline();

    this.initWebsocket();
  }

  private initWebsocket() {
    // const client: WebSocketClient = (window as any).client;
    // client?.addMessageEvent("OPEN_POSITION_MESSAGE", (data: any) =>
    //   console.log(data)
    // );
  }

  private refreshKline() {
    const { checkedIndex } = this.state;
    const periodItem = this.periodList[checkedIndex];

    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.timer = setInterval(async () => {
      const params = { period: periodItem.period };
      const {
        data: { klines: newKlines, tdStructures },
      } = await api.refreshKline(params);
      console.log(newKlines);
      if (newKlines?.length > 0 || tdStructures?.length > 0) {
        this.klineList = this.klineList.concat(newKlines);
        this.processKlineData(this.klineList, tdStructures);
      }
    }, this.DURATION);
  }

  private async queryKline() {
    const { checkedIndex } = this.state;
    const periodItem = this.periodList[checkedIndex];
    const params = {
      period: periodItem.period,
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
    console.log(3);
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

  getOption(data0: any, tdMarkers: Array<any>, tdMarkLines: Array<any>) {
    console.log(tdMarkLines);

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
      },
      yAxis: {
        scale: true,
        splitArea: {
          show: true,
        },
        min: "dataMin",
        max: "dataMax",
      },
      dataZoom: [
        {
          type: "inside",
          start: this.getPercent(),
          end: 100,
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

  render() {
    const { option, checkedIndex, modalVisible } = this.state;
    console.log(option);
    if (!option) {
      return null;
    }
    return (
      <div className="kline-container">
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
        <div className="kline-echarts-container">
          <ReactEcharts
            className="kline-echarts"
            style={{ height: "100%" }}
            option={option}
          ></ReactEcharts>
        </div>
        {modalVisible && (
          <Modal
            title="选择合约"
            okText="确定"
            cancelText="取消"
            onOk={() => this.onOk()}
            onCancel={() => this.setState({ modalVisible: false })}
            visible={modalVisible}
          >
            3333
          </Modal>
        )}
      </div>
    );
  }
}

export default Kline;
