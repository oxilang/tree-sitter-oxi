; Keywords
"fn" @keyword.function
"struct" @keyword.type
"interface" @keyword.type
"impl" @keyword.type
"const" @keyword.type
"let" @keyword.type
"static" @keyword.type
"mut" @keyword.type
"mod" @keyword
"import" @keyword.import
"return" @keyword.return
"if" @keyword.conditional
"else" @keyword.conditional
"while" @keyword.repeat
"loop" @keyword.repeat
"for" @keyword.repeat
"break" @keyword.repeat
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

; Types via AST context
(pointer_type (path (identifier) @type))
(array_type (path (identifier) @type))
(slice_type (path (identifier) @type))
(function_type (path (identifier) @type))
(tuple_type (path (identifier) @type))
(struct_field type: (path (identifier) @type))
(parameter type: (path (identifier) @type))
(var_declaration type: (path (identifier) @type))
(const_declaration type: (path (identifier) @type))
(cast_expression (path (identifier) @type))
(impl_definition interface: (path (identifier) @type))
(impl_definition type: (path (identifier) @type))
(interface_method return_type: (path (identifier) @type))
(function_definition return_type: (path (identifier) @type))
(struct_method return_type: (path (identifier) @type))
(impl_method return_type: (path (identifier) @type))
(array_literal (path (identifier) @type))

(struct_definition name: (identifier) @type)
(interface_definition name: (identifier) @type)
(struct_instantiation name: (identifier) @type)

; Functions
(function_definition name: (identifier) @function)
(struct_method name: (identifier) @function.method)
(interface_method name: (identifier) @function.method)
(impl_method name: (identifier) @function.method)

; Function calls: only the LAST identifier in a path is the callee
(call_expression
  function: (expression
    (primary_expression
      (path (identifier) @function.call .))))

; Non-last identifiers in any path are types/modules
(path (identifier) @type "::")

(call_expression
  function: (expression
    (primary_expression
      (member_expression
        property: (identifier) @function.call))))

(parameter name: (identifier) @variable.parameter)

; Variables and Fields
(var_declaration name: (identifier) @variable)
(const_declaration name: (identifier) @constant)
(struct_field name: (identifier) @variable.member)
(struct_instantiation field: (identifier) @variable.member)
(member_expression property: (identifier) @variable.member)

; Attributes
(attribute (identifier) @attribute)

; Comments
(comment) @comment

; Primitive types
((identifier) @type.builtin
 (#any-of? @type.builtin
  "i8" "i16" "i32" "i64" "i128" "isize"
  "u8" "u16" "u32" "u64" "u128" "usize"
  "f16" "f32" "f64" "f128"
  "bool" "void" "any"))

; Builtin functions (starting with @)
((identifier) @function.builtin
 (#match? @function.builtin "^@"))

; Self type
((identifier) @type.builtin
 (#eq? @type.builtin "Self"))

; self variable
((identifier) @variable.builtin
 (#eq? @variable.builtin "self"))

; crate, super as keywords in path context
((identifier) @keyword.import
 (#any-of? @keyword.import "crate" "super"))

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
  "&"
  "|"
  "+="
  "-="
  "*="
  "/="
  "%="
  ".."
  "|>"
  "?"
] @operator

; Dereference operator
(postfix_expression "@" @operator)
