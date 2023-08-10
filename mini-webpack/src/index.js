import printMe from './print'

function compent() {
  const element = document.createElement('div');
  const btn = document.createElement('button');

  btn.innerHTML = 'Click me';
  btn.onclick = printMe;

  element.appendChild(btn);
  return element;
}

document.body.appendChild(compent())
