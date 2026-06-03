module.exports = grammar({
  name: "oxi",

  extras: ($) => [/\s/, $.comment],

  conflicts: ($) => [
    [$.break_expression],
    [$.return_expression],
    [$.break_expression, $.assignment_expression],
    [$.break_expression, $.binary_expression],
    [$.break_expression, $.cast_expression],
    [$.return_expression, $.assignment_expression],
    [$.return_expression, $.binary_expression],
    [$.return_expression, $.cast_expression],
  ],

  rules: {
    source_file: ($) => repeat($._item),

    _item: ($) =>
      choice(
        $.const_declaration,
        $.function_definition,
        $.struct_definition,
        $.interface_definition,
        $.impl_definition,
        $.import_statement,
        $.module_definition,
      ),

    _statement: ($) =>
      choice(
        $.var_declaration,
        $.expression_statement,
        $.semicolon_statement,
      ),

    attribute: ($) =>
      seq(
        "#",
        "[",
        $.identifier,
        optional(seq("(", sepBy(",", $.identifier), ")")),
        "]",
      ),

    modifier: ($) => choice("pub", "extern"),

    _modifiers: ($) => repeat1($.modifier),
    _attributes: ($) => repeat1($.attribute),

    const_declaration: ($) =>
      seq(
        optional($._attributes),
        optional($._modifiers),
        "const",
        field("name", $.identifier),
        ":",
        field("type", $._type),
        "=",
        field("value", $.expression),
        ";",
      ),

    var_declaration: ($) =>
      seq(
        "let",
        optional("mut"),
        field("name", $.identifier),
        optional(seq(":", field("type", $._type))),
        optional(seq("=", field("value", $.expression))),
        ";",
      ),

    function_definition: ($) =>
      seq(
        optional($._attributes),
        optional($._modifiers),
        "fn",
        field("name", $.identifier),
        field("parameters", $.parameter_list),
        field("return_type", $._type),
        choice(field("body", $.block), ";", ","),
      ),

    parameter_list: ($) => seq("(", sepBy(",", $.parameter), ")"),

    parameter: ($) =>
      seq(field("name", $.identifier), ":", field("type", $._type)),

    struct_definition: ($) =>
      seq(
        optional($._attributes),
        optional($._modifiers),
        "struct",
        field("name", $.identifier),
        "{",
        repeat(choice($.struct_field, $.struct_method)),
        "}",
      ),

    struct_field: ($) =>
      seq(
        optional("pub"),
        field("name", $.identifier),
        ":",
        field("type", $._type),
        optional(","),
      ),

    struct_method: ($) =>
      seq(
        optional("pub"),
        optional("static"),
        "fn",
        field("name", $.identifier),
        field("parameters", $.parameter_list),
        optional(field("return_type", $._type)),
        field("body", $.block),
      ),

    interface_definition: ($) =>
      seq(
        optional($._attributes),
        optional($._modifiers),
        "interface",
        field("name", $.identifier),
        "{",
        repeat($.interface_method),
        "}",
      ),

    interface_method: ($) =>
      seq(
        "fn",
        field("name", $.identifier),
        field("parameters", $.parameter_list),
        field("return_type", $._type),
        ",",
      ),

    impl_definition: ($) =>
      seq(
        optional($._attributes),
        optional($._modifiers),
        "impl",
        field("interface", $.path),
        "for",
        field("type", $.path),
        "{",
        repeat($.impl_method),
        "}",
      ),

    impl_method: ($) =>
      seq(
        "fn",
        field("name", $.identifier),
        field("parameters", $.parameter_list),
        optional(field("return_type", $._type)),
        field("body", $.block),
      ),

    module_definition: ($) =>
      seq(
        optional($._attributes),
        optional($._modifiers),
        "mod",
        field("name", $.identifier),
        choice(
          ";",
          seq("{", repeat($._item), "}"),
        ),
      ),

    import_statement: ($) =>
      seq(
        optional($._attributes),
        optional($._modifiers),
        "import",
        $._import_tree,
        ";",
      ),

    _import_tree: ($) =>
      seq(
        $.identifier,
        repeat(seq("::", $.identifier)),
        optional(
          seq("::", choice("*", seq("{", sepBy(",", $._import_tree), "}"))),
        ),
        optional(seq("as", $.identifier)),
      ),

    path: ($) => prec.right(seq($.identifier, repeat(seq("::", $.identifier)))),

    expression_statement: ($) => prec.right(seq($.expression, optional(";"))),

    semicolon_statement: ($) => ";",

    expression: ($) =>
      choice(
        $.primary_expression,
        $.binary_expression,
        $.unary_expression,
        $.assignment_expression,
        $.postfix_expression,
        $.struct_instantiation,
        $.array_literal,
        $.cast_expression,
        $.if_expression,
        $.while_expression,
        $.loop_expression,
        $.break_expression,
        $.return_expression,
        $.block,
      ),

    primary_expression: ($) =>
      choice(
        $.integer_literal,
        $.float_literal,
        $.string_literal,
        $.char_literal,
        $.boolean_literal,
        $.path,
        $.parenthesized_expression,
        $.call_expression,
        $.member_expression,
      ),

    binary_expression: ($) =>
      prec.left(
        seq(
          field("left", $.expression),
          field(
            "operator",
            choice(
              "+",
              "-",
              "*",
              "/",
              "%",
              "==",
              "!=",
              "<",
              ">",
              "<=",
              ">=",
              "|",
              "&",
              "..",
              "|>",
            ),
          ),
          field("right", $.expression),
        ),
      ),

    unary_expression: ($) => prec(10, seq(choice("-", "&", "@"), $.expression)),

    postfix_expression: ($) => prec(11, seq($.expression, choice("?", "@"))),

    assignment_expression: ($) =>
      prec.right(
        seq(
          field("left", $.expression),
          choice("=", "+=", "-=", "*=", "/=", "%="),
          field("right", $.expression),
        ),
      ),

    member_expression: ($) =>
      prec(
        12,
        seq(
          field("object", $.expression),
          ".",
          field("property", $.identifier),
        ),
      ),

    call_expression: ($) =>
      prec(
        12,
        seq(
          field("function", $.expression),
          "(",
          sepBy(",", $.expression),
          ")",
        ),
      ),

    struct_instantiation: ($) =>
      prec(
        12,
        seq(
          field("name", $.identifier),
          "{",
          sepBy(
            ",",
            seq(field("field", $.identifier), optional(seq(":", $.expression))),
          ),
          "}",
        ),
      ),

    array_literal: ($) =>
      seq("[", "]", $._type, "{", sepBy(",", $.expression), "}"),

    cast_expression: ($) => seq($.expression, "as", $._type),

    if_expression: ($) =>
      seq(
        "if",
        field("condition", $.expression),
        field("consequence", $.block),
        optional(
          seq("else", field("alternative", choice($.block, $.if_expression))),
        ),
      ),

    while_expression: ($) =>
      seq("while", field("condition", $.expression), field("body", $.block)),

    loop_expression: ($) => seq("loop", $.block),

    break_expression: ($) => seq("break", optional($.expression)),

    return_expression: ($) => seq("return", optional($.expression)),

    block: ($) => seq("{", repeat($._statement), "}"),

    parenthesized_expression: ($) => seq("(", sepBy(",", $.expression), ")"),

    _type: ($) =>
      choice(
        $.path,
        $.pointer_type,
        $.array_type,
        $.slice_type,
        $.function_type,
        $.tuple_type,
        "$",
        "..",
      ),

    pointer_type: ($) => seq("&", optional("mut"), $._type),

    array_type: ($) => seq("[", $.integer_literal, "]", $._type),

    slice_type: ($) => seq("[", "]", $._type),

    function_type: ($) => seq("(", sepBy(",", $._type), ")", "->", $._type),

    tuple_type: ($) => seq("(", sepBy(",", $._type), ")"),

    // Literals
    integer_literal: ($) => /\d+/,
    float_literal: ($) => /\d+\.\d+/,
    string_literal: ($) => /"[^"]*"/,
    char_literal: ($) => /'[^']'/,
    boolean_literal: ($) => choice("true", "false"),

    identifier: ($) => /[@]?[a-zA-Z_][a-zA-Z0-9_]*/,

    comment: ($) => token(seq("//", /.*/)),
  },
});

function sepBy(sep, rule) {
  return optional(sepBy1(sep, rule));
}

function sepBy1(sep, rule) {
  return seq(rule, repeat(seq(sep, rule)), optional(sep));
}
