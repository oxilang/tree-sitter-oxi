/**
 * @file Treesitter parser for the oxi programming language
 * @author septech
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

// Based on tree-sitter-rust

const PREC = {
  call: 15,
  field: 14,
  try: 13,
  unary: 12,
  cast: 11,
  multiplicative: 10,
  additive: 9,
  shift: 8,
  bitand: 7,
  bitxor: 6,
  bitor: 5,
  comparative: 4,
  and: 3,
  or: 2,
  range: 1,
  assign: 0,
  closure: -1,
};

const numericTypes = [
  "u8",
  "i8",
  "u16",
  "i16",
  "u32",
  "i32",
  "u64",
  "i64",
  "u128",
  "i128",
  "usize",
  "isize",
  "f16",
  "f32",
  "f64",
  "f128",
];
const primitiveTypes = numericTypes.concat(["bool", "char", "void"]);

export default grammar({
  name: "oxi",

  extras: ($) => [/\s/, $.line_comment],

  supertypes: ($) => [
    $._expression,
    $._type,
    $._literal,
    $._declaration_statement,
  ],

  inline: ($) => [
    $._path,
    $._type_identifier,
    $._field_identifier,
    $._declaration_statement,
    $._expression_ending_with_block,
  ],

  conflicts: ($) => [
    [$.field_declaration_list],
    [$.scoped_identifier, $.scoped_type_identifier],
    [$.struct_body, $.field_declaration_list],
  ],

  word: ($) => $.identifier,

  rules: {
    source_file: ($) => seq(optional($.shebang), repeat($._statement)),

    _statement: ($) => choice($.expression_statement, $._declaration_statement),

    empty_statement: (_) => ";",

    expression_statement: ($) =>
      choice(seq($._expression, ";"), prec(1, $._expression_ending_with_block)),

    _declaration_statement: ($) =>
      choice(
        $.const_item,
        $.empty_statement,
        $.attribute_item,
        $.inner_attribute_item,
        $.mod_item,
        $.struct_item,
        $.function_item,
        $.function_signature_item,
        $.impl_item,
        $.interface_item,
        $.let_declaration,
        $.import_declaration,
      ),

    // Section - Declarations

    attribute_item: ($) => seq("#", "[", $.attribute, "]"),

    inner_attribute_item: ($) => seq("#", "!", "[", $.attribute, "]"),

    attribute: ($) => seq($._path, optional(field("arguments", $.arguments))),

    mod_item: ($) =>
      seq(
        optional($.visibility_modifier),
        "mod",
        field("name", $.identifier),
        choice(";", field("body", $.declaration_list)),
      ),

    declaration_list: ($) => seq("{", repeat($._declaration_statement), "}"),

    struct_item: ($) =>
      seq(
        optional($.visibility_modifier),
        "struct",
        field("name", $._type_identifier),
        field("type_parameters", optional($.type_parameters)),
        field("body", $.struct_body),
      ),

    struct_body: ($) =>
      seq(
        "{",
        field("fields", optional($.field_declaration_list)),
        field("declarations", repeat($._declaration_statement)),
        "}",
      ),

    field_declaration_list: ($) =>
      seq(sepBy1(",", seq(repeat($.attribute_item), $.field_declaration)), optional(",")),

    field_declaration: ($) =>
      seq(
        optional($.visibility_modifier),
        field("name", $._field_identifier),
        ":",
        field("type", $._type),
      ),

    const_item: ($) =>
      seq(
        optional($.visibility_modifier),
        "const",
        field("name", $.identifier),
        ":",
        field("type", $._type),
        optional(seq("=", field("value", $._expression))),
        ";",
      ),

    function_item: ($) =>
      seq(
        optional($.visibility_modifier),
        optional($.extern_modifier),
        "fn",
        field("name", choice($.identifier, $.metavariable)),
        field("type_parameters", optional($.type_parameters)),
        field("parameters", $.parameters),
        field("return_type", $._type),
        field("body", $.block),
      ),

    function_signature_item: ($) =>
      seq(
        optional($.visibility_modifier),
        optional($.extern_modifier),
        "fn",
        field("name", choice($.identifier, $.metavariable)),
        field("type_parameters", optional($.type_parameters)),
        field("parameters", $.parameters),
        field("return_type", $._type),
        ";",
      ),

    impl_item: ($) =>
      seq(
        "impl",
        seq(
          field(
            "interface",
            choice($._type_identifier, $.scoped_type_identifier),
          ),
          "for",
        ),
        field("type", $._type),
        field("body", $.declaration_list),
      ),

    interface_item: ($) =>
      seq(
        optional($.visibility_modifier),
        "interface",
        field("name", $._type_identifier),
        field("type_parameters", optional($.type_parameters)),
        field("body", $.declaration_list),
      ),

    type_parameters: ($) =>
      prec(
        1,
        seq(
          "<",
          sepBy1(
            ",",
            seq(
              repeat($.attribute_item),
              choice($.metavariable, $.type_parameter),
            ),
          ),
          optional(","),
          ">",
        ),
      ),

    type_parameter: ($) =>
      prec(
        1,
        seq(
          field("name", $._type_identifier),
          optional(seq("=", field("default_type", $._type))),
        ),
      ),

    let_declaration: ($) =>
      seq(
        "let",
        optional($.mutable_specifier),
        field("identifier", $.identifier),
        optional(seq(":", field("type", $._type))),
        optional(seq("=", field("value", $._expression))),
        ";",
      ),

    import_declaration: ($) =>
      seq(
        optional($.visibility_modifier),
        "import",
        field("argument", $._import_clause),
        ";",
      ),

    _import_clause: ($) =>
      choice(
        $._path,
        $.import_as_clause,
        $.import_list,
        $.scoped_import_list,
        $.import_wildcard,
      ),

    scoped_import_list: ($) =>
      seq(field("path", optional($._path)), "::", field("list", $.import_list)),

    import_list: ($) =>
      seq("{", sepBy(",", choice($._import_clause)), optional(","), "}"),

    import_as_clause: ($) =>
      seq(field("path", $._path), "as", field("alias", $.identifier)),

    import_wildcard: ($) => seq(optional(seq(optional($._path), "::")), "*"),

    parameters: ($) =>
      seq("(", sepBy(",", seq(optional($.attribute_item), $.parameter)), ")"),

    parameter: ($) =>
      seq(field("identifier", $.identifier), ":", field("type", $._type)),

    extern_modifier: (_) => "extern",

    visibility_modifier: (_) => "pub",

    // Section - Types

    _type: ($) =>
      choice(
        $.reference_type,
        $.metavariable,
        $.generic_type,
        $.scoped_type_identifier,
        $.tuple_type,
        $.array_type,
        $.function_type,
        $._type_identifier,
        $.never_type,
        alias(choice(...primitiveTypes), $.primitive_type),
      ),

    array_type: ($) =>
      seq(
        "[",
        field("element", $._type),
        optional(seq(";", field("length", $._expression))),
        "]",
      ),

    function_type: ($) =>
      seq(
        prec(PREC.call, field("parameters", $.parameters)),
        seq("->", field("return_type", $._type)),
      ),

    generic_function: ($) =>
      prec(
        1,
        seq(
          field(
            "function",
            choice($.identifier, $.scoped_identifier, $.field_expression),
          ),
          "::",
          field("type_arguments", $.type_arguments),
        ),
      ),

    generic_type: ($) =>
      seq(
        field(
          "type",
          choice(
            $._type_identifier,
            $.scoped_identifier,
            $.scoped_type_identifier,
          ),
        ),
        "::",
        field("type_arguments", $.type_arguments),
      ),

    tuple_type: ($) => seq("(", sepBy1(",", $._type), optional(","), ")"),

    type_arguments: ($) =>
      seq("<", sepBy1(",", choice($._type, $._literal, $.block)), ">"),

    reference_type: ($) =>
      seq("&", optional($.mutable_specifier), field("type", $._type)),

    never_type: (_) => "!",

    mutable_specifier: (_) => "mut",

    // Section - Expressions

    _expression_except_range: ($) =>
      choice(
        $.unary_expression,
        $.reference_expression,
        $.try_expression,
        $.dereference_expression,
        $.binary_expression,
        $.assignment_expression,
        $.compound_assignment_expr,
        $.type_cast_expression,
        $.call_expression,
        $.return_expression,
        $._literal,
        prec.left($.identifier),
        alias(choice(...primitiveTypes), $.identifier),
        $.self,
        $.scoped_identifier,
        $.generic_function,
        $.field_expression,
        $.array_expression,
        $.tuple_expression,
        $.break_expression,
        $.index_expression,
        $.metavariable,
        $.parenthesized_expression,
        $.struct_expression,
        $._expression_ending_with_block,
      ),

    _expression: ($) => choice($._expression_except_range, $.range_expression),

    _expression_ending_with_block: ($) =>
      choice($.block, $.if_expression, $.while_expression, $.loop_expression),

    scoped_identifier: ($) =>
      seq(
        field("path", choice($._path, $.generic_type)),
        "::",
        field("name", choice($.identifier, $.super)),
      ),

    scoped_type_identifier_in_expression_position: ($) =>
      prec(
        -2,
        seq(
          field("path", choice($._path, $.generic_type)),
          "::",
          field("name", $._type_identifier),
        ),
      ),

    scoped_type_identifier: ($) =>
      seq(
        field("path", choice($._path, $.generic_type)),
        "::",
        field("name", $._type_identifier),
      ),

    range_expression: ($) =>
      prec.left(
        PREC.range,
        choice(
          seq($._expression, "..", $._expression),
          seq($._expression, ".."),
          seq("..", $._expression),
          "..",
        ),
      ),

    unary_expression: ($) =>
      prec(PREC.unary, seq(choice("-", "!"), $._expression)),

    dereference_expression: ($) => prec(PREC.try, seq($._expression, "@")),

    try_expression: ($) => prec(PREC.try, seq($._expression, "?")),

    reference_expression: ($) =>
      prec(
        PREC.unary,
        seq("&", optional($.mutable_specifier), field("value", $._expression)),
      ),

    binary_expression: ($) => {
      const table = [
        [PREC.and, "&&"],
        [PREC.or, "||"],
        [PREC.bitand, "&"],
        [PREC.bitor, "|"],
        [PREC.bitxor, "^"],
        [PREC.comparative, choice("==", "!=", "<", "<=", ">", ">=")],
        [PREC.shift, choice("<<", ">>")],
        [PREC.additive, choice("+", "-")],
        [PREC.multiplicative, choice("*", "/", "%")],
        [PREC.range, "|>"],
      ];

      return choice(
        ...table.map(([precedence, operator]) =>
          prec.left(
            // @ts-ignore
            precedence,
            seq(
              field("left", $._expression),
              // @ts-ignore
              field("operator", operator),
              field("right", $._expression),
            ),
          ),
        ),
      );
    },

    assignment_expression: ($) =>
      prec.left(
        PREC.assign,
        seq(field("left", $._expression), "=", field("right", $._expression)),
      ),

    compound_assignment_expr: ($) =>
      prec.left(
        PREC.assign,
        seq(
          field("left", $._expression),
          field("operator", choice("+=", "-=", "*=", "/=", "%=")),
          field("right", $._expression),
        ),
      ),

    type_cast_expression: ($) =>
      prec.left(
        PREC.cast,
        seq(field("value", $._expression), "as", field("type", $._type)),
      ),

    return_expression: ($) =>
      choice(prec.left(seq("return", $._expression)), prec(-1, "return")),

    call_expression: ($) =>
      prec(
        PREC.call,
        seq(
          field("function", $._expression_except_range),
          field("arguments", $.arguments),
        ),
      ),

    arguments: ($) =>
      seq(
        "(",
        sepBy(",", seq(repeat($.attribute_item), $._expression)),
        optional(","),
        ")",
      ),

    array_expression: ($) =>
      seq(
        "[",
        sepBy(",", seq(repeat($.attribute_item), $._expression)),
        optional(","),
        "]",
      ),

    parenthesized_expression: ($) => seq("(", $._expression, ")"),

    tuple_expression: ($) =>
      seq(
        "(",
        seq($._expression, ","),
        repeat(seq($._expression, ",")),
        optional($._expression),
        ")",
      ),

    struct_expression: ($) =>
      seq(
        field(
          "name",
          choice(
            $._type_identifier,
            alias(
              $.scoped_type_identifier_in_expression_position,
              $.scoped_type_identifier,
            ),
            $.generic_type,
          ),
        ),
        field("body", $.field_initializer_list),
      ),

    field_initializer_list: ($) =>
      seq(
        "{",
        sepBy(",", choice($.shorthand_field_initializer, $.field_initializer)),
        optional(","),
        "}",
      ),

    shorthand_field_initializer: ($) =>
      seq(repeat($.attribute_item), $.identifier),

    field_initializer: ($) =>
      seq(
        repeat($.attribute_item),
        field("field", choice($._field_identifier, $.integer_literal)),
        ":",
        field("value", $._expression),
      ),

    if_expression: ($) =>
      prec.right(
        seq(
          "if",
          field("condition", $._expression),
          field("consequence", $.block),
          optional(field("alternative", $.else_clause)),
        ),
      ),

    else_clause: ($) => seq("else", choice($.block, $.if_expression)),

    while_expression: ($) =>
      seq("while", field("condition", $._expression), field("body", $.block)),

    loop_expression: ($) => seq("loop", field("body", $.block)),

    break_expression: ($) => prec.left(seq("break", optional($._expression))),

    index_expression: ($) =>
      prec(PREC.call, seq($._expression, "[", $._expression, "]")),

    field_expression: ($) =>
      prec(
        PREC.field,
        seq(
          field("value", $._expression),
          ".",
          field("field", choice($._field_identifier, $.integer_literal)),
        ),
      ),

    block: ($) => seq("{", repeat($._statement), optional($._expression), "}"),

    // Section - Literals

    _literal: ($) =>
      choice(
        $.string_literal,
        $.char_literal,
        $.boolean_literal,
        $.integer_literal,
        $.float_literal,
      ),

    negative_literal: ($) =>
      seq("-", choice($.integer_literal, $.float_literal)),

    integer_literal: (_) =>
      token(
        seq(
          choice(/[0-9][0-9_]*/, /0x[0-9a-fA-F_]+/, /0b[01_]+/, /0o[0-7_]+/),
          optional(choice(...numericTypes)),
        ),
      ),

    float_literal: (_) =>
      token(
        seq(
          choice(
            /[0-9][0-9_]*\.[0-9][0-9_]*/,
            /0x[0-9a-fA-F_]+\.[0-9a-fA-F_]+/,
            /0b[01_]+\.[01_]+/,
            /0o[0-7_]+\.[0-7_]+/,
          ),
          optional(choice(...numericTypes)),
        ),
      ),

    string_literal: ($) =>
      seq('"', repeat(choice($.escape_sequence, $.string_content)), '"'),

    string_content: (_) => token(/[^"]+/),

    char_literal: (_) =>
      token(
        seq(
          "'",
          optional(
            choice(
              seq(
                "\\",
                choice(
                  /[^xu]/,
                  /u[0-9a-fA-F]{4}/,
                  /u\{[0-9a-fA-F]+\}/,
                  /x[0-9a-fA-F]{2}/,
                ),
              ),
              /[^\\']/,
            ),
          ),
          "'",
        ),
      ),

    escape_sequence: (_) =>
      token.immediate(
        seq(
          "\\",
          choice(
            /[^xu]/,
            /u[0-9a-fA-F]{4}/,
            /u\{[0-9a-fA-F]+\}/,
            /x[0-9a-fA-F]{2}/,
          ),
        ),
      ),

    boolean_literal: (_) => choice("true", "false"),

    line_comment: (_) => seq("//", token.immediate(prec(1, /.*/))),

    _path: ($) =>
      choice(
        $.self,
        alias(choice(...primitiveTypes), $.identifier),
        $.metavariable,
        $.super,
        $.crate,
        $.identifier,
        $.scoped_identifier,
      ),

    identifier: (_) => /[@_\p{XID_Start}][_\p{XID_Continue}]*/u,

    shebang: (_) => /#![\r\f\t\v ]*([^\[\n].*)?\n/,

    _type_identifier: ($) => alias($.identifier, $.type_identifier),
    _field_identifier: ($) => alias($.identifier, $.field_identifier),

    self: (_) => "self",
    super: (_) => "super",
    crate: (_) => "crate",

    metavariable: (_) => /\$[a-zA-Z_]\w*/,
  },
});

/**
 * Creates a rule to match one or more of the rules separated by the separator.
 *
 * @param {RuleOrLiteral} sep - The separator to use.
 * @param {RuleOrLiteral} rule
 *
 * @returns {SeqRule}
 */
function sepBy1(sep, rule) {
  return seq(rule, repeat(seq(sep, rule)));
}

/**
 * Creates a rule to optionally match one or more of the rules separated by the separator.
 *
 * @param {RuleOrLiteral} sep - The separator to use.
 * @param {RuleOrLiteral} rule
 *
 * @returns {ChoiceRule}
 */
function sepBy(sep, rule) {
  return optional(sepBy1(sep, rule));
}
