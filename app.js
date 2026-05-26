const STORAGE_KEY = 'listaCompras:v1';

function readItems(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){
    console.error('Erro ao ler storage', e);
    return [];
  }
}

function writeItems(items){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function createItemElement(item){
  const li = document.createElement('li');
  li.className = 'item' + (item.purchased ? ' purchased' : '');
  li.dataset.id = item.id;

  const left = document.createElement('div');
  left.className = 'left';
  const sw = document.createElement('div'); sw.className = 'sw';
  const name = document.createElement('div'); name.className = 'name'; name.textContent = item.name;
  left.append(sw, name);

  const controls = document.createElement('div'); controls.className = 'controls';
  const btnToggle = document.createElement('button'); btnToggle.className = 'control-btn'; btnToggle.textContent = item.purchased ? 'Desmarcar' : 'Comprar';
  const btnEdit = document.createElement('button'); btnEdit.className = 'control-btn edit'; btnEdit.textContent = 'Editar';
  const btnDelete = document.createElement('button'); btnDelete.className = 'control-btn delete'; btnDelete.textContent = 'Apagar';

  controls.append(btnToggle, btnEdit, btnDelete);
  li.append(left, controls);

  // events
  btnToggle.addEventListener('click', ()=>{
    togglePurchased(item.id);
  });
  btnDelete.addEventListener('click', ()=>{
    deleteItem(item.id);
  });
  btnEdit.addEventListener('click', ()=>{
    const novo = prompt('Editar item', item.name);
    if(novo !== null){
      updateItem(item.id, novo.trim());
    }
  });

  return li;
}
function sortItems(items){
  return items.slice().sort((a,b)=>{
    // primeiro não comprados (purchased=false) vêm antes dos comprados
    if(a.purchased !== b.purchased) return a.purchased ? 1 : -1;
    // depois ordena alfabeticamente, case-insensitive, respeitando pt-BR
    return a.name.localeCompare(b.name, 'pt-BR', {sensitivity: 'base', numeric: true});
  });
}

function updateStats(){
  const items = readItems();
  const total = items.length;
  const unpurchased = items.filter(i=>!i.purchased).length;
  const purchased = total - unpurchased;
  const unpurchasedPct = total === 0 ? 0 : Math.round((unpurchased/total)*100);
  const purchasedPct = total === 0 ? 0 : Math.round((purchased/total)*100);

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-unpurchased').textContent = unpurchased;
  document.getElementById('stat-unpurchased-pct').textContent = unpurchasedPct + '%';
  document.getElementById('stat-purchased').textContent = purchased;
  document.getElementById('stat-purchased-pct').textContent = purchasedPct + '%';
}

function render(){
  const listEl = document.getElementById('list');
  const items = readItems();
  listEl.innerHTML = '';
  updateStats();
  if(items.length === 0){
    const p = document.createElement('li'); p.className='item'; p.innerHTML='<div class="left"><div class="name">Nenhum item — adicione algo</div></div>';
    listEl.appendChild(p);
    return;
  }

  const ordered = sortItems(items);
  ordered.forEach(it=> listEl.appendChild(createItemElement(it)));
}

function addItem(name){
  if(!name) return;
  const items = readItems();
  const id = Date.now().toString(36);
  items.unshift({id,name, purchased:false});
  writeItems(items);
  updateStats();
  render();
}

function togglePurchased(id){
  const items = readItems();
  const idx = items.findIndex(i=>i.id===id);
  if(idx===-1) return;
  items[idx].purchased = !items[idx].purchased;
  writeItems(items);
  render();
}

function deleteItem(id){
  let items = readItems();
  items = items.filter(i=>i.id!==id);
  writeItems(items);
  render();
}

function updateItem(id, name){
  if(!name) return;
  const items = readItems();
  const idx = items.findIndex(i=>i.id===id);
  if(idx===-1) return;
  items[idx].name = name;
  writeItems(items);
  render();
}

function clearAll(){
  if(!confirm('Apagar todos os itens?')) return;
  writeItems([]);
  render();
}

// init
document.addEventListener('DOMContentLoaded', ()=>{
  const form = document.getElementById('form');
  const input = document.getElementById('item-input');
  const clearBtn = document.getElementById('clear-btn');

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const val = input.value.trim();
    if(val){ addItem(val); input.value = ''; input.focus(); }
  });

  clearBtn.addEventListener('click', ()=>{ clearAll(); });

  render();
});
