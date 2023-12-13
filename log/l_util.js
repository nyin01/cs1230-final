let rules = [];

// rules[0] = {
//   a: "F",
//   b: "F[+F]F[-F]F",
// };
// rules[0] = {
//   a: "X",
//   b: "F+[[X]-X]-F[-FX]+X",
// };
rules[0] = {
  a: "A",
  b: "F[++A][--A][>>A][<<A]",
};

// rules[0] = {
//   a: "A",
//   b: "^FB>>>B>>>>>B",
// };
// rules[1] = {
//   a: "B",
//   b: "[^^F>>>>>>A]",
// };

/**
 * Recursive function to generate lindenmayer string for tree generation
 * @param {*} text sentence to modify based on rules
 * @param {*} iteration max iteration for recursion
 * @param {*} curr current iteration number
 * @returns
 */
export function generate(text, iteration, curr) {
  if (curr == iteration) {
    return text;
  }
  var new_sentence = "";

  for (var i = 0; i < text.length; i++) {
    const current_char = text.charAt(i);
    let found = false;

    for (var j = 0; j < rules.length; j++) {
      if (current_char == rules[j].a) {
        new_sentence += rules[j].b;
        found = true;
      }
    }
    if (found == false) {
      new_sentence += current_char;
    }
  }
  return generate(new_sentence, iteration, curr + 1);
}
