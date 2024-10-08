//构造函数
function Promise(executor) {
    this.PromiseState = 'pending';
    this.PromiseResult = undefined; //添加两个属性
    this.callback = undefined; //then回调函数
    const self = this; //保存实例对象的this值，要不resolve和reject的this指向window，也可以用箭头函数定义resolve和reject
    function resolve(value) { //执行器回调中的resolve
        if (self.PromiseState !== 'pending') return; //状态只能修改一次
        self.PromiseState = 'fulfilled'; //修改promise对象状态
        self.PromiseResult = value; //修改promise对象结果值
        if (self.callback.onResolved) { //如果先指定了回调，这块状态改变，就要执行成功的回调
            self.callback.onResolved(value);
        }
    }
    function reject(reason) { //构执行器回调中的reject
        if (self.PromiseState !== 'pending') return;
        self.PromiseState = 'rejected';
        self.PromiseResult = reason;
        if (self.callback.onRejected) {
            self.callback.onRejected(reason);
        }
    }
    try {
        executor(resolve, reject); //同步调用执行器函数
    } catch (e) {
        reject(e); //返回失败的promise对象
    }

}
//添加then方法
Promise.prototype.then = function (onResolved, onRejected) {
    if (this.PromiseState === 'fulfilled') {
        onResolved(this.PromiseResult);
    } else if (this.PromiseState === 'rejected') {
        onRejected(this.PromiseResult);
    } else { //状态为pending，保存回调函数
        this.callback = {
            onResolved,
            onRejected //简写：键名同键值
        };
    }
}