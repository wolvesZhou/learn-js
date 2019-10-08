// left instanceof right
// instanceof 是根据原型链来判断的
// left是实例，right是类型
function instanceofSelf(left, right) {
  const rightType = right.prototype; // 取类型的显示原型
  left = left.__proto__; // 取左侧的隐式原型
  while (true) {
    if (left === null) // 已经找到顶层
      return false
    if (left === rightType)
      return true
    left = left.__proto__;
  }
}