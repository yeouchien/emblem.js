/*global QUnit*/

import { w } from '../support/utils';
import Emblem from '../emblem';

QUnit.module("text: pipe character");

test('pipe (|) creates text', function(assert){
  assert.compilesTo('| hello there', 'hello there');
});

test('pipe (|) multiline creates text', function(assert){
  assert.compilesTo(w(
    '| hello there',
    '   and more'
  ), 'hello there and more');
});

test('pipe lines preserves leading spaces', function(assert){
  let fourSpaces = '    ';
  let threeSpaces = '   ';
  assert.compilesTo(
    '|' + fourSpaces + 'hello there',
    threeSpaces + 'hello there');
});

// FIXME is this correct behavior?
test('multiple pipe lines are concatenated', function(assert){
  assert.compilesTo(w(
    '| hi there',
    '| and more'
  ), 'hi thereand more');
});

// FIXME there is a "strip" modifier ("`") that the parser
// looks for but is not in the Emblem documentation

QUnit.module("text: whitespace fussiness");

test("spaces after html elements", function(assert){
  assert.compilesTo("p \n  span asd", "<p><span>asd</span></p>");
  assert.compilesTo("p \nspan  \n\ndiv\nspan",
    "<p></p><span></span><div></div><span></span>");
});

test("spaces after mustaches", function(assert){
  assert.compilesTo("each foo    \n  p \n  span",
    "{{#each foo}}<p></p><span></span>{{/each}}");
});

QUnit.module("text: preprocessor");

QUnit.test("it strips out preceding whitespace", function(assert){
  var emblem = w(
    "",
    "p Hello"
  );
  assert.compilesTo(emblem, "<p>Hello</p>");
});

QUnit.test("it handles preceding indentation", function(assert){
  var emblem = w(
    "  p Woot",
    "  p Ha"
  );
  assert.compilesTo(emblem, "<p>Woot</p><p>Ha</p>");
});

QUnit.test("it handles preceding indentation and newlines", function(assert){
  var emblem = w(
    "",
    "  p Woot",
    "  p Ha"
  );
  assert.compilesTo(emblem, "<p>Woot</p><p>Ha</p>");
});

QUnit.test("it handles preceding indentation and newlines pt 2", function(assert){
  var emblem = w(
    "  ",
    "  p Woot",
    "  p Ha"
  );
  assert.compilesTo(emblem, "<p>Woot</p><p>Ha</p>");
});

// FIXME this is the way it should work -- newlines
// in the emblem should not be turned into newines in the
// output by default.
test('multiple text lines', function(assert){
  var emblem = `
     span Your name is name
       and my name is name`;
  assert.compilesTo(emblem, '<span>Your name is name and my name is name</span>');
});

test('use an "\'" to add a space', function(assert){
  var emblem = `span
                 ' trailing space`;
  assert.compilesTo(emblem, '<span>trailing space </span>');
});

QUnit.module("text: copy paste html");

test("indented", function(assert) {
  var emblem;
  emblem = w("<p>",
             "  <span>This be some text</span>",
             "  <title>Basic HTML Sample Page</title>",
             "</p>");
  assert.compilesTo(emblem, '<p> <span>This be some text</span> <title>Basic HTML Sample Page</title></p>');
});

test("flatlina", function(assert) {
  var emblem;
  emblem = "<p>\n<span>This be some text</span>\n<title>Basic HTML Sample Page</title>\n</p>";
  assert.compilesTo(emblem, '<p><span>This be some text</span><title>Basic HTML Sample Page</title></p>');
});

QUnit.module("text: indentation");

test("it doesn't throw when indenting after a line with inline content", function(assert){
  var emblem = w(
    "p Hello",
    "  p invalid"
  );
  assert.compilesTo(emblem, "<p>Hello p invalid</p>");
});

test("it throws on half dedent", function(assert){
  var emblem = w(
    "p",
    "    span This is ok",
    "  span This aint"
  );
  assert.throws(function(){
    Emblem.compile(emblem);
  });
});

test("new indentation levels don't have to match parents'", function(assert){
  var emblem = w(
    "p ",
    "  span",
    "     div",
    "      span yes"
  );
  assert.compilesTo(emblem, "<p><span><div><span>yes</span></div></span></p>");
});

