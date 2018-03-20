// Promise
function Promise(fn) {
    // 传进来对数据
    var value = null,
        // 存储传进来对.then的方法
        deferreds = [],
        // 存储一个状态进行状态值的一个判断
        state = 'pending';
    // .then方法
    this.then = function(onFulfilled, onRejected) {
        // 若为Promise链式调用返回一个Promise对象
        return new Promise(function (resolve, reject) {
            //调用一个内部函数
            handle({
                // 成功状态
                onFulfilled: onFulfilled || null,
                // 失败状态
                onRejected: onRejected || null,                    
                // 新建的一个Promise对象的成功回调
                resolve: resolve,
                // 新建的一个Promise对象的失败回调
                reject: reject                    
            });
        });        
        // 判断状态值若未执行push进去
        // if(state === 'pending') {
        //     deferreds.push(onFulfilled)
        //     return this;
        // }
        // 已执行直接执行回调
        // onFulfilled(value);
        // return this;
    }
    // .then执行时调用的内部函数
    function handle(deferred) {
        // 判断当前.then是否重新调用过reslove若调用了将.then放入deferreds执行队列
        if (state === 'pending') {
            deferreds.push(deferred);
            return;
        }
        // 判断状态确定执行成功回调还是失败回调若都为null为没有下一个.then
        var cb = state === 'fulfilled' ? deferred.onFulfilled : deferred.onRejected;
        // 创建一个变量用来存储回调
        var ret;
        // 直接返回
        if (cb === null) {
            cb = state === 'fulfilled' ? deferred.resolve : deferred.reject;
            cb(value);
            return;
        }
        // 错误处理
        try {
            // 将Promise函数内异步操作执行后的值放入到下一个.then中 
            ret = cb(value);
            // 执行回调
            deferred.resolve(ret);
        } catch (e) {
            // 执行回调
            deferred.reject(e);
        } 
        // var ret = deferred.onFulfilled(value);
        // 将Promise函数内异步操作执行后的值放入到下一个.then中            
        // ret = cb(value);            
        // 执行成功回调
        // deferred.resolve(ret);
    }        
    // 成功状态
    function resolve(newValue) {
        // 判断newValue是否为一个对象或者function若为对象证明又调用了resolve 若不是直接返回
        if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
            var then = newValue.then;
            // 若为一个函数异步操作
            if (typeof then === 'function') {
                // 将this指向Promise对象然后传入一个成功回调
                then.call(newValue, resolve);
                return;
            }
        }
        // 更改状态值
        state = 'fulfilled';
        // 将异步处理完成对数据放入value存储
        value = newValue;
        // setTimeout将resolve放到最后执行以防传输进来一个非异步操作先执行了让上面.then先执行            
        final()
    }

    // 失败回调
    function reject(reason) {
        state = 'rejected';
        value = reason;
        finale();
    }    

    function final() {
        setTimeout(function() {
            deferreds.forEach(function (deferred) {
                handle(deferred);
            });
            // 执行回调将异步操作的值返回
            // deferreds.forEach(function(cb) {
            //     cb(value)
            // })
        }, 0);
    }
    fn(resolve, reject);
}