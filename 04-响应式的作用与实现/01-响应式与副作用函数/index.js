function effect() {
  document.body.innerText = "hello world";
}

let val = 1;

function effect() {
  val = 2;
}

const obj = {
  text: "hello world",
};

function effect() {
  document.body.innerText = obj.text;
}
