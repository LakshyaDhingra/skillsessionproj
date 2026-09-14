function Car() {
  const brand = "Ford";
  const model = "Mustang";
  return (
    <>
      <h2>My Car</h2>
      <p>
        It is a {brand} {model}.
      </p>
    </>
  );
}

createRoot(document.getElementById("root")).render(<Car />);

function Car() {
  const hp = 218 * 1.36;
  return (
    <>
      <h1>My car</h1>
      <p>It has {hp} horsepower</p>
    </>
  );
}

function kwtohp(kw) {
  return kw * 1.36;
}

function Car() {
  return (
    <>
      <h1>My car</h1>
      <p>It has {kwtohp(218)} horsepower</p>
    </>
  );
}

function Car() {
  const myobj = {
    name: "Fiat",
    model: "500",
    color: "white",
  };
  return (
    <>
      <h1>
        My car is a {myobj.color} {myobj.name} {myobj.model}
      </h1>
    </>
  );
}

{
  /* if statements */
}
function Fruit() {
  const x = 5;
  let y = "Apple";
  if (x < 10) {
    y = "Banana";
  }

  return <h1>{y}</h1>;
}

function Fruit() {
  const x = 5;
  return <h1>{x < 10 ? "Banana" : "Apple"}</h1>;
}

{
  /* React Components */
}
// Child Component is a component that is nested inside another component (Parent Component).
function Car(props) {
  return <h2>I am a {props.brand}!</h2>;
}

// Parent Component is a component that contains other components (Child Components) inside of it.
function Garage() {
  return (
    <>
      <h1>Who lives in my Garage?</h1>
      <Car brand="Ford" />
      <Car brand="BMW" />
    </>
  );
}

createRoot(document.getElementById("root")).render(<Garage />);

{
  /* React Events*/
}
function Football() {
  const shoot = (a, b) => {
    alert(b.type);
    /*
      'a' represents the argument that is passed to the function,
      in this case the string "Goal!"
      'b' represents the React event that triggered the function,
      in this case the 'click' event
      */
  };

  return (
    <button onClick={(event) => shoot("Goal!", event)}>Take the shot!</button>
  );
}

createRoot(document.getElementById("root")).render(<Football />);

{
  /*React Hooks */
}
import { useState } from "react";
// The useState hook allows you to add state to functional components.
//setColor is a function that allows you to update the state of the color variable.

function FavoriteColor() {
  const [color, setColor] = useState("red");
  return (
    <>
      <h1>My favorite color is {color}!</h1>
      <button onClick={() => setColor("blue")}>Blue</button>
      <button onClick={() => setColor("red")}>Red</button>
    </>
  );
}

import { useState } from "react";
import { createRoot } from "react-dom/client";

function MyCar() {
  const [car, setCar] = useState({
    brand: "Ford",
    model: "Mustang",
    year: "1964",
    color: "red",
  });

  return (
    <>
      <h1>My {car.brand}</h1>
      <p>
        It is a {car.color} {car.model} from {car.year}.
      </p>
    </>
  );
}

createRoot(document.getElementById("root")).render(<MyCar />);
