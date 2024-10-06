<a id="mulu">目录</a>
<a href="#mulu" class="back">回到目录</a>
<style>
    .back{width:40px;height:40px;display:inline-block;line-height:20px;font-size:20px;background-color:lightyellow;position: fixed;bottom:50px;right:50px;z-index:999;border:2px solid pink;opacity:0.3;transition:all 0.3s;color:green;}
    .back:hover{color:red;opacity:1}
    img{vertical-align:bottom;}
</style>

<!-- @import "[TOC]" {cmd="toc" depthFrom=3 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [基础部分](#基础部分)
    - [promise简介](#promise简介)
    - [基本使用](#基本使用)
      - [promise的状态和结果值](#promise的状态和结果值)
      - [工作流程](#工作流程)
    - [其它常用API](#其它常用api)
      - [catch](#catch)
      - [resolve和reject](#resolve和reject)
      - [all和race](#all和race)
    - [util包的promisify方法](#util包的promisify方法)

<!-- /code_chunk_output -->

<!-- 打开侧边预览：f1->Markdown Preview Enhanced: open...
只有打开侧边预览时保存才自动更新目录 -->

写在前面：此笔记来自b站课程[尚硅谷Web前端Promise教程从入门到精通](https://www.bilibili.com/video/BV1GA411x7z1) P1-P / [资料下载](https://pan.baidu.com/s/1BM_OKMXXAGxMNqaBN_7tRg#list/path=%2Fsharelink4035995002-565810062936917%2F%E5%B0%9A%E7%A1%85%E8%B0%B7%E5%89%8D%E7%AB%AF%E5%AD%A6%E7%A7%91%E5%85%A8%E5%A5%97%E6%95%99%E7%A8%8B&parentPath=%2Fsharelink4035995002-565810062936917) 提取码：afyt
### 基础部分
##### promise简介
ES6提供的异步编程解决方案（原来使用的都是回调函数），是一个构造函数，用来封装一个异步操作并可以获取其成功/失败的结果值
**最大的特点**：支持==链式调用==，解决==回调地狱==问题——即回调函数多层嵌套，外部回调函数异步执行的结果是内层回调执行的条件，不便于阅读和异常处理
**解决方法**：使用更灵活的方式指定回调函数。原来必须在启动异步任务前指定回调函数，而promise是先启动异步任务->返回promise对象->给promise对象绑定回调函数（可在异步任务结束后指定多个）
##### 基本使用
```js
const p = new Promise((resolve, reject) => {
    resolve(value);
    reject(reason);
}
p.then((value)=>{}, (reason)=>{});
```
- promise是一个构造函数，`new Promise()`是实例化过程，`p`就是创建的示例对象
- 该构造函数接收一个回调函数，被称为**执行器函数**，其中有两个形参，都是函数类型，通常情况下（默认规则）：
  - `resolve`当异步任务成功时调用
  - `reject`当异步任务失败时调用

  这两个函数都可以接收0或1个参数，并将这个参数传给下面的then；如果不想传参，也可以省略不写
- `p.then`接收两个函数——`onResolved()`和`onRejected()`，分别对应上面的`resolve`和`reject`，相当于把成功/失败时执行的函数移到then中来写

注：
- 执行器函数是和Promise构造函数同时调用的，即代码执行到创建Promise对象时，会立即运行执行器函数里面的代码；而执行器中的`resolve`和`reject`函数都是异步的，会等到外层代码全部执行完再执行（类似于定时器）
    ```js
    new Promise((resolve, reject) => {
        console.log("Promise执行器");
        resolve();
    }).then(() => console.log("resolve函数"));
    console.log("Promise对象外");
    ```
    ![promise的基本使用1](./md-image/promise的基本使用1.png){:width=70 height=70}
- then里面两个函数的`value`、`reason`类似于`resolve`、`reject`，都是习惯写法，写成别的也可以

**例1：利用promise发送ajax请求**
```js
    document.querySelector(".get").addEventListener("click", () => {
        new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'http://127.0.0.1:9000/server');
            xhr.send();
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(xhr.response);
                    } else {
                        reject(xhr.status);
                    }
                }
            };
        }).then(value => {
            console.log(value);
        }, reason => {
            console.log("发送失败，状态码为" + reason);
        });
    });
```
**例2：将上面的get请求封装成一个函数，接收url作为参数，返回promise对象**
```js
function send_ajax(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.send();
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.response);
                } else {
                    reject(xhr.status);
                }
            }
        };
    });
}
document.querySelector(".get").addEventListener("click", () => {
    send_ajax('http://127.0.0.1:9000/server')
        .then(value => {
            console.log(value);
        }, reason => {
            console.log("发送失败，状态码为" + reason);
        });
});
```
###### promise的状态和结果值
**状态**：是promise实例对象的一个属性`PromiseState`，有三种可能值：
- `pending`未决定的（初始化时的默认值）
- `resolved`/`fullfilled`成功
- `rejected`失败

因为一个promise对象的状态只能改变一次。所以只有两种可能的状态转换：
- `pending`->`resolved`
- `pending`->`rejected`

这两种状态转变都会有一个**结果值**，也是promise实例对象的一个属性`PromiseResult`，默认为undefined，它只能被上面的`resolve`和`reject`函数修改
事实上，向这两个函数中传入参数，就是修改该属性的值，后面的`value`和`reason`参数就是取出该属性值
以上面的`send_ajax`函数为例：
```js
const p = send_ajax('http://127.0.0.1:9000/server');
console.log(p);
document.querySelector(".get").addEventListener("click", () => {
    console.log("发送请求");
    send_ajax('http://127.0.0.1:9000/server')
        .then(value => {
            console.log(p);
            console.log(value);
        }, reason => {
            console.log(p);
            console.log(reason);
        });
});
```
- 如果不在`resolve`和`reject`中传入参数：
    ![promise的状态和结果值1](./md-image/promise的状态和结果值1.png){:width=100 height=100}
- 如果在`resolve`和`reject`中传入参数：
    ![promise的状态和结果值2](./md-image/promise的状态和结果值2.png){:width=100 height=100}
###### 工作流程
![promise工作流程](./md-image/promise工作流程.png){:width=150 height=150}
- 封装promise对象（pending状态），执行异步操作
- 若成功则执行`resolve()`方法，将promise对象改为resolved状态，之后执行then中的第一个回调`onResolved()`
- 若失败则执行`reject()`方法，将promise对象改为rejected状态，之后执行then中的第二个回调`onRejected()`
- 最后都返回一个**新**的promise对象
##### 其它常用API
###### catch
类似于then方法，只是它只接收失败的回调函数：`p.catch(reason=>{})`
实际上，`p.catch(onRejected)`就是`p.then(null, onRejected)`
```js
new Promise((resolve, reject) => {
    reject("111");
}).catch(reason => console.log("catch失败回调"));
```
###### resolve和reject
`Promise.resolve(value/promise对象)`
- 当传入的参数为非Promise对象时，返回一个状态为成功的Promise对象，其结果值为传入的那个参数`value`
- 当传入一个Promise对象时，该Promise对象的结果决定了函数的返回值，即resolve会将传入的这个Promise对象返回

```js
const p1 = Promise.resolve("resolve中传入非Promise对象值");
const p_resolve = new Promise((resolve, reject) => {
    resolve("我是resolve的Promise对象");
});
p_resolve.then(value => console.log(value), reason => console.log(reason));
const p_reject = new Promise((resolve, reject) => {
    reject("我是reject的Promise对象");
});
p_reject.catch(reason => console.log(reason));
const p2 = Promise.resolve(p_resolve);
const p3 = Promise.resolve(p_reject);
console.log(p1, p2, p3);
console.log(p2 === p_resolve, p3 === p_reject);
```
![其它常用API1](./md-image/其它常用API1.png){:width=100 height=100}

---

`Promise.reject(reason)`返回一个状态为失败的Promise对象，其结果值为传入的那个参数`reason`
注：`reason`不仅可以为基本数据类型，还可以为一个Promise对象，但与上面的resolve不同，reject只会把传入的参数作为新Promise对象的结果值
```js
const p_resolve = new Promise((resolve, reject) => {
    resolve("我是resolve的Promise对象");
});
p_resolve.then(value => console.log(value), reason => console.log(reason));
console.log(Promise.reject("resolve中传入基本数据类型参数"));
console.log(Promise.reject(p_resolve));
```
![其它常用API2](./md-image/其它常用API2.png){:width=200 height=200}
注：报错是因为没给reject返回的Promise对象写then/catch方法，不用在意，下同
###### all和race
`Promise.all(promise_list)`/`Promise.race(promise_list)`：都接收一个元素为Promise对象的数组，并返回一个新的Promise对象
- `all`：
  - 如果传入的Promise数组中有状态为失败的Promise对象，则返回的Promise对象状态也为失败，结果值为数组中第一个失败的Promise对象的结果值
  - 如果都为成功，则返回的Promise状态就为成功，结果值为所有传入的Promise对象
- `race`：返回的状态和结果值都取决于数组中第一个状态发生改变的Promise对象

例：`all`
```js
const p_resolve1 = new Promise((resolve, reject) => {
    resolve("我是resolve的Promise对象1");
});
const p_resolve2 = new Promise((resolve, reject) => {
    resolve("我是resolve的Promise对象2");
});
const p_reject1 = new Promise((resolve, reject) => {
    reject("我是reject的Promise对象1");
});
const p_reject2 = new Promise((resolve, reject) => {
    reject("我是reject的Promise对象2");
});
console.log(Promise.all([p_resolve1, p_resolve2]));
console.log(Promise.all([p_resolve1, p_resolve2, p_reject1, p_reject2]));
```
![其它常用API3](./md-image/其它常用API3.png){:width=200 height=200}
注：all如果返回失败的Promise对象，其结果值是取决于第一个状态**变为**失败的Promise对象。如果给上面的`p_reject1`加上一个settimeout，让其比`p_reject2`晚失败，则返回的结果值就是`p_reject2`的
在`race`的例子中可以更清晰的体现这一点：
```js
const p1 = new Promise((resolve, reject) => {
    setTimeout(() => resolve("我是resolve的Promise对象1"), 2000);
});
const p2 = new Promise((resolve, reject) => {
    setTimeout(() => reject("我是resolve的Promise对象2"), 1000);
});
console.log(Promise.race([p1, p2]));
```
![其它常用API4](./md-image/其它常用API4.png){:width=80 height=80}
可以理解成几个Promise在race（赛跑），谁先完成结果就是谁
##### util包的promisify方法
是nodejs的一个模块，用于将“错误优先的回调风格函数”（即以`(err, data)=>{}`回调作为最后一个参数的函数）转为promise风格的版本
**例**：封装一个函数`mine_readfile`读取文件内容，接收参数`path`文件路径，返回promise对象——在读取出错时执行`reject`回调，输出错误信息；读取成功则执行`resolve`回调，输出文件内容
- 正常promise写法：
    ```js
    function mine_readfile(path) {
        return new Promise((resolve, reject) => {
            require("fs").readFile(path, (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });
    }
    mine_readfile(__dirname + '/test.txt')
        .then(value => {
            console.log(value.toString());
        }, reason => {
            console.log(reason);
        });
    ```
- 使用`util.promisify`：
    ```js
    const util = require("util");
    const mine_readfile = util.promisify(require("fs").readFile);
    mine_readfile(__dirname + '/test.txt')
        .then(value => {
            console.log(value.toString());
        }, reason => {
            console.log(reason);
        });
    ```

可以看到，对于其它类似格式的函数，无需手动封装，可以借助util包来转为promise风格的函数
