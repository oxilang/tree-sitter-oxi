; Identifiers

(type_identifier) @type
(primitive_type) @type.builtin
(field_identifier) @property

; Identifier conventions

; Assume all-caps names are constants
((identifier) @constant
 (#match? @constant "^[A-Z][A-Z\\d_]+$"))

; Assume that uppercase names in paths are types
((scoped_identifier
  path: (identifier) @type)
 (#match? @type "^[A-Z]"))
((scoped_identifier
  path: (scoped_identifier
    name: (identifier) @type))
 (#match? @type "^[A-Z]"))
((scoped_type_identifier
  path: (identifier) @type)
 (#match? @type "^[A-Z]"))
((scoped_type_identifier
  path: (scoped_identifier
    name: (identifier) @type))
 (#match? @type "^[A-Z]"))

; Path segments

((scoped_identifier
   path: (identifier) @constant)
 (#match? @constant "^[A-Z][A-Z\\d_]*$"))
((scoped_identifier
   path: (scoped_identifier
     name: (identifier) @constant))
 (#match? @constant "^[A-Z][A-Z\\d_]*$"))
((scoped_type_identifier
   path: (identifier) @constant)
 (#match? @constant "^[A-Z][A-Z\\d_]*$"))
((scoped_type_identifier
   path: (scoped_identifier
     name: (identifier) @constant))
 (#match? @constant "^[A-Z][A-Z\\d_]*$"))
((scoped_identifier
   name: (identifier) @constant)
 (#match? @constant "^[A-Z][A-Z\\d_]*$"))

; Function calls

(call_expression
  function: (identifier) @function)
(call_expression
  function: (field_expression
    field: (field_identifier) @function.method))
(call_expression
  function: (scoped_identifier
    "::"
    name: (identifier) @function))

(generic_function
  function: (identifier) @function)
(generic_function
  function: (scoped_identifier
    name: (identifier) @function))
(generic_function
  function: (field_expression
    field: (field_identifier) @function.method))

; Function definitions

(function_item (identifier) @function)
(function_signature_item (identifier) @function)

(line_comment) @comment

"(" @punctuation.bracket
")" @punctuation.bracket
"[" @punctuation.bracket
"]" @punctuation.bracket
"{" @punctuation.bracket
"}" @punctuation.bracket

(type_arguments
  "<" @punctuation.bracket
  ">" @punctuation.bracket)
(type_parameters
  "<" @punctuation.bracket
  ">" @punctuation.bracket)

"::" @punctuation.delimiter
":" @punctuation.delimiter
"." @punctuation.delimiter
"," @punctuation.delimiter
";" @punctuation.delimiter

(parameter (identifier) @variable.parameter)
((parameter (identifier) @variable.builtin)
 (#eq? @variable.builtin "self"))

"as" @keyword
"break" @keyword
"const" @keyword
"else" @keyword
(extern_modifier) @keyword
"fn" @keyword
"for" @keyword
"if" @keyword
"impl" @keyword
"let" @keyword
"loop" @keyword
"mod" @keyword
(visibility_modifier) @keyword
"return" @keyword
"struct" @keyword
"interface" @keyword
"import" @keyword
"while" @keyword
(crate) @keyword
(mutable_specifier) @keyword
(import_list (self) @keyword)
(scoped_import_list (self) @keyword)
(scoped_identifier (self) @keyword)
(super) @keyword

(self) @variable.builtin

((type_identifier) @variable.builtin
 (#eq? @variable.builtin "Self"))

(char_literal) @string
(string_literal) @string

(boolean_literal) @constant
(integer_literal) @constant
(float_literal) @constant

(escape_sequence) @escape

(attribute_item) @attribute
(inner_attribute_item) @attribute

"+" @operator
"-" @operator
"*" @operator
"/" @operator
"%" @operator
"&" @operator
"|" @operator
"^" @operator
"!" @operator
"@" @operator
"=" @operator
"==" @operator
"!=" @operator
"<" @operator
"<=" @operator
">" @operator
">=" @operator
"<<" @operator
">>" @operator
"&&" @operator
"||" @operator
".." @operator
"|>" @operator
"?" @operator
"->" @operator
"+=" @operator
"-=" @operator
"*=" @operator
"/=" @operator
"%=" @operator
