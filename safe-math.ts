type Token = { kind: "number" | "name" | "operator" | "paren"; value: string };

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    if (/\s/.test(input[i])) { i++; continue; }
    const rest = input.slice(i);
    const number = rest.match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/i);
    if (number) { tokens.push({ kind: "number", value: number[0] }); i += number[0].length; continue; }
    const name = rest.match(/^[a-z]+/i);
    if (name) { tokens.push({ kind: "name", value: name[0].toLowerCase() }); i += name[0].length; continue; }
    const char = input[i];
    if ("+-*/^%".includes(char)) tokens.push({ kind: "operator", value: char });
    else if ("()".includes(char)) tokens.push({ kind: "paren", value: char });
    else throw new Error(`Unsupported character: ${char}`);
    i++;
  }
  return tokens;
}

export function calculate(input: string, degrees = true): number {
  const tokens = tokenize(input);
  let index = 0;
  const peek = () => tokens[index];
  const take = () => tokens[index++];
  const match = (value: string) => peek()?.value === value && !!take();
  const expression = (): number => {
    let value = term();
    while (peek()?.value === "+" || peek()?.value === "-") { const op = take().value; const rhs = term(); value = op === "+" ? value + rhs : value - rhs; }
    return value;
  };
  const term = (): number => {
    let value = unary();
    while (["*", "/", "%"].includes(peek()?.value ?? "")) { const op = take().value; const rhs = unary(); value = op === "*" ? value * rhs : op === "/" ? value / rhs : value % rhs; }
    return value;
  };
  const unary = (): number => {
    if (match("+")) return unary();
    if (match("-")) return -unary();
    return power();
  };
  const power = (): number => { const left = primary(); if (match("^")) return left ** unary(); return left; };
  const primary = (): number => {
    const token = take();
    if (!token) throw new Error("Enter an expression to calculate.");
    if (token.kind === "number") return Number(token.value);
    if (token.kind === "paren" && token.value === "(") { const value = expression(); if (!match(")")) throw new Error("Add a closing parenthesis."); return value; }
    if (token.kind === "name") {
      if (token.value === "pi") return Math.PI;
      if (token.value === "e") return Math.E;
      const fn = ({ sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan, sqrt: Math.sqrt, log: Math.log10, ln: Math.log, abs: Math.abs } as Record<string, (n: number) => number>)[token.value];
      if (!fn) throw new Error(`Unknown function: ${token.value}`);
      const wrapped = match("(");
      const argument = wrapped ? expression() : unary();
      if (wrapped && !match(")")) throw new Error("Add a closing parenthesis.");
      const angle = token.value === "sin" || token.value === "cos" || token.value === "tan";
      const output = fn(angle && degrees ? argument * Math.PI / 180 : argument);
      if (["asin", "acos", "atan"].includes(token.value) && degrees) return output * 180 / Math.PI;
      return output;
    }
    throw new Error("Check the expression and try again.");
  };
  const result = expression();
  if (index < tokens.length) throw new Error("Check the expression and try again.");
  if (!Number.isFinite(result)) throw new Error("That expression does not have a finite result.");
  return result;
}
