//创建Axios
function Axios(config) { //Axios构造函数
    this.config = config;
    this.interceptors = {
        request: new interceptors_manager(),
        response: new interceptors_manager()
    }
}
Axios.prototype.request = function (config) { //request函数
    let promise = Promise.resolve(config); //创建promise对象
    const chains = [dispatch_request, undefined]; //创建chains数组
    this.interceptors.request.handlers.forEach(item => { //将请求拦截器中函数压入chains中
        chains.unshift(item.resolved, item.rejected);
    });
    this.interceptors.response.handlers.forEach(item => { //将响应拦截器中函数压入chains中
        chains.push(item.resolved, item.rejected);
    });
    while (chains.length > 0) { //当chains里还有元素时
        promise = promise.then(chains.shift(), chains.shift());
    }
    return promise;
}
function dispatch_request(config) { //这里就不写发送请求的代码了，直接返回请求结果
    return new Promise((resolve, reject) => {
        resolve({
            status: 200,
            statusText: "OK"
        });
    });
}
//创建实例，添加拦截器属性
const context = new Axios({});
const axios = Axios.prototype.request.bind(context); //axios函数，注意改request的this属性为实例对象，要不request中获取不到拦截器
Object.keys(context).forEach(key => {
    axios[key] = context[key];
});

//创建拦截器
function interceptors_manager() { //拦截器管理器构造函数
    this.handlers = [];
}
interceptors_manager.prototype.use = function (resolved, rejected) { //use方法
    this.handlers.push({ //将传入的回调压入数组
        resolved,
        rejected
    });
}
