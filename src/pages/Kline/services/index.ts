import { http } from "../../../api/request/request";

export const queryKline = (params: any = null) => {
  return http.post("kline/querykline", params);
};

/**
 * 实时刷新k线
 * @param params 查询参数
 * @returns
 */
export const refreshKline = (params: any = null) => {
  return http.post("kline/refreshKline", params);
};

/**
 * 查询合约
 * @param params 查询参数
 * @returns
 */
 export const queryContract = (params: any = null) => {
  return http.post("contract/query", params);
};
