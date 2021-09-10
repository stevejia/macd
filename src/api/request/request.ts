import axios from "axios";

import baseURL from "./baseUrl";

axios.defaults.timeout = 120000; //  响应时间
axios.defaults.headers.post["Content-Type"] =
  "application/x-www-form-urlencoded"; // 配置请求头 responseType:
axios.defaults.baseURL = baseURL;
async function get(
  path: string,
  params: any,
  needAuten = true,
  needLoading = false
) {
  axios.defaults.headers.common["token"] = window.localStorage.getItem("token");
  axios.defaults.headers.common["needAuten"] = needAuten;
  try {
    let res = await axios.get(`${path}`, { params });
    return res.data;
  } catch (error: any) {
    if (error.response) {
      showStateError(error.response);
    } else if (error.status) {
      showStateError(error);
    } else {
      alert(`服务器故障，请【稍后再试】或【联系管理员】`);
    }
  } finally {
  }
}

async function post(
  path: string,
  params: any,
  needAuten = true,
  needLoading = false
) {
  axios.defaults.headers.common["token"] = window.localStorage.getItem("token");
  axios.defaults.headers.common["needAuten"] = needAuten;
  try {
    // let res = await axios.post(`${path}`, params);
    let res = await axios({
      method: "post",
      url: `${path}`,
      data: params,
      transformRequest: [
        function (data) {
          let ret = "";
          for (let it in data) {
            ret +=
              encodeURIComponent(it) + "=" + encodeURIComponent(data[it]) + "&";
          }
          ret = ret.substring(0, ret.lastIndexOf("&"));
          return ret;
        },
      ],
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return res.data;
  } catch (error: any) {
    if (error.response) {
      showStateError(error.response);
    }
  } finally {
  }
}

function showStateError(response: any) {
  switch (response.status) {
    case 400:
      alert(response.data.message);
      return Promise.reject(response);
      break;
    case 401:
      //   if (location.pathname !== "/login") {
      //     router.replace({
      //       path: "/login",
      //       query: { redirect: location.pathname + location.search }
      //     });
      //   }
      break;
    case 404:
      //   store.commit("showModal", "访问的后台接口不存在");
      break;
    case 500:
      //   store.commit("showModal", response.data || "系统错误，请【联系管理员】");
      break;
    default:
    //   store.commit("showModal", "系统异常");
  }
}

export let http = { post, get };
