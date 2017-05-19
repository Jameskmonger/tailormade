/*jshint curly:true, eqeqeq:true, laxbreak:true, noempty:false */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2013 Einar Lielmanis and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.


 CSS Beautifier
---------------

    Written by Harutyun Amirjanyan, (amirjanyan@gmail.com)

    Based on code initially developed by: Einar Lielmanis, <einar@jsbeautifier.org>
        http://jsbeautifier.org/

    Usage:
        css_beautify(source_text);
        css_beautify(source_text, options);

    The options are (default in brackets):
        indent_size (4)                   — indentation size,
        indent_char (space)               — character to indent with,
        selector_separator_newline (true) - separate selectors with newline or
                                            not (e.g. "a,\nbr" or "a, br")

    e.g

    css_beautify(css_source_text, {
      'indent_size': 1,
      'indent_char': '\t',
      'selector_separator': ' '
    });
*/

// http://www.w3.org/TR/CSS21/syndata.html#tokenization
// http://www.w3.org/TR/css3-syntax/

// https://developer.mozilla.org/en-US/docs/Web/CSS/At-rule
const NESTED_AT_RULE = {
    "@page": true,
    "@font-face": true,
    "@keyframes": true,
    // also in CONDITIONAL_GROUP_RULE below
    "@media": true,
    "@supports": true,
    "@document": true
};

const CONDITIONAL_GROUP_RULE = {
    "@media": true,
    "@supports": true,
    "@document": true
};

interface Options {
    indentSize: number;
    indentCharacter: string;
    selectorSeparatorNewline: boolean;
}

const getOptions = (options?: Options) => {
    return options || {
        indentSize: 4,
        indentCharacter: ' ',
        selectorSeparatorNewline: true
    };
}

