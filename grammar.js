/**
 * @file Treesitter parser for the oxi programming language
 * @author septech
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "oxi",

  rules: {
    source_file: (_) => "todo",
  },
});

/**
 * Creates a rule that matches one-or-more ocurrences of a given rule separated by a separator.
 * @param {RuleOrLiteral} rule - rule to repeat, one or more times
 * @param {RuleOrLiteral} separator - separator to separate
 * @return {SeqRule}
 */
function sep1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)));
}

/**
 * Creates a rule that matches zero-or-more ocurrences of a given rule separated by a separator.
 * @param {RuleOrLiteral} rule - rule to repeat, zero or more times
 * @param {RuleOrLiteral} separator - separator to separate
 * @return {ChoiceRule}
 */
function sep(rule, separator) {
  return optional(sep1(rule, separator));
}
