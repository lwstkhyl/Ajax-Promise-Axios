//创建Axios
function Axios(config) { //Axios构造函数
    this.config = config;
}
Axios.prototype.request = function (config) { //request函数
    return dispatch_request(config);
}
function dispatch_request(config) { //这里就不写发送请求的代码了，直接返回请求结果
    return xhr_adapter(config);
}

//取消请求
function cancel_token(executor) { //CancelToken构造函数（对应源码中的CancelToken.js）
    let resolve_promise; //声明变量
    this.promise = new Promise((resolve) => { //给实例对象添加promise属性
        resolve_promise = resolve; //将resolve暴露出去
    });
    executor(function () { //将修改promise状态的函数暴露给自己写的外层变量
        resolve_promise();
    });
}
function xhr_adapter(config) { //发送请求（对应源码中的xhr.js）
    return new Promise((resolve, reject) => {
        //发送Ajax请求
        const xhr = new XMLHttpRequest();
        xhr.open(config.method, config.url);
        xhr.send();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve({
                        status: xhr.status,
                        statusText: xhr.statusText
                    });
                } else {
                    reject(new Error("请求失败"));
                }
            }
        }
        //给promise对象绑定then方法，取消请求
        if (config.cancel_token) {
            config.cancel_token.promise.then(v => {
                xhr.abort();
                reject(new Error("请求已被取消"));
            });
        }
    });
}

//创建axios函数
const context = new Axios({});
const axios = Axios.prototype.request.bind(context);
