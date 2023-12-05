let rules = [];
let axiom = "X";

rules[0] = {
  a: "X",
  b: "F+[[X]-X]-[F[-FX]+X",
};
rules[1] = {
  a: "F",
  b: "FF",
};

/**
 * Recursive function to generate lindenmayer string for tree generation
 * @param {*} text sentence to modify based on rules
 * @param {*} iteration max iteration for recursion
 * @param {*} curr current iteration number
 * @returns
 */
function generate(text, iteration, curr) {
  if (curr == iteration) {
    return text;
  }
  var new_sentence = "";
  var found = false;
  for (var i = 0; i < text.length; i++) {
    var current_char = text.charAt(i);
    for (var j = 0; j < rules.length; j++) {
      if (current_char == rules[j].a) {
        new_sentence += rules[j].b;
        found = true;
        break;
      }
    }
    if (!found) {
      new_sentence += current_char;
    }
  }
  return generate(new_sentence, iteration, curr + 1);
}
