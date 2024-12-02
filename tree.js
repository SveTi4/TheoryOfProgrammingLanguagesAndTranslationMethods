document.getElementById('add-rule').addEventListener('click', () => {
  const rule = document.getElementById('rule').value;
  if (rule) {
    rules.push(rule);
    document.getElementById('rules-container').innerHTML += `<p class="rule-item">${rule}</p>`;
    document.getElementById('rule').value = '';
  }
});

document.getElementById('clear').addEventListener('click', () => {
  document.getElementById('rules-container').innerHTML = '';
  document.getElementById('chain-select').style.display = 'none';
  document.getElementById('build-tree').style.display = 'none';
  rules = [];
  grammar.clear();
});

document.getElementById('generate').addEventListener('click', (e) => {
  e.preventDefault();
  const startSymbol = document.getElementById('startSymbol').value;
  const minLen = parseInt(document.getElementById('minLen').value);
  const maxLen = parseInt(document.getElementById('maxLen').value);
  const nonTerminals = document.getElementById('nonTerminals').value.trim().split(' ');
  const terminals = document.getElementById('terminals').value.trim().split(' ');

  grammar.clear();
  nonTerminals.forEach(nt => grammar.addNonTerminal(nt));
  terminals.forEach(t => grammar.addTerminal(t));
  grammar.setStartSymbol(startSymbol);
  grammar.setLen(minLen, maxLen);

  rules.forEach(rule => {
    const [nonTerminal, productions] = rule.split('->');
    const productionList = productions.split('|').map(p => p.trim());
    grammar.addRule(nonTerminal.trim(), productionList);
  });

  const chains = grammar.generateAllChains();
  const select = document.getElementById('chain-select');
  select.innerHTML = '';
  chains.forEach(chain => {
    const option = document.createElement('option');
    option.value = chain;
    option.textContent = chain;
    select.appendChild(option);
  });

  select.style.display = 'block';
  document.getElementById('build-tree').style.display = 'block';
});

document.getElementById('build-tree').addEventListener('click', () => {
  const selectedChain = document.getElementById('chain-select').value;
  const chainHistory = grammar.getHistory(selectedChain);

  const treeData = buildTreeData(chainHistory);

  renderTree(treeData);  // Отображаем дерево с помощью D3.js
});

function buildTreeData(history) {
  const root = {
    name: history[0]?.nonTerminal || "Root",  // Начальная цепочка
    currentChain: history[0]?.nonTerminal || "",  // Текущая цепочка
    children: []
  };

  let currentChain = history[0]?.nonTerminal || "";  // Стартовая цепочка (например, A)
  let currentNode = root;

  history.forEach((step, index) => {
    // Обновляем текущую цепочку, заменяя нетерминал на выбранную продукцию
    currentChain = currentChain.replace(step.nonTerminal, step.chosen);

    // Создаем новый узел для основного пути, показываем продукцию и текущую цепочку
    const newNode = {
      name: `${step.nonTerminal} -> ${step.chosen} (${currentChain})`,  // Продукция и текущая цепочка в скобках
      currentChain: currentChain,
      children: []
    };

    // Добавляем альтернативы как дочерние узлы, только продукция
    if (step.alternatives.length > 0) {
      step.alternatives.forEach(alt => {
        currentNode.children.push({
          name: `Альт-а: ${alt}`,
          children: []
        });
      });
    }

    currentNode.children.push(newNode);  // Основной путь продолжает развиваться
    currentNode = newNode;  // Обновляем узел для следующего шага
  });

  return root;
}

function renderTree(data) {
  d3.select("#tree").selectAll('*').remove();  // Очищаем дерево перед новой отрисовкой

  const width = 1000, height = 900;

  const svg = d3.select("#tree").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(100, 50)");

  const root = d3.hierarchy(data);
  const treeLayout = d3.tree().size([height - 100, width - 200]);
  treeLayout(root);

  // Линии (ветви)
  svg.selectAll(".link")
    .data(root.links())
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", d3.linkHorizontal()
      .x(d => d.y)
      .y(d => d.x))
    .attr("fill", "none")
    .attr("stroke", "#000000")
    .attr("stroke-width", 2);

  // Узлы
  const node = svg.selectAll(".node")
    .data(root.descendants())
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.y},${d.x})`);

  // Круги для узлов
  node.append("circle")
    .attr("r", 5)
    .attr("fill", d => d.data.name.startsWith("Альт-а:") ? "#ff0000" : "#000");  // Красные круги для альтернатив

  // Текстовые метки для узлов
  node.append("text")
    .attr("dy", ".35em")
    .attr("x", d => d.children ? -15 : 15)
    .style("text-anchor", d => d.children ? "end" : "start")
    .style("font-size", "14px")
    .text(d => d.data.name);  // Показываем продукцию и цепочку для основного пути
}
