class GrammarError extends Error {
  constructor(message) {
    super(message);
    this.name = "GrammarError";
  }
}

class Grammar {
  constructor() {
    this.nonTerminals = new Set();
    this.terminals = new Set();
    this.rules = new Map();
    this.startSymbol = '';
    this.minLen = 0;
    this.maxLen = 20;
  }

  setLen(min, max) {
    this.minLen = min;
    this.maxLen = max;
  }

  addNonTerminal(nonTerminal) {
    this.nonTerminals.add(nonTerminal);
  }

  addTerminal(terminal) {
    this.terminals.add(terminal);
  }

  addRule(nonTerminal, productions) {
    // Проверка на наличие нетерминала
    if (!this.nonTerminals.has(nonTerminal)) {
      throw new GrammarError('Non-terminal character must be contained in non-terminal characters');
    }

    // Синхронная проверка правил
    if (!this.validateRule(nonTerminal, productions)) {
      throw new GrammarError('Invalid rule detected');
    }

    this.rules.set(nonTerminal, new Set(productions));
  }

  setStartSymbol(symbol) {
    if (!this.nonTerminals.has(symbol)) {
      throw new GrammarError('Starting character must be contained in non-terminal characters');
    }
    this.startSymbol = symbol;
  }

  clear() {
    this.nonTerminals.clear();
    this.terminals.clear();
    this.rules.clear();
    this.startSymbol = '';
    this.minLen = 0;
    this.maxLen = 20;
  }

  generateChain() {
    let current = this.startSymbol;
    while (true) {
      for (let i = 0; i < current.length; i++) {
        if (this.nonTerminals.has(current[i])) {
          const replacements = Array.from(this.rules.get(current[i]));
          const replacement = replacements[Math.floor(Math.random() * replacements.length)];
          current = current.slice(0, i) + replacement + current.slice(i + 1);
          i--;
          if (current.length > this.maxLen) break;
        }
      }
      if (current.length >= this.minLen && current.length <= this.maxLen) return current;
      else current = this.startSymbol;
    }
  }

  // Синхронная проверка правила
  validateRule(nonTerminal, productions) {
    for (const production of productions) {
      // Проверка на прямую рекурсию
      if (production === nonTerminal) {
        throw new GrammarError(`Direct recursion detected in rule: ${nonTerminal} -> ${production}`);
      }

      // Разделение продукции на символы
      const symbols = production.split('');

      // Проверка на количество нетерминалов и терминалов
      const nonTerminalCount = symbols.filter(c => this.nonTerminals.has(c)).length;
      const terminalCount = symbols.filter(c => this.terminals.has(c)).length;

      // Проверка на случай, где продукция состоит только из нетерминалов
      if (nonTerminalCount > 0 && terminalCount === 0) {
        throw new GrammarError(`Production contains only non-terminals: ${nonTerminal} -> ${production}`);
      }
    }
    return true;
  }
}
