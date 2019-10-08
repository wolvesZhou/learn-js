# 理解this

this指向问题是JavaScript中最复杂的机制之一，被自动定义在所有函数的作用域中。

```js
var number = 5;
var obj = {
    number: 3,
    fn1: (function () {
        var number;
        this.number *= 2;
        number = number * 2;
        number = 3;
        return function () {
            var num = this.number;
            this.number *= 2;
            console.log(num);
            number *= 3;
            console.log(number);
        }
    })()
}
var fn1 = obj.fn1;
fn1.call(null);
obj.fn1();
console.log(window.number);

```

### this是什么
this就是一个指针，指向调用函数的对象。
this的绑定规则有哪些：
1. 默认绑定
2. 显式绑定
3. 隐式绑定
4. new 绑定

#### 默认绑定
this指向全局对象（非严格模式），严格模式下指向undefined。

#### 隐式绑定
函数的调用是在某个对象上触发的，即调用位置上存在上下文对象。

需要注意的是：对象属性链中只有最后一层会影响到调用位置。
```js
function sayHi(){
    console.log('Hello,', this.name);
}
var person2 = {
    name: 'Christina',
    sayHi: sayHi
}
var person1 = {
    name: 'YvetteLau',
    friend: person2
}
person1.friend.sayHi();
```
输出Hello，Christina。

因为只有最后一层会确定this指向的是什么，不管有多少层，在判断this的时候，我们只关注最后一层，即此处的friend。

隐式绑定有一个大陷阱，即绑定很容易丢失。

```
function sayHi(){
    console.log('Hello,', this.name);
}
var person = {
    name: 'YvetteLau',
    sayHi: sayHi
}
var name = 'Wiliam';
var Hi = person.sayHi;
Hi();
```
Hi直接指向了sayHi的引用，在调用的时候，和person没有关系。如果xxx.fn(),fn前面没有指定对象，那么肯定不是隐式绑定。

#### 显式绑定
显式绑定就是通过call，apply，bind的方式，显式地指定this所指向的对象。

使用显式绑定也会出现绑定丢失。

```js
function sayHi(){
    console.log('Hello,', this.name);
}
var person = {
    name: 'YvetteLau',
    sayHi: sayHi
}
var name = 'Wiliam';
var Hi = function(fn) {
    fn();
}
Hi.call(person, person.sayHi);
```
输出的结果是hello wiliam。Hi.call(person, person.sayHi)的确是将this绑定到Hi中的this了。但是在执行fn的时候，相当于直接调用了sayHi方法(记住: person.sayHi已经被赋值给fn了，隐式绑定也丢了)，没有指定this的值，对应的是默认绑定。

如何解决？
```js
function sayHi(){
    console.log('Hello,', this.name);
}
var person = {
    name: 'YvetteLau',
    sayHi: sayHi
}
var name = 'Wiliam';
var Hi = function(fn) {
    fn.call(this);
}
Hi.call(person, person.sayHi);
```
person被绑定到了hi函数中的this上面，fn又将这个对象绑定给了sayhi的函数。

#### new绑定
使用new来调用函数，会自动执行下面操作：
1. 创建一个新对象
2. 将构造函数的作用域赋值给新对象，及this指向这个新对象
3. 执行构造函数里面的方法
4. 返回新对象

### 绑定优先级
new绑定 > 显式绑定 > 隐式绑定 > 默认绑定

### 箭头函数
箭头函数没有自己的this，它的this继承于外层代码库的this，需要注意以下几点：
1. 函数本身没有this，继承于外层代码块的this
2. 不可以当做构造函数，及不能使用new关键字
3. 不可以使用arguments，如果要用，用rest代替
4. 不可以使用yield，因此箭头函数不能当做generator函数
5. 不能用call，apply，bind改变this的指向

```js
var obj = {
    hi: function(){
        console.log(this);
        return ()=>{
            console.log(this);
        }
    },
    sayHi: function(){
        return function() {
            console.log(this);
            return ()=>{
                console.log(this);
            }
        }
    },
    say: ()=>{
        console.log(this);
    }
}
let hi = obj.hi();  //输出obj对象
hi();               //输出obj对象
let sayHi = obj.sayHi();
let fun1 = sayHi(); //输出window
fun1();             //输出window
obj.say();          //输出window
```

### 总结
1. 函数是否在new中调用，如果是，那么this绑定的是新创建的对象
2. 函数是否通过call，apply调用，或者使用了bind，如果是，那么this绑定的就是指定的对象
3. 函数是否在某个上下文对象中调用，如果是，this绑定的是那个上下文对象
4. 如果以上都不是，那么使用默认绑定，严格模式下绑定到undefined，否则绑定到全局对象
5. 如果把null或者undefined作为this的绑定对象传入call、apply或者bind，这些值会在调用时会被忽略，实际应用的是默认绑定规则
6. 如果是箭头函数，箭头函数的this继承的是外层代码块的this。