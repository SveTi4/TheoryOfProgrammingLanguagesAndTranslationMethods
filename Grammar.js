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
    if (!this.nonTerminals.has(nonTerminal)) {
      throw new GrammarError('Non-terminal character must be contained in non-terminal characters');
    }

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

  generateAllChains() {
    let chains = new Set();
    let queue = [this.startSymbol];

    while (queue.length) {
      const current = queue.shift();

      // Проверяем, что текущая цепочка не содержит нетерминалов
      if (current.split('').every(char => this.terminals.has(char))) {
        if (current.length >= this.minLen && current.length <= this.maxLen) {
          chains.add(current);
        }
      }

      if (current.length < this.maxLen) {
        for (let i = 0; i < current.length; i++) {
          if (this.nonTerminals.has(current[i])) {
            const replacements = Array.from(this.rules.get(current[i]));
            replacements.forEach(replacement => {
              const newChain = current.slice(0, i) + replacement + current.slice(i + 1);
              queue.push(newChain);
            });
          }
        }
      }
    }

    return Array.from(chains).filter(chain => chain.length >= this.minLen && chain.length <= this.maxLen);
  }

  validateRule(nonTerminal, productions) {
    for (const production of productions) {
      if (production === nonTerminal) {
        throw new GrammarError(`Direct recursion detected in rule: ${nonTerminal} -> ${production}`);
      }

      const symbols = production.split('');
      const nonTerminalCount = symbols.filter(c => this.nonTerminals.has(c)).length;
      const terminalCount = symbols.filter(c => this.terminals.has(c)).length;

      if (nonTerminalCount > 0 && terminalCount === 0) {
        throw new GrammarError(`Production contains only non-terminals: ${nonTerminal} -> ${production}`);
      }
    }
    return true;
  }
}
