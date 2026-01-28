; Keywords
"fn" @keyword.function
"struct" @keyword.type
"interface" @keyword.type
"impl" @keyword.type
"let" @keyword.type
"static" @keyword.type
"mut" @keyword.type
"import" @keyword.import
"return" @keyword.return
"if" @keyword.conditional
"else" @keyword.conditional
"loop" @keyword.repeat
"as" @keyword.operator
"pub" @keyword.modifier
"extern" @keyword.modifier

; Literals
(integer_literal) @number
(float_literal) @float
(string_literal) @string
(char_literal) @character
(boolean_literal) @boolean

; Identifiers fallback
(identifier) @variable

; Types
(primitive_type (identifier) @type)
(type_expression) @type
(pointer_type) @type
(array_type) @type
(slice_type) @type
(struct_definition name: (identifier) @type)
(interface_definition name: (identifier) @type)
(impl_definition type: (_) @type)
(impl_definition interface: (identifier) @type)
(struct_instantiation name: (identifier) @type)

; Functions
(function_definition name: (identifier) @function)
(struct_method name: (identifier) @function.method)
(interface_method name: (identifier) @function.method)
(interface_method_impl name: (identifier) @function.method)
(call_expression
  function: (expression
    (primary_expression
      (identifier) @function.call)))
(call_expression
  function: (expression
    (primary_expression
      (member_expression
        property: (identifier) @function.call))))
(parameter name: (identifier) @variable.parameter)
((identifier) @function.builtin
 (#lua-match? @function.builtin "^@"))

; Variables and Fields
(var_declaration name: (identifier) @variable)
(struct_field name: (identifier) @variable.member)
(struct_instantiation field: (identifier) @variable.member)
(member_expression property: (identifier) @variable.member)

; Override member property highlighting if it is part of a call expression
(call_expression
  function: (expression
    (primary_expression
      (member_expression
        property: (identifier) @function.call))))

; Attributes
(attribute (identifier) @attribute)

; Comments
(comment) @comment

; Punctuation
[
  ";"
  "."
  ","
  ":"
  "::"
  "->"
] @punctuation.delimiter

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

; Operators
[
  "="
  "+"
  "-"
  "*"
  "/"
  "%"
  "=="
  "!="
  "<"
  ">"
  "<="
  ">="
  "&&"
  "||"
  "!"
  "&"
  "|"
  "^"
  "<<"
  ">>"
  "+="
  "-="
  "*="
  "/="
  "%="
] @operator
