# Flutter项目之Dart


## 类型汇总
### 基本类型
- Number (int, double) - double 格式就是`x.x`；如果只是x，也会给你默认为x.0; 另外， `int 1 == double 1.0`
- String
- Booleans (bool)
- Records ( (value1, value2) )
- List - **just like array in js**
- Set
- Map
- Runes - **often replaced by the characters API**
- Symbol
- null

> 因为它们本身也有构造函数，所以可以通过constructors 创建它们，比如 'a string' -> String('a string'), 这一点和 JS 一样

### 其他类型
- Object - 除了 null
- Enum
- Future | Stream 异步函数的支持
- Iterable
- Never
- dynamic - 什么类型都可以
- void

#### Int & Double

```dart
int num1 = 1; // int 不能是 1.1
double num2 = 1.0; // double 可以写成 1，默认给你转换成1.0
print(num1 == num2); // true

int.parse('1'); double.parse('1.1'); // 1; 1.1  -> string to number
1.toString(); // number to string

String numStr = 3.1415926.toStringAsFixed(2); // 3.14 -> 小数截取, int 和 double 都能用,但是变成了String

assert((3 | 4) == 7); // 数字同样支持 << >> >>> ~ & | ^ 等 位运算
```

#### string

```dart
int num = 4321;
string str = 'num is: $num'; // 最简单的嵌入 - $val
string str2 = 'double num is ${int.parse(num).toString()}'; // 表达式嵌入 - ${expression}

string str3 = 'He is ' ' my Little '
  'baby ' 'who is naughty' // 多个 string不用 + 号也能拼接，自动无视换行符号，组合成的是一个单行长句子


// 换行的两种方式 '''XXX''' 以及 `\n | \r\n | \r`
String str4 = '''I am 
Mr.Wplay'''

String rawStr = r'I cant \n break'; // 加上一个 r ，让 \n 失效 **r 是 raw 原始的意思**
```


## 要点汇总
1. 要执行的逻辑（声明不需要）一定要用main包裹着

```dart
// 不用main包裹就会各种报错。。。
void main() {
  void displayFlags({bool bold = false, String color = 'black'}) {
    print(bold);
    print(color);
  }

// 确实color和bold位置可以乱变了
  displayFlags(
    color: 'red',
    bold: true,
  );
}
```

2. 



## refer
[Flutter实战第二版](https://book.flutterchina.club/)