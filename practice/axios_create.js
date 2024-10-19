//Axios构造函数
function Axios(config) {
    //初始化
    this.default = config; //创建default默认配置对象
    this.intercepters = { //拦截器
        request: {},
        response: {}
    };
}
//原型上添加各种请求方法
Axios.prototype.request = function (config) { //发送Ajax请求（是各种发送请求函数的公用方法）
    console.log(`发送${config.method}请求`);
}
Axios.prototype.get = function (config) { //发送get请求
    return this.request({ method: 'GET' });
}
Axios.prototype.post = function (config) { //发送post请求
    return this.request({ method: 'POST' });
}
//Axios实例化
function create_instance(config) {
    const context = new Axios(config); //实例化对象，此时它可以调用方法，但不能当成函数使用
    const instance = Axios.prototype.request.bind(context); //instance是一个函数，它的this是context对象。此时instance不能调用方法
    //将Axios原型对象的方法添加到instance上
    Object.keys(Axios.prototype).forEach(key => { //遍历原型对象的方法（键名）
        instance[key] = Axios.prototype[key].bind(context); //让this始终为context对象
    });
    //将实例对象的default和拦截器属性添加到instance上
    Object.keys(context).forEach(key => { //遍历实例对象的属性（键名）
        instance[key] = context[key];
    });
    return instance;
}
const axios = create_instance();
axios({ method: 'GET' }); //当成函数使用
axios.post(); //当成对象，调用方法