export default (source_text: string, options?: Options) => {
    const opts = getOptions(options);

    // tokenizer
    var whiteRe = /^\s+$/;
    var wordRe = /[\w$\-_]/;
    var pos = -1,
        ch;
    function next() {
        ch = source_text.charAt(++pos);
        return ch;
    }
    function peek() {
        return source_text.charAt(pos + 1);
    }
    function eatString(endChar) {
        var start = pos;
        while (next()) {
            if (ch === "\\") {
                next();
                next();
            } else if (ch === endChar) {
                break;
            } else if (ch === "\n") {
                break;
            }
        }
        return source_text.substring(start, pos + 1);
    }
    function eatWhitespace() {
        var start = pos;
        while (whiteRe.test(peek())) {
            pos++;
        }
        return pos !== start;
    }
    function skipWhitespace() {
        var start = pos;
        do {} while (whiteRe.test(next()));
        return pos !== start + 1;
    }
    function eatComment(singleLine) {
        var start = pos;
        next();
        while (next()) {
            if (ch === "*" && peek() === "/") {
                pos++;
                break;
            } else if (singleLine && ch === "\n") {
                break;
            }
        }
        return source_text.substring(start, pos + 1);
    }
    function lookBack(str) {
        return source_text.substring(pos - str.length, pos).toLowerCase() ===
            str;
    }
    function isCommentOnLine() {
        var endOfLine = source_text.indexOf('\n', pos);
        if (endOfLine === -1) {
            return false;
        }
        var restOfLine = source_text.substring(pos, endOfLine);
        return restOfLine.indexOf('//') !== -1;
    }
    function getImportName() {
        // eat up the opening apostrophe/speech mark
        next();

        // move to the first character
        next();

        let importName = eatString(";");
        importName = importName.substring(0, importName.length - 2); // remove last separator

        return importName;
    }
    // printer
    var indentString = source_text.match(/^[\r\n]*[\t ]*/)[0];
    var singleIndent = new Array(opts.indentSize + 1).join(opts.indentCharacter);
    var indentLevel = 0;
    var nestedLevel = 0;
    function indent() {
        indentLevel++;
        indentString += singleIndent;
    }
    function outdent() {
        indentLevel--;
        indentString = indentString.slice(0, -opts.indentSize);
    }
    var print = {} as any;
    print["{"] = function (ch) {
        print.singleSpace();
        output.push(ch);
        print.newLine();
    };
    print["}"] = function (ch) {
        print.newLine();
        output.push(ch);
        print.newLine();
        print.newLine(true);
    };
    print.import = function (name) {
        print.newLine();
        output.push(`@import "${name}";`);
        print.newLine();
        print.newLine(true);
    };
    print._lastCharWhitespace = function () {
        return whiteRe.test(output[output.length - 1]);
    };
    print.newLine = function (keepWhitespace) {
        if (!keepWhitespace) {
            while (print._lastCharWhitespace()) {
                output.pop();
            }
        }
        if (output.length) {
            output.push('\n');
        }
        if (indentString) {
            output.push(indentString);
        }
    };
    print.singleSpace = function () {
        if (output.length && !print._lastCharWhitespace()) {
            output.push(' ');
        }
    };
    var output = [];
    if (indentString) {
        output.push(indentString);
    }
    /*_____________________--------------------_____________________*/
    var insideRule = false;
    var enteringConditionalGroup = false;
    while (true) {
        var isAfterSpace = skipWhitespace();

        if (!ch) {
            break;
        } else if (ch === '/' && peek() === '*') { /* css comment */
            print.newLine();
            output.push(eatComment(false), "\n", indentString);
            var header = lookBack("");
            if (header) {
                print.newLine();
            }
        } else if (ch === '/' && peek() === '/') { // single line comment
            output.push(eatComment(true), indentString);
        } else if (ch === '@') {
            // strip trailing space, if present, for hash property checks
            var atRule = eatString(" ").replace(/ $/, '');

            if (atRule === "@import") {
                print.import(getImportName());
            } else {
                // pass along the space we found as a separate item
                output.push(atRule, ch);
                
                // might be a nesting at-rule
                if (atRule in NESTED_AT_RULE) {
                    nestedLevel += 1;
                    if (atRule in CONDITIONAL_GROUP_RULE) {
                        enteringConditionalGroup = true;
                    }
                }
            }
        } else if (ch === '{') {
            eatWhitespace();
            if (peek() === '}') {
                next();
                output.push(" {}");
            } else {
                indent();
                print["{"](ch);
                // when entering conditional groups, only rulesets are allowed
                if (enteringConditionalGroup) {
                    enteringConditionalGroup = false;
                    insideRule = (indentLevel > nestedLevel);
                } else {
                    // otherwise, declarations are also allowed
                    insideRule = (indentLevel >= nestedLevel);
                }
            }
        } else if (ch === '}') {
            outdent();
            print["}"](ch);
            insideRule = false;
            if (nestedLevel) {
                nestedLevel--;
            }
        } else if (ch === ":") {
            eatWhitespace();
            if (insideRule || enteringConditionalGroup) {
                // 'property: value' delimiter
                // which could be in a conditional group query
                output.push(ch, " ");
            } else {
                if (peek() === ":") {
                    // pseudo-element
                    next();
                    output.push("::");
                } else {
                    // pseudo-class
                    output.push(ch);
                }
            }
        } else if (ch === '"' || ch === '\'') {
            output.push(eatString(ch));
        } else if (ch === ';') {
            if (isCommentOnLine()) {
                var beforeComment = eatString('/');
                var comment = eatComment(true);
                output.push(beforeComment, comment.substring(1, comment.length - 1), '\n', indentString);
            } else {
                output.push(ch, '\n', indentString);
            }
        } else if (ch === '(') { // may be a url
            if (lookBack("url")) {
                output.push(ch);
                eatWhitespace();
                if (next()) {
                    if (ch !== ')' && ch !== '"' && ch !== '\'') {
                        output.push(eatString(')'));
                    } else {
                        pos--;
                    }
                }
            } else {
                if (isAfterSpace) {
                    print.singleSpace();
                }
                output.push(ch);
                eatWhitespace();
            }
        } else if (ch === ')') {
            output.push(ch);
        } else if (ch === ',') {
            eatWhitespace();
            output.push(ch);
            if (!insideRule && opts.selectorSeparatorNewline) {
                print.newLine();
            } else {
                print.singleSpace();
            }
        } else if (ch === ']') {
            output.push(ch);
        } else if (ch === '[') {
            if (isAfterSpace) {
                print.singleSpace();
            }
            output.push(ch);
        } else if (ch === '=') { // no whitespace before or after
            eatWhitespace();
            output.push(ch);
        } else {
            if (isAfterSpace) {
                print.singleSpace();
            }
            output.push(ch);
        }
    }

    return output.join('').replace(/[\n ]+$/, '');
}
