// 不用main包裹就会各种报错。。。
void main() {
  func5();
}

void func5() {
  String num = '4321';
  int num2 = 332;
  String str = 'num is: $num2';
  String str2 = 'double num is ${int.parse(num).toStringAsFixed(4)}';

  print(str);
  print(str2);

  String str3 = 'this is '
      'my baby'
      'who is naughty';
  print(str3);

  String str4 = r'''
You can create
multi-line strings like this one.
''';

  print(str4);

  String str5 = 'In a raw string, not even \r gets special treatment.';
  print(str5);
}

void func4() {
  int num = 2;
  double num2 = 1.0;
  print(num);
  print(num2);
  print(num == num2);

  double num3 = 1;
  print(num.toStringAsFixed(4));
}

void func1() {
  void displayFlags({bool bold = false, String color = 'black'}) {
    print(bold);
    print(color);
  }

  displayFlags(
    color: 'red',
    bold: true,
  );

  // final name = Toy('wplay');
  // print(name);

  final toyIns = Toy.fromJson({
    'list': [1, 2, 3]
  });
  print(toyIns.list);
  toyIns.list.forEach(print);
}

class Toy {
  String name;
  List<dynamic> list = [];

  factory Toy.fromJson(Map<String, dynamic> json) {
    final entity = Toy('wplay');
    entity.list = json['list'];
    return entity;
  }

  Toy(this.name);
}

void collectFunc() {
  var list = [1, 2, 3];

  if (list is List) {
    print('is list');
  }
}

int fibonacci(int n) {
  if (n == 0 || n == 1) return n;

  return fibonacci(n - 1) + fibonacci(n - 2);
}

void func2() {
  List list = [];
  list.forEach((name) => name.containes('wplay'));
}

void func3() {
  void noVal = null;
  Null noVal2 = null;

  Never nn = throw ();
}

final nowTime = func3();

int? i;

int getY() {
  return i! + 8;
}

Function? getX;

dynamic funGetX() {
  // if (getX != null) {
  getX?.call();
  // }
}

foo() {}

bool isTrue(bool param) => param;

void func6(int p1, int p2, [int? p3, int? p4]) {}

void func7(int p1, int p2, {required int p3, int p4 = 4}) {}

void useFunc() {
  func6(1, 2, 3);
  func7(1, 2, p3: 3, p4: 4);
}

class Persion {
  say() {
    print('hello');
  }
}

mixin Walk {
  walk() {
    print('walk');
  }
}

class Dog with Walk {
  wang() {
    print('wang');
  }
}

class Man extends Persion with Walk {
  say() {
    super.say();
    print('man say');
  }
}

dynamic dog = new Dog();
