class Promise {
    //构造函数
    constructor(executor) {
        this.PromiseState = 'pending';
        this.PromiseResult = undefined;
        this.callbacks = [];
        const self = this;
        function resolve(value) {
            if (self.PromiseState !== 'pending') return;
            self.PromiseState = 'fulfilled';
            self.PromiseResult = value;
            setTimeout(() => {
                self.callbacks.forEach(callback => {
                    callback.onResolved();
                });
            });
        }
        function reject(reason) {
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
            executor(resolve, reject);
        } catch (e) {
            reject(e);
        }
    }
    //添加then方法
    then(onResolved, onRejected) {
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
                    const result = func(self.PromiseResult);
                    if (result instanceof Promise) {
                        result.then(value => {
                            resolve(value);
                        }, reason => {
                            reject(reason);
                        });
                    } else {
                        resolve(result);
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
            if (this.PromiseState === 'pending') {
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
    catch(onRejected) {
        return this.then(undefined, onRejected);
    }
    //添加resolve方法
    static resolve(value) {
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
    static reject(reason) {
        return new Promise((resolve, reject) => {
            reject(reason);
        });
    }
    //添加all方法
    static all(promises) {
        let fulfilled_num = 0;
        const fulfilled_promises = [];
        return new Promise((resolve, reject) => {
            promises.forEach((promise, index) => {
                promise.then(value => {
                    fulfilled_num++;
                    fulfilled_promises[index] = value;
                    if (fulfilled_num === promises.length) {
                        resolve(fulfilled_promises);
                    }
                }, reason => {
                    reject(reason);
                });
            });
        });
    }
    //添加race方法
    static race(promises) {
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
}