test("Windows line endings", function(assert) {
  var emblem;
  emblem = ".navigation\r\n  p Hello\r\n#main\r\n  | hi";
  assert.compilesTo(
    emblem, '<div class="navigation"><p>Hello</p></div><div id="main">hi</div>');
});

test("backslash doesn't cause infinite loop", function(assert) {
  var emblem;
  emblem = '| \\';
  assert.compilesTo(emblem, "\\");
});

test("backslash doesn't cause infinite loop with letter", function(assert) {
  var emblem;
  emblem = '| \\a';
  assert.compilesTo(emblem, "\\a");
});

// FIXME failing test for self-closing tag
/*
test("self closing tag with forward slash", function(assert) {
  var emblem;
  emblem = 'p/\n%bork/\n.omg/\n#hello.boo/\np/ class="asdasd"';
  assert.compilesTo(emblem, '<p /><bork /><div class="omg" /><div id="hello" class="boo" /><p class="asdasd" />');
});
*/

test("tagnames and attributes with colons", function(assert) {
  var emblem;
  emblem = '%al:ex match:neer="snork" Hello!';
  assert.compilesTo(emblem, '<al:ex match:neer="snork">Hello!</al:ex>');
});

test("windows newlines", function(assert) {
  var emblem;
  emblem = "\r\n  \r\n  p Hello\r\n\r\n";
  assert.compilesTo(emblem, '<p>Hello</p>');
});

QUnit.module("text: EOL Whitespace");

test("shouldn't be necessary to insert a space", function(assert) {
  var emblem;
  emblem = "p Hello,\n  How are you?\np I'm fine, thank you.";
  assert.compilesTo(emblem, "<p>Hello, How are you?</p><p>I'm fine, thank you.</p>");
});

QUnit.module('text: indent/predent');

// FIXME
/*
test("predent", function(assert) {
  var emblem;
  emblem = w("        ",
             "pre",
             "  ` This",
             "  `   should",
             "  `  hopefully",
             "  `    work, and work well.");
  return assert.compilesTo(emblem, '<pre>This\n  should\n hopefully\n   work, and work well.\n</pre>');
});
*/

test("mixture", function(assert) {
  var emblem;
  emblem = "        \n";
  emblem += "  p Hello\n";
  emblem += "  p\n";
  emblem += "    | Woot\n";
  emblem += "  span yes\n";
  return assert.compilesTo(emblem, '<p>Hello</p><p>Woot</p><span>yes</span>');
});

test("mixture w/o opening blank", function(assert) {
  var emblem;
  emblem = "  p Hello\n";
  emblem += "  p\n";
  emblem += "    | Woot\n";
  emblem += "  span yes\n";
  return assert.compilesTo(emblem, '<p>Hello</p><p>Woot</p><span>yes</span>');
});

test("w/ blank lines", function(assert) {
  var emblem;
  emblem = "  p Hello\n";
  emblem += "  p\n";
  emblem += "\n";
  emblem += "    | Woot\n";
  emblem += "\n";
  emblem += "  span yes\n";
  return assert.compilesTo(emblem, '<p>Hello</p><p>Woot</p><span>yes</span>');
});

test("w/ blank whitespaced lines", function(assert) {
  var emblem;
  emblem = "  p Hello\n";
  emblem += "  p\n";
  emblem += "\n";
  emblem += "    | Woot\n";
  emblem += "        \n";
  emblem += "       \n";
  emblem += "         \n";
  emblem += "\n";
  emblem += "  span yes\n";
  emblem += "\n";
  emblem += "  sally\n";
  emblem += "\n";
  emblem += "         \n";
  emblem += "    | Woot\n";
  return assert.compilesTo(emblem, '<p>Hello</p><p>Woot</p><span>yes</span>{{#sally}}Woot{{/sally}}');
});


// FIXME maybe -- this test was commented out in the original test suite
/*
test("bigass", function(assert) {
  var emblem, expected;
  emblem = "<div class=\"content\">\n  <p>\n    We design and develop ambitious web and mobile applications, \n  </p>\n  <p>\n    A more official portfolio page is on its way, but in the meantime, \n    check out\n  </p>\n</div>";
  expected = '<div class="content">\n<p>  We design and develop ambitious web and mobile applications, \n</p>\n<p>  A more official portfolio page is on its way, but in the meantime, check out\n</p></div>';
  assert.compilesTo(emblem, expected);
});
*/