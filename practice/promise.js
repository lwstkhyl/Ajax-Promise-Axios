//构造函数
function Promise(executor) {
    this.PromiseState = 'pending';
    this.PromiseResult = undefined; //添加两个属性
    this.callbacks = []; //then回调函数
    const self = this; //保存实例对象的this值，要不resolve和reject的this指向window，也可以用箭头函数定义resolve和reject
    function resolve(value) { //执行器回调中的resolve
        if (self.PromiseState !== 'pending') return; //状态只能修改一次
        self.PromiseState = 'fulfilled'; //修改promise对象状态
        self.PromiseResult = value; //修改promise对象结果值
        setTimeout(() => {
            self.callbacks.forEach(callback => { //如果先指定了回调，这块状态改变，就要执行成功的回调
                callback.onResolved();
            });
        });
    }
    function reject(reason) { //构执行器回调中的reject
        if (self.PromiseState !== 'pending') return;
        self.PromiseState = 'rejected';
        self.PromiseResult = reason;
        setTimeout(() => {
            self.callbacks.forEach(callback => {
                callback.onRejected();
            });
        });
    }
    try {
        executor(resolve, reject); //同步调用执行器函数
    } catch (e) {
        reject(e); //返回失败的promise对象
    }
}
//添加then方法
Promise.prototype.then = function (onResolved, onRejected) {
    const self = this;
    if (typeof onResolved !== 'function') {
        onResolved = value => value;
    }
    if (typeof onRejected !== 'function') {
        onRejected = reason => {
            throw reason;
        };
    }
    return new Promise((resolve, reject) => {
        function callback(func) {
            try {
                const result = func(self.PromiseResult); //回调函数返回的值
                if (result instanceof Promise) { //返回一个promise对象
                    result.then(value => {
                        resolve(value);
                    }, reason => {
                        reject(reason);
                    });
                } else { //返回一个值
                    resolve(result); //状态为成功，结果值为返回的值
                }
            } catch (e) {
                reject(e);
            }
        }
        if (this.PromiseState === 'fulfilled') {
            setTimeout(() => {
                callback(onResolved);
            });
        }
        if (this.PromiseState === 'rejected') {
            setTimeout(() => {
                callback(onRejected);
            });
        }
        if (this.PromiseState === 'pending') { //状态为pending，保存回调函数
            const func = {
                onResolved: function () {
                    callback(onResolved);
                },
                onRejected: function () {
                    callback(onRejected);
                }
            };
            this.callbacks.push(func);
        }
    });
}
//添加catch方法
Promise.prototype.catch = function (onRejected) {
    return this.then(undefined, onRejected);
}
//添加resolve方法
Promise.resolve = function (value) {
    return new Promise((resolve, reject) => {
        if (value instanceof Promise) {
            value.then(v => {
                resolve(v);
            }, r => {
                reject(r);
            });
        } else {
            resolve(value);
        }
    });
}
//添加reject方法
Promise.reject = function (reason) {
    return new Promise((resolve, reject) => {
        reject(reason);
    });
}
//添加all方法
Promise.all = function (promises) {
    let fulfilled_num = 0; //有几个promise对象成功了
    const fulfilled_promises = []; //存放所有成功的promise对象的结果值
    return new Promise((resolve, reject) => {
        promises.forEach((promise, index) => {
            promise.then(value => {
                fulfilled_num++;
                fulfilled_promises[index] = value; //为保证顺序不变，不用push
                if (fulfilled_num === promises.length) { //不能用index，因为可能最后一个promise先成功，这时会导致遍历提前结束（index===length）
                    resolve(fulfilled_promises); //所有promise都成功，将结果promise的状态也设为成功
                }
            }, reason => {
                reject(reason); //遇到失败的promise，就改变结果promise的状态和结果值。因为状态只能改变一次，无需return
            });
        });
    });
}
//添加race方法
Promise.race = function (promises) {
    return new Promise((resolve, reject) => {
        promises.forEach((promise, index) => {
            promise.then(value => {
                resolve(value);
            }, reason => {
                reject(reason);
            });
        });
    });
}