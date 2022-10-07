function run() {
  let d = new Date();

  document.body.innerHTML = " <h1>Today's date is " + d + " </h1>";
}

const btncalc = document.querySelector("#btncalc");
btncalc.addEventListener("click", () => {
  alert("dsadssad");
});

const btnclear = document.querySelector("#btnclear");
btnclear.addEventListener("click", (e) => {
  /*run();*/
  e.target.style.background = "blue";
  console.log(e.target);
});

// buttons is a node list. It looks and acts much like an array.
const buttons = document.querySelectorAll("button");

// we use the .forEach method to iterate through each button
buttons.forEach((button) => {
  // and for each one we add a 'click' listener
  button.addEventListener("click", () => {
    alert(button.id);
  });
});
