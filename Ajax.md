<a id="mulu">目录</a>
<a href="#mulu" class="back">回到目录</a>
<style>
    .back{width:40px;height:40px;display:inline-block;line-height:20px;font-size:20px;background-color:lightyellow;position: fixed;bottom:50px;right:50px;z-index:999;border:2px solid pink;opacity:0.3;transition:all 0.3s;color:green;}
    .back:hover{color:red;opacity:1}
    img{vertical-align:bottom;}
</style>

<!-- @import "[TOC]" {cmd="toc" depthFrom=3 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [基础概念](#基础概念)
- [原生Ajax](#原生ajax)
    - [基本使用](#基本使用)
    - [发送post请求](#发送post请求)
    - [IE缓存问题](#ie缓存问题)
    - [请求超时与网络异常处理](#请求超时与网络异常处理)
    - [取消请求](#取消请求)
    - [请求重复发送问题](#请求重复发送问题)
- [jQuery中的Ajax](#jquery中的ajax)
    - [get和post方法](#get和post方法)
    - [通用方法ajax](#通用方法ajax)
- [axios简介](#axios简介)
    - [get和post方法](#get和post方法-1)
    - [通用方法axios](#通用方法axios)
- [fetch方法](#fetch方法)
- [跨域](#跨域)
    - [同源策略](#同源策略)
    - [JSONP](#jsonp)
      - [原生JS](#原生js)
      - [jQuery](#jquery)
    - [CORS](#cors)

<!-- /code_chunk_output -->

<!-- 打开侧边预览：f1->Markdown Preview Enhanced: open...
只有打开侧边预览时保存才自动更新目录 -->

写在前面：此笔记来自b站课程[【尚硅谷】3小时Ajax入门到精通](https://www.bilibili.com/video/BV1WC4y1b78y) / [资料下载](https://pan.baidu.com/s/1BM_OKMXXAGxMNqaBN_7tRg#list/path=%2Fsharelink4035995002-565810062936917%2F%E5%B0%9A%E7%A1%85%E8%B0%B7%E5%89%8D%E7%AB%AF%E5%AD%A6%E7%A7%91%E5%85%A8%E5%A5%97%E6%95%99%E7%A8%8B&parentPath=%2Fsharelink4035995002-565810062936917) 提取码：afyt

### 基础概念
**AJAX**：Asynchronous Javascript And XML 异步的JS和XML
通过AJAX可以在浏览器中向服务器发送异步请求，可以实现**不刷新而获取数据**
**XML**：Extensible Markup Language 可扩展标记语言
用于传输和存储数据，和HTML类似，但XML中没有预定义标签，都是自定义标签，标签的名称和其中的值表示一条数据
```xml
<!-- {"name"": "'abc', "age": 18, "gender": 'male'} -->
<student>
    <name>abc</name>
    <age>18</age>
    <gender>male</gender>
</student>
```
早期的AJAX使用XML作数据传输，现在使用json

---

**优点**：
- 可以无需刷新页面而与服务器进行通信
- 允许根据用户实际来部分更新页面内容

**缺点**：
- 没有浏览历史，不能回退
- 存在跨域问题（默认情况下，a域名的网页不能向b域名的网页发送Ajax请求）
- SEO不友好（页面源代码中没有Ajax请求发送来的数据，爬虫爬不到）
### 原生Ajax
##### 基本使用
共4步：
```js
const xhr = new XMLHttpRequest(); //创建对象
xhr.open(请求方法, 请求url); //初始化，设置请求方法和url
xhr.send(); //发送请求
xhr.onreadystatechange = () => { //事件绑定，处理服务端返回的结果
    if (xhr.readyState === 4) { //当服务器返回了全部结果
        if (xhr.status >= 200 && xhr.status < 300) { //且响应状态正常时
            xhr.status //响应行中的状态码
            xhr.statusText //响应行中的状态字符串
            xhr.getAllResponseHeaders() //响应头的全部信息
            xhr.response //响应体
        }
    }
};
```
注：这部分是作为HTML中普通js代码写的，不是写在node中，也不需使用某个命令执行
- `xhr`是XMLHttpRequest的缩写，是Ajax独有的对象，只要看到它就说明使用了Ajax，浏览器f12的网络network中`Fetch/XHR`就是专门记录Ajax请求的
- 请求方法指get/post/...，请求url是服务端的url，里面还以写查询字符串，如`http://127.0.0.1:9000/server?a=100&b=200&c=300`等，它们都可以用express的`req.query`获取
- `readystate`是xhr对象中的属性，有5个值
  - 0--未初始化（刚声明时）
  - 1--初始化完毕（open方法执行完）
  - 2--已发送（send方法执行完）
  - 3--服务端返回部分结果
  - 4--服务端返回全部结果

  `onreadystatechange`就是当状态改变时触发，因为共有5种状态，所以该事件会触发4次，而我们只在服务器返回全部结果时进行下一步处理，所以要判断状态
- `status`是响应状态码，以2开头的都表示成功，只有响应成功时才进行下一步处理

**例1：建立HTTP服务，并在一个HTML中发送Ajax请求，将响应结果显示在页面中**
- 使用express建立服务，并启动：
    ```js
    const express = require("express");
    const app = express();
    app.get('/server', (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*'); //允许跨域
        res.send("hello AJAX"); //响应内容
    });
    app.listen(9000);
    ```
- HTML页面和Ajax请求
    ```html
    <body>
        <button>点击发送请求</button>
        <div id="res"></div>
    </body>
    <script>
        const btn = document.querySelector("button");
        const res = document.querySelector("#res");
        btn.addEventListener("click", () => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'http://127.0.0.1:9000/server');
            xhr.send();
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        console.log("响应状态码：", xhr.status);
                        console.log("响应状态字符串：", xhr.statusText);
                        console.log("响应头：", xhr.getAllResponseHeaders());
                        res.innerHTML = xhr.response;
                    }
                }
            };
        });
    </script>
    ```

点击按钮后：
![原生Ajax1](./md-image/原生Ajax1.png){:width=300 height=300}

---

**例2：处理服务端响应的json格式数据**
- 使用express建立服务，并启动：
    ```js
    const express = require("express");
    const app = express();
    app.get('/server', (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        const data = {
            name: "abc",
            age: 20
        };
        res.json(JSON.stringify(data));
    });
    app.listen(9000);
    ```
- HTML页面和Ajax请求：要接收json格式的数据，有两种方法
  - `onreadystatechange`事件中手动转换：`JSON.parse(xhr.response)`
  - （推荐）在声明`xhr`对象后设置响应体数据类型：`xhr.responseType = 'json'`，之后`xhr.response`就为对象形式
    ```html
    <body>
        <button>点击获取数据</button>
        <div id="res"></div>
    </body>
    <script>
        const btn = document.querySelector("button");
        const res = document.querySelector("#res");
        btn.addEventListener("click", () => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'http://127.0.0.1:9000/server');
            xhr.responseType = 'json';
            xhr.send("");
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        res.innerHTML = xhr.response;
                        //res.innerHTML = JSON.parse(xhr.response);
                    }
                }
            };
        });
    </script>
    ```

点击按钮后：
![原生Ajax3](./md-image/原生Ajax3.png){:width=200 height=200}
##### 发送post请求
在`xhr.open`后，事件绑定前：
```js
xhr.setRequestHeader('Content-Type', 请求体类型); //设置请求头
xhr.send(请求体内容);
```
也可以发送自定义请求头，但要更改服务端的路由设置
```js
app.all('/server', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); //允许跨域
    res.setHeader('Access-Control-Allow-Headers', '*'); //允许任意请求头
    res.send("hello AJAX"); //响应内容
});
```
为什么用`all`：发送了非预定义的请求头信息，需要进行预检（相当于身份校验），客户端会发送一个类型为`OPTIONS`的请求，只有这个请求被回应后，才能完成自定义请求头的发送

**例**：发送查询字符串、json格式请求体和自定义请求体
```js
/* 服务端 */
const express = require("express");
const body_parser = require("body-parser");
const app = express();
const json_parser = body_parser.json();
const urlencoded_parser = body_parser.urlencoded({ extended: false });
app.all('/json', json_parser, (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,XFILENAME,XFILECATEGORY,XFILESIZE"); //允许json格式请求体
    if (req.body.name) console.log(req.body);
    res.send("hello AJAX json");
});
app.post('/query', urlencoded_parser, (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log(req.body);
    res.send("hello AJAX query");
});
app.all('/server', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*'); //允许任意请求头
    if (req.get("name")) console.log(req.get("name"));
    res.send("hello AJAX POST");
});
app.listen(9000);
```
```html
<!-- 网页端 -->
<body>
    <button class="query">发送表单格式请求</button>
    <button class="json">发送json请求</button>
    <button class="headers">发送自定义请求头</button>
</body>
<script>
    const query = document.querySelector("button.query");
    const json = document.querySelector("button.json");
    const headers = document.querySelector("button.headers");
    query.addEventListener("click", () => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://127.0.0.1:9000/query');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send("a=200&b=300");
    });
    json.addEventListener("click", () => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://127.0.0.1:9000/json');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({ name: 'abc', age: 20 }));
    });
    headers.addEventListener("click", () => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://127.0.0.1:9000/server');
        xhr.setRequestHeader('name', 'abc');
        xhr.send("发送自定义请求头");
    });
</script>
```
![原生Ajax2](./md-image/原生Ajax2.png){:width=100 height=100}
[更多关于CORS请求和预检(preflight)](https://blog.csdn.net/think_A_lot/article/details/125528399)
##### IE缓存问题
IE浏览器会缓存服务器响应的结果，导致下一次AJAX请求得到的结果不是服务器响应的最新数据，而是采用上一次缓存的结果
解决方法：在请求url中加上时间戳，使每次的请求url不同
```js
const xhr = new XMLHttpRequest();
xhr.open('GET', 'http://127.0.0.1:9000/server?t=' + Date.now());
xhr.send("");
xhr.onreadystatechange = () => { console.log(xhr.response); };
```
##### 请求超时与网络异常处理
```js
xhr.timeout = ms时间; //经过多少ms后，如果没有响应则取消请求
xhr.ontimeout = ()=>{}; //超时的回调函数
xhr.onerror = ()=>{}; //网络异常的回调函数
```
例：
```js
/* 服务端 */
const express = require("express");
const app = express();
app.get('/timeout', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    setTimeout(() => {
        res.send("timeout");
    }, 3000); //延时3s再响应
});
app.listen(9000);
```
```js
/* 网页端 */
const xhr = new XMLHttpRequest();
xhr.timeout = 2000; //超时2s后取消请求
xhr.ontimeout = () => alert("连接超时");
xhr.onerror = () => alert("网络异常");
xhr.open('GET', 'http://127.0.0.1:9000/timeout');
xhr.send("");
xhr.onreadystatechange = () => { console.log(xhr.response); };
```
![原生Ajax4](./md-image/原生Ajax4.png){:width=300 height=300}
如何测试网络异常的效果：
![原生Ajax5](./md-image/原生Ajax5.png){:width=200 height=200}
![原生Ajax6](./md-image/原生Ajax6.png){:width=200 height=200}
##### 取消请求
在发送请求后，得到服务器响应前，可以手动取消请求
方法：`xhr.abort()`
**例：发送请求后，点击另一个按钮取消请求**
服务端仍用上面的延时3s，要不没时间点取消
```html
<!-- 网页端 -->
<body>
    <button class="send">发送请求</button>
    <button class="cancel">取消请求</button>
</body>
<script>
    const send = document.querySelector("button.send");
    const cancel = document.querySelector("button.cancel");
    let xhr = null; //在外面声明xhr，要不两个点击事件作用域不同
    send.addEventListener("click", () => {
        xhr = new XMLHttpRequest();
        xhr.open('GET', 'http://127.0.0.1:9000/server');
        xhr.send("");
    });
    cancel.addEventListener("click", () => {
        if (xhr) xhr.abort();
    });
</script>
```
![原生Ajax7](./md-image/原生Ajax7.png){:width=200 height=200}
##### 请求重复发送问题
即短时间多次发送重复请求，使服务器压力过大
解决思路：节流阀，当发送时上锁，收到响应结果时解锁
**例：服务器延迟2s响应，该过程中不能重复发送请求**
```js
/* 服务端 */
const express = require("express");
const app = express();
app.get('/server', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    setTimeout(() => {
        res.send(`现在的时间是：${(new Date()).toLocaleString()}`);
    }, 2000); //延时2s再响应
});
app.listen(9000);
```
```html
<!-- 网页端 -->
<body>
    <button class="send">发送请求</button>
    <div id="res"></div>
</body>
<script>
    const send = document.querySelector("button.send");
    const res = document.querySelector("#res");
    let have_sent = false; //是否已经发送请求
    send.addEventListener("click", () => {
        if (have_sent) return; //如果已经发送就退出
        have_sent = true; //正在发送，上锁
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'http://127.0.0.1:9000/server');
        xhr.send("");
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    res.innerHTML += (xhr.response + '<br>');
                    have_sent = false; //解锁
                }
            }
        };
    });
</script>
```
如图，一直点击发送请求按钮，也是每隔2s发送一次（等到服务器响应之后再发送下一次）
![原生Ajax8](./md-image/原生Ajax8.png){:width=200 height=200}
### jQuery中的Ajax
##### get和post方法
**get请求**：`$.get(url, [data], [callback], [type])`
**post请求**：`$.post(url, [data], [callback], [type])`
- `url`请求地址
- `data`请求携带的查询字符串(get)或表单数据(post)，以对象形式（键值对）传入
- `callback`成功得到响应数据时执行，该回调函数接收一个参数，是响应体
- `type`响应体类型，取值有`xml`、`html`、`script`、`json`、`text`（默认）

**例**：
```js
/* 服务端 */
const express = require("express");
const body_parser = require("body-parser");
const app = express();
const urlencoded_parser = body_parser.urlencoded({ extended: false });
app.get('/jq', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { a, b } = req.query;
    res.json({
        url: req.url,
        new_a: a * 10,
        new_b: b * 10
    });
});
app.post('/jq', urlencoded_parser, (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(`请求url为"${req.url}"，数据为"${JSON.stringify(req.body)}"`);
});
app.listen(9000);
```
```html
<!-- 网页端 -->
<body>
    <button class="get">发送get请求</button>
    <button class="post">发送post请求</button>
</body>
<script crossorigin="anonymous" src="https://cdn.bootcss.com/jquery/3.4.1/jquery.min.js"></script>
<script>
    $(".get").click(() => {
        $.get(
            'http://127.0.0.1:9000/jq',
            { a: 100, b: 200 },
            data => console.log(data),
            'json'
        );
    });
    $(".post").click(() => {
        $.post(
            'http://127.0.0.1:9000/jq',
            { name: 'abc', age: 20 },
            data => console.log(data),
            "text"
        );
    });
</script>
```
![jQuery中的Ajax1](./md-image/jQuery中的Ajax1.png){:width=150 height=150}
##### 通用方法ajax
```js
$.ajax({
    url: 请求url,
    data: 请求携带的参数（同get和post方法）,
    type: 请求类型('GET'/'POST'),
    success: 成功得到响应数据的回调函数，也是接收一个参数作为响应体数据,
    dataType: 响应体数据类型,
    timeout: 超时时间,
    error: 响应失败的回调函数,
    headers: 请求头（对象形式）
});
```
**例**：
```js
/* 服务端 */
const express = require("express");
const app = express();
app.post('/jq', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    setTimeout(() => {
        res.send();
    }, 2000);
});
app.all('/jq', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    const { a, b } = req.query;
    res.json({
        url: req.url,
        my_header: req.get("my_header"),
        new_a: a * 10,
        new_b: b * 10
    });
});
app.listen(9000);
```
```js
/* 网页端 */
$(".get").click(() => {
    $.ajax({
        type: 'GET',
        url: 'http://127.0.0.1:9000/jq',
        data: { a: 100, b: 200 },
        dataType: 'json',
        success: data => console.log(data),
        headers: { my_header: 'abc' }
    });
});
$(".post").click(() => {
    $.ajax({
        type: 'POST',
        url: 'http://127.0.0.1:9000/jq',
        timeout: 1000,
        error: err => console.log(err.statusText)
    });
});
```
![jQuery中的Ajax2](./md-image/jQuery中的Ajax2.png){:width=150 height=150}
### axios简介
**导入**：
```html
<script crossorigin="anonymous" src="https://cdn.bootcdn.net/ajax/libs/axios/0.19.2/axios.min.js"></script>
<!-- 或 -->
<script crossorigin="anonymous" src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
```
##### get和post方法
```js
axios.default.baseURL = 'xxx'; //可选项，如果在这设置了baseurl，下面的url就可以只写路径
axios.get(url, { //第二个参数是配置项
    params: {a: 100, b: 200}, //查询字符串
    headers: {name: 'abc'}, //请求头
    ...
}).then(value => {
    //value中存储着响应结果、状态等信息
});
axios.post(url, { //第二个参数是请求体
    username: 'abc',
    password: 'xxx' //以json格式传递
}, { //第三个参数是配置项（同get）
    params: {a: 100, b: 200}, //查询字符串
    headers: {name: 'abc'}, //请求头
    ...
}).then(value => {
    //value中存储着响应结果、状态等信息
});
```
**例**：
```js
/* 服务端 */
const express = require("express");
const app = express();
app.all('/axios', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    const data = { name: 'abc', age: 20 };
    res.json(data);
});
app.listen(9000);
```
```js
/* 网页端 */
const get_btn = document.querySelector('.get');
const post_btn = document.querySelector('.post');
get_btn.addEventListener("click", () => {
    axios.get('http://127.0.0.1:9000/axios', {
        params: { a: 100, b: 200 },
        headers: { my_header: 'qingqiutou' }
    }).then(value => {
        console.log(value);
    });
});
post_btn.addEventListener("click", () => {
    axios.post('http://127.0.0.1:9000/axios', {
        username: 'abc',
        password: 'woshimima'
    }, {
        params: { a: 100, b: 200 },
        headers: { my_header: 'qingqiutou' }
    }).then(value => {
        console.log(value);
    });
});
```
![axios简介1](./md-image/axios简介1.png){:width=200 height=200}
##### 通用方法axios
```js
axios({
    url: 'xxx',
    method: 'POST', //请求方法（默认为GET）
    params: {a: 100, b: 200}, //查询字符串
    headers: {my_header: 'header'}, //请求头
    data: {username: 'abc'}, //请求体
}).then(value => {
    //value中存储着响应结果、状态等信息
});
```
**例**：
```js
/* 网页端 */
const axios_btn = document.querySelector('.axios');
axios_btn.addEventListener("click", () => {
    axios.defaults.baseURL = 'http://127.0.0.1:9000';
    axios({
        url: '/axios',
        method: "POST",
        params: { a: 100, b: 200 },
        headers: { my_header: 'qingqiutou' }
    }).then(value => {
        console.log(value.status); //响应状态码
        console.log(value.statusText); //响应状态字符串
        console.log(value.headers); //响应头
        console.log(value.data); //响应体
    });
});
```
![axios简介2](./md-image/axios简介2.png){:width=100 height=100}
### fetch方法
是原生JS自带的发送Ajax请求的方法
```js
fetch(url, {
    method: 'POST', //请求方法
    headers: {my_header: 'header'}, //请求头
    body: 'username=abc&password=xxx', //请求体
}).then(response => {
    //response中存储着响应结果、状态等信息，但需要通过特殊方法获取
    return response.text(); //获取响应体（字符串）
    return response.json(); //获取响应体（json形式）
}).then(value => {
    console.log(value); //输出
});
```
注：如果需要查询字符串，可以写在url里，例如`http://127.0.0.1:9000?a=1&b=2`
**例**：
```js
const btn = document.querySelector('.fetch');
btn.addEventListener("click", () => {
    fetch('http://127.0.0.1:9000/fetch', {
        method: 'POST',
        headers: { my_header: 'header' },
        body: 'username=abc&password=woshimima'
    }).then(response => {
        console.log(response);
        console.log(response.status); //响应状态码
        console.log(response.statusText); //响应状态字符串
        console.log(response.headers.get('Content-Type')); //响应头
        return response.json(); //响应体
    }).then(value => {
        console.log(value); //输出
    });
});
```
![fetch方法1](./md-image/fetch方法1.png){:width=300 height=300}
**await版本**：
```js
async function get_body(url, method = 'GET') { //以json格式返回响应体
    const res = await fetch(url, {
        method: method,
    });
    return res.json();
}
const btn = document.querySelector('.fetch');
btn.addEventListener("click", () => {
    get_body('http://127.0.0.1:9000/fetch', 'POST').then(v => {
        console.log(v); //{name: 'abc', age: 20}
    });
});
```
### 跨域
##### 同源策略
是浏览器的一种安全机制
**同源**：网页url与Ajax请求的目标资源url的协议、域名、端口号相同
**跨域**：违背同源策略，比如http协议向https协议发请求、`a.com`向`b.com`发请求、8000端口向3000端口发请求
注意：默认情况下，Ajax请求必须遵循同源策略
**例：同源发送Ajax请求**
将一个网页作为响应内容，使其协议、域名、端口号都与服务端相同，在这个网页中发送Ajax请求就是同源的
```js
/* 服务端 */
const express = require("express");
const app = express();
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
app.get('/data', (req, res) => {
    res.send("发送数据");
});
app.listen(9000);
```
```html
<!-- index.html -->
<button>点击获取数据</button>
<script>
    const btn = document.querySelector("button");
    btn.addEventListener("click", () => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/data'); //因为是同源的，可省略域名、协议、端口号
        xhr.send();
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    console.log(xhr.response);
                }
            }
        };
    });
</script>
```
![跨域1](./md-image/跨域1.png){:width=400 height=400}
##### JSONP
JSONP(JSON with Padding)是一个非官方的跨域解决方案，只支持get请求
###### 原生JS
**原理**：网页中有一些标签天生具有跨域能力，如img、script、iframe、script等，比如在一个HTML文件中使用script标签引入其它的js文件，无论这个js文件的协议、域名、端口号是否与html文件的相同，都可以正常引入。JSONP就是利用script标签的跨域能力发送请求的
**实现思路**：在html文件中创建script标签，其src为要请求的url，服务端响应一段js代码（因为script标签只能解析js代码，如果是其它格式会报错），此时浏览器就会自动执行响应的js代码
**例1**：服务端响应一段数据，并将其写到一个div中
可以先写好对数据的处理函数，服务端响应的js代码直接调用这个函数
```html
<!-- 网页端 -->
<body>
    <div id="res"></div>
    <script>
        function handle(data) {
            const res = document.querySelector("#res");
            res.innerHTML = data;
        }
    </script>
    <script src="http://127.0.0.1:9000/jsonp"></script>
</body>
```
```js
/* 服务端 */
const express = require("express");
const app = express();
app.all('/jsonp', (req, res) => {
    const data = {
        name: 'abc',
        age: 20
    };
    const str = JSON.stringify(data);
    res.send(`handle('${str}')`);
});
app.listen(9000);
```
![跨域2](./md-image/跨域2.png){:width=100 height=100}
**例2**：有一个文本框，可输入文字（用户名），当输入完成、丢失焦点后，向服务端发送Ajax请求，检测当前用户名是否存在，如不存在则改变文本框边框颜色
**主要问题：动态创建script标签**
因为每次触发事件都需要发一次Ajax请求，需要重复创建script标签
方法：
```js
const script = document.createElement("script");
script.src = "请求的url";
document.body.appendChild(script); //插入到文档中
```
完整实现：
```html
<!-- 网页端 -->
<body>
    用户名：<input type="text" name="username" id="username">
    <p class="username"></p>
    <script>
        const input = document.querySelector("#username");
        const p = document.querySelector("p.username");
        function change_input(res) {
            input.style.border = res.exist === 1 ? "solid 1px #f00" : "none";
            p.innerHTML = res.msg;
        }
        input.addEventListener("blur", () => {
            const username = input.value;
            const script = document.createElement("script");
            script.src = `http://127.0.0.1:9000/username?username=${username}`;
            document.body.appendChild(script);
        });
    </script>
</body>
```
```js
/* 服务端 */
const express = require("express");
const app = express();
app.all('/username', (req, res) => {
    const exist_username = ['abc', 'bcd', 'cde']; //存在的用户名
    const username = req.query.username; //用户输入的用户名
    const is_exist = exist_username.includes(username);
    const res_str = JSON.stringify({
        exist: is_exist ? 1 : 0,
        msg: is_exist ? "用户名已经存在" : ""
    }); //将对象转成字符串格式
    res.send(`change_input(${res_str})`); //因为模板字符串的引号被省略，传参的时候就是{}对象的形式，网页端无需再重转回对象
});
app.listen(9000);
```
![跨域3](./md-image/跨域3.png){:width=200 height=200}
![跨域4](./md-image/跨域4.png){:width=150 height=150}
###### jQuery
方法与原生JS不同，更加简单
```js
/* 网页端 */
$.getJSON('http://127.0.0.1:9000?callback=?', data => {
    //data即为服务端返回的数据，在这里面可以对其进行处理
});
/* 服务端 */
app.get('xxx', (req, res) => {
    const callback = req.query.callback;
    res.send(`${callback}(${str})`); //str为要返回的数据
});
```
注：`getJSON`函数传入url中的`callback=?`查询字符串为固定写法
可以理解为：jQuery内置了一个可以处理json数据的函数(callback)，只要在服务端调用该函数就行了，不用再自己写一个handle函数
**例**：点击按钮响应一段数据
```html
<!-- 网页端 -->
<body>
    <button>发送JSONP请求</button>
    <div class="res"></div>
    <script>
        const btn = $('button').eq(0);
        const res = $(".res");
        btn.on("click", () => {
            $.getJSON("http://127.0.0.1:9000/jsonp?callback=?", data => {
                res.html(`
                name: ${data.name},<br>
                age: ${data.age}
            `);
            });
        });
    </script>
</body>
```
```js
/* 服务端 */
const express = require("express");
const app = express();
app.get('/jsonp', (req, res) => {
    const data = {
        name: 'abc',
        age: 20
    };
    const str = JSON.stringify(data);
    const callback = req.query.callback;
    res.send(`${callback}(${str})`);
});
app.listen(9000);
```
![跨域5](./md-image/跨域5.png){:width=100 height=100}
![跨域6](./md-image/跨域6.png){:width=100 height=100}
##### CORS
CORS(Cross-Origin Resource Sharing)跨域资源共享，是官方的跨域解决方案。跨域资源共享标准新增了一组HTTP首部字段，运行服务器声明哪些资源站有权通过浏览器访问哪些资源
- 特点：不需在客户端做特殊操作，完全在服务端进行处理
- 支持get和post请求
- 原理：设置一个响应头来告诉浏览器，该请求允许跨域，浏览器收到该响应后就会对其放行

可以设置的响应头：
- `Access-Control-Allow-Origin: 允许跨域的url`
  注：一般情况下`允许的url`都写成`"*"`，表示允许所有的url，下面类似
- `Access-Control-Expose-Headers: 允许暴露的响应头`，即允许浏览器通过`xhr.getAllResponseHeaders()`获取哪些响应头
- `Access-Control-Max-Age: 预检结果缓存多少秒`，在缓存时间内，下一次发送请求就不会预检
- `Access-Control-Allow-Credentials: true`跨域请求时是否能携带验证信息（如cookie）
- `Access-Control-Allow-Methods: 请求允许的方法`，默认是get和post
- `Access-Control-Allow-Headers: 允许的请求头`，即跨域请求允许携带的请求头

[更多关于CORS](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS)
**例**：点击按钮响应一段数据
```html
<!-- 网页端 -->
<body>
    <button>发送JSONP请求</button>
    <div class="res"></div>
    <script>
        const btn = document.querySelector("button");
        const res = document.querySelector(".res");
        btn.addEventListener("click", () => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'http://127.0.0.1:9000/cors');
            xhr.send();
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        const data = JSON.parse(xhr.response);
                        res.innerHTML = `
                            name: ${data.name},<br>
                            age: ${data.age}
                        `;
                    }
                }
            };
        });
    </script>
</body>
```
```js
/* 服务端 */
const express = require("express");
const app = express();
app.get('/cors', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); //允许跨域
    const data = {
        name: 'abc',
        age: 20
    };
    res.json(data);
});
app.listen(9000);
```
![跨域7](./md-image/跨域7.png){:width=100 height=100}
