<a id="mulu">目录</a>
<a href="#mulu" class="back">回到目录</a>
<style>
    .back{width:40px;height:40px;display:inline-block;line-height:20px;font-size:20px;background-color:lightyellow;position: fixed;bottom:50px;right:50px;z-index:999;border:2px solid pink;opacity:0.3;transition:all 0.3s;color:green;}
    .back:hover{color:red;opacity:1}
    img{vertical-align:bottom;}
</style>

<!-- @import "[TOC]" {cmd="toc" depthFrom=3 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [测试环境](#测试环境)
- [基本使用](#基本使用)
    - [发送Ajax请求](#发送ajax请求)
    - [响应结果的结构](#响应结果的结构)
    - [配置对象的其它参数](#配置对象的其它参数)

<!-- /code_chunk_output -->

<!-- 打开侧边预览：f1->Markdown Preview Enhanced: open...
只有打开侧边预览时保存才自动更新目录 -->

写在前面：此笔记来自b站课程[尚硅谷Web前端axios入门与源码解析](https://www.bilibili.com/video/BV1wr4y1K7tq) / [资料下载](https://pan.baidu.com/s/1TddRdJ-jsW53K8Gx-4pErw) 提取码：25lx

### 测试环境
使用json-server包：`npm i -g json-server`
创建`db.json`：
```json
{
  "posts": [
    { "id": "1", "title": "a title", "views": 100 },
    { "id": "2", "title": "another title", "views": 200 }
  ],
  "comments": [
    { "id": "1", "text": "a comment about post 1", "postId": "1" },
    { "id": "2", "text": "another comment about post 1", "postId": "1" }
  ],
  "profile": {
    "name": "typicode"
  }
}
```
启动服务：`json-server --watch db.json`
注：必须在`db.json`所在文件夹内的终端启动服务
### 基本使用
axios是一个基于promise的HTTP客户端，可以在浏览器和nodejs环境中运行
- 在浏览器端可以向服务端发送Ajax请求
- 在服务端可以发送HTTP请求

引入：
```html
<script src="https://cdn.bootcdn.net/ajax/libs/axios/0.21.1/axios.min.js"></script>
```
##### 发送Ajax请求
```js
//通用方法axios
axios({
    url: 'xxx',
    method: 'POST', //请求方法（默认为GET）
    params: {a: 100, b: 200}, //查询字符串
    headers: {my_header: 'header'}, //请求头
    data: {username: 'abc'}, //请求体
}).then(value => {
    //value中存储着响应结果、状态等信息
});
//request方法
axios.request({}).then(value => {}) //使用方法同axios

//get方法--发送get请求
axios.get(url, { //第二个参数是配置项
    params: {a: 100, b: 200}, //查询字符串
    headers: {name: 'abc'}, //请求头
}).then(value => {
    //value中存储着响应结果、状态等信息
});
//delete方法--发送delete请求
axios.delete({}).then(value => {}) //使用方法同get

//post方法--发送post请求
axios.post(url, { //第二个参数是请求体
    username: 'abc',
    password: 'xxx' //以json格式传递
}, { //第三个参数是配置项（同get）
    params: {a: 100, b: 200}, //查询字符串
    headers: {name: 'abc'}, //请求头
}).then(value => {
    //value中存储着响应结果、状态等信息
});
//put方法--发送put请求
axios.put({}).then(value => {}) //使用方法同post
//patch方法--发送patch请求
axios.patch({}).then(value => {}) //使用方法同post
```
**例**：分别发送GET、POST、PUT、DELETE请求
```html
<body>
    <button>发送GET请求</button>
    <button>发送POST请求</button>
    <button>发送PUT请求</button>
    <button>发送DELETE请求</button>
    <script>
        const btn = document.querySelectorAll("button");
        btn[0].addEventListener("click", () => {
            //获取第二篇post
            axios({
                method: 'GET',
                url: "http://localhost:3000/posts/2",
            }).then(res => {
                console.log(res);
            });
        });
        btn[1].addEventListener("click", () => {
            //添加一篇post
            axios({
                method: 'POST',
                url: "http://localhost:3000/posts",
                data: {
                    title: "woshibiaoti",
                    views: 300
                }
            }).then(res => {
                console.log(res);
            });
        });
        btn[2].addEventListener("click", () => {
            //更新第二篇post信息
            axios({
                method: 'PUT',
                url: "http://localhost:3000/posts/2",
                data: {
                    title: "another title",
                    views: 201
                }
            }).then(res => {
                console.log(res);
            });
        });
        btn[3].addEventListener("click", () => {
            //删除第一篇post
            axios({
                method: 'DELETE',
                url: "http://localhost:3000/posts/1",
            }).then(res => {
                console.log(res);
            });
        });
    </script>
</body>
```
##### 响应结果的结构
![响应结果的结构](./md-image/响应结果的结构.png){:width=400 height=400}
- `config`：配置对象，包括请求url、请求类型、请求头、请求体等
- `data`：响应体，是一个对象（或一个元素为对象的数组），axios自动对服务器响应内容解析，转成对象的形式
- `headers`：响应头
- `request`：原生的Ajax请求对象`XMLHttpRequest`
- `status`：响应状态码
- `statusText`：响应状态字符串
##### 配置对象的其它参数
- `baseurl`：设定请求url的基础结构（协议和域名），这样url只写路径即可，在发送请求时axios会将其与url进行拼接
  比如在上例中，可以设置`baseurl: "http://localhost:3000/"`，这样url就可只写`"/posts/2"`
- `transformRequest`和`transformResponse`：分别对请求体数据和响应体数据进行处理
  ```js
  transformResponse: [function (data) {
    //处理数据
    return data;
  }]
  ```
- `paramsSerializer`（使用较少）：对查询字符串进行格式转换，比如`/post/a.100/b.200`
- `data`：请求体，如果是字符串就直接传递（如`a=100&b=200`，如果是对象就转成json字符串传递）
- `timeout`：超时时间，单位为ms，默认为0（没有超时限制），如果超过这个时间没有得到响应，就会返回reject的promise对象且取消请求
- 