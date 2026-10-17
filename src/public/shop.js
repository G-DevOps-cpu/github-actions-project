const products = {
  notebook: { name: 'The Idea Notebook', price: 4500 },
  mug: { name: 'The Shipping Mug', price: 6000 },
  mat: { name: 'The Focus Desk Mat', price: 12000 },
};
const basket = new Map();
const money = value => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);
function render() {
  const items = document.querySelector('#items');
  items.replaceChildren();
  let total = 0;
  let count = 0;
  for (const [id, quantity] of basket) {
    const product = products[id];
    total += product.price * quantity;
    count += quantity;
    const row = document.createElement('li');
    const label = document.createElement('span');
    label.textContent = `${product.name} × ${quantity}`;
    const remove = document.createElement('button');
    remove.className = 'text-button';
    remove.textContent = 'Remove';
    remove.setAttribute('aria-label', `Remove one ${product.name}`);
    remove.addEventListener('click', () => {
      if (quantity === 1) basket.delete(id); else basket.set(id, quantity - 1);
      render();
      document.querySelector('#announcement').textContent = `${product.name} removed.`;
    });
    row.append(label, remove);
    items.append(row);
  }
  if (!count) {
    const empty = document.createElement('li');
    empty.textContent = 'Your basket is empty. Find a favourite above.';
    items.append(empty);
  }
  document.querySelector('#count').textContent = count;
  document.querySelector('#total').textContent = money(total);
  document.querySelector('#clear').disabled = count === 0;
}
document.querySelectorAll('[data-product]').forEach(button => {
  button.addEventListener('click', () => {
    const id = button.dataset.product;
    basket.set(id, (basket.get(id) || 0) + 1);
    render();
    document.querySelector('#announcement').textContent = `${products[id].name} added to basket.`;
  });
});
document.querySelector('#clear').addEventListener('click', () => {
  basket.clear();
  render();
  document.querySelector('#announcement').textContent = 'Basket cleared.';
});
async function checkHealth() {
  const label = document.querySelector('#health');
  const button = document.querySelector('#refresh');
  button.disabled = true;
  label.textContent = 'Checking application health…';
  try {
    const response = await fetch('/health', { cache: 'no-store', signal: AbortSignal.timeout(5000) });
    if (!response.ok || (await response.json()).status !== 'ok') throw new Error('Unhealthy');
    label.textContent = '● Application is healthy';
  } catch {
    label.textContent = 'Application unavailable. Try again.';
  } finally {
    button.disabled = false;
  }
}
document.querySelector('#refresh').addEventListener('click', checkHealth);
checkHealth();
