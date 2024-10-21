function Axios(config) { //构造函数
    this.config = config;
}
Axios.prototype.request = function (config) { //发送请求
    //略过处理config的部分，直接创建成功的promise对象
    const promise = Promise.resolve(config);
    //声明数组
    const chains = [dispatch_request, undefined];
    //遍历数组（为简化操作，这里直接调用promise的then方法执行dispatch_request）
    const res = promise.then(chains[0], chains[1]);
    //返回调用结果
    return res;
}
function dispatch_request(config) { //dispatchRequest函数，返回promise对象，包括响应结果
    //调用适配器
    return xhr_adapter(config).then(response => {
        //对响应的结果进行处理（这里就不作处理了）
        return response;
    }, error => {
        throw error;
    });
}
function xhr_adapter(config) { //adapter适配器，返回promise对象，包括响应结果
    return new Promise((resolve, reject) => {
        //发送Ajax请求（这里只考虑请求方法和url）
        const xhr = new XMLHttpRequest();
        xhr.open(config.method, config.url);
        xhr.send();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve({ //如果请求发送成功就resolve
                        config: config, //配置对象
                        data: xhr.response, //响应体
                        header: xhr.getAllResponseHeaders(), //响应头
                        request: xhr, //xhr请求对象
                        status: xhr.status, //响应状态码
                        statusText: xhr.statusText //响应状态字符串
                    });
                } else { //失败就reject
                    reject(new Error(`请求失败，失败状态码为${xhr.status}`));
                }
            }
        }
    });
}
const axios = Axios.prototype.request.bind(null); //创建实例对象（为了方便就不进行绑定操作了）
