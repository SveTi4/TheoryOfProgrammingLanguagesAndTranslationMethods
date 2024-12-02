class TreeNode {
  constructor(value, chosenReplacement = '', otherReplacements = []) {
    this.value = value; // Текущая строка
    this.chosenReplacement = chosenReplacement; // Выбранная замена
    this.otherReplacements = otherReplacements; // Невыбранные замены
    this.children = [];
  }

  addChild(node) {
    this.children.push(node);
  }
}

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
    this.treeRoot = null; // Корневой узел дерева
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
    this.treeRoot = null;
  }

  generateChain() {
    let current = this.startSymbol;
    this.treeRoot = new TreeNode(current); // Инициализация корня дерева
    let currentNode = this.treeRoot;

    while (true) {
      let madeChange = false;
      for (let i = 0; i < current.length; i++) {
        if (this.nonTerminals.has(current[i])) {
          const replacements = Array.from(this.rules.get(current[i]));
          const chosenReplacement = replacements[Math.floor(Math.random() * replacements.length)];
          const otherReplacements = replacements.filter(rep => rep !== chosenReplacement);

          // Обновляем строку с заменой
          current = current.slice(0, i) + chosenReplacement + current.slice(i + 1);

          // Создаем новый узел, который хранит информацию о сделанной замене и возможных других
          const newNode = new TreeNode(current, chosenReplacement, otherReplacements);
          currentNode.addChild(newNode);
          currentNode = newNode;

          i--; // Перемещаемся назад для проверки вновь замененного символа
          madeChange = true;

          if (current.length > this.maxLen) break;
        }
      }
      if (!madeChange) break;
      if (current.length >= this.minLen && current.length <= this.maxLen) return current;
      else {
        current = this.startSymbol;
        this.treeRoot = new TreeNode(current); // Обнуление дерева при перезапуске
        currentNode = this.treeRoot;
      }
    }
  }

  // Метод для вывода дерева
  printTree(node = this.treeRoot, depth = 0) {
    const indent = '  '.repeat(depth);
    console.log(`${indent}${node.value} (Выбрана: ${node.chosenReplacement}, Альтернативы: ${node.otherReplacements.join(', ')})`);
    for (let child of node.children) {
      this.printTree(child, depth + 1);
    }
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
