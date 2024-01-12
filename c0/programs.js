/* Some example c0 programs */

const blank = `int main {
  return 0;
}
`;

const hello_world = `#use <conio>
#use <string>

int main() {
  string hello = "Hello ";
  string world = "World!";

  println(string_join(hello, world));
  return 150;
}
`;

const exp = `// From the c0-reference

int exp (int k, int n)
//@requires n >= 0;
//@ ensures \\result >= 1;
/*@ensures \\result > n; @*/
{
  int res = 1;
  int i = 0;
  while (i < n) {
    res = res * k;
    i = i + 1;
  }
  return res;
}

int main() {
  return exp(2,4);
}
`;
