class Grammar {
  constructor() {
    this.nonTerminals = new Set();
    this.terminals = new Set();
    this.rules = new Map();
    this.startSymbol = '';
    this.minLen = 0;
    this.maxLen = 20;
    this.chainHistories = {};  // Сохраняем историю для каждой цепочки
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
      throw new Error('Non-terminal character must be contained in non-terminal characters');
    }
    this.rules.set(nonTerminal, new Set(productions));
  }

  setStartSymbol(symbol) {
    if (!this.nonTerminals.has(symbol)) {
      throw new Error('Starting character must be contained in non-terminal characters');
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
    this.chainHistories = {};
  }

  generateAllChains() {
    let chains = new Set();
    let queue = [{ chain: this.startSymbol, history: [] }];

    while (queue.length) {
      const { chain, history } = queue.shift();

      // Проверяем, что текущая цепочка не содержит нетерминалов
      if (chain.split('').every(char => this.terminals.has(char))) {
        if (chain.length >= this.minLen && chain.length <= this.maxLen) {
          chains.add(chain);
          this.chainHistories[chain] = history;  // Сохраняем историю для этой цепочки
        }
      }

      if (chain.length < this.maxLen) {
        for (let i = 0; i < chain.length; i++) {
          if (this.nonTerminals.has(chain[i])) {
            const replacements = Array.from(this.rules.get(chain[i]));
            replacements.forEach(replacement => {
              const newChain = chain.slice(0, i) + replacement + chain.slice(i + 1);
              const newHistory = [...history, {
                nonTerminal: chain[i],
                chosen: replacement,
                alternatives: replacements.filter(r => r !== replacement)
              }];
              queue.push({ chain: newChain, history: newHistory });
            });
          }
        }
      }
    }

    return Array.from(chains).filter(chain => chain.length >= this.minLen && chain.length <= this.maxLen);
  }

  getHistory(chain) {
    return this.chainHistories[chain];
  }
}
