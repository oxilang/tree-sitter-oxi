; ADT definitions

(struct_item
    name: (type_identifier) @name) @definition.class

; method definitions

(declaration_list
    (function_item
        name: (identifier) @name) @definition.method)

(struct_body
    (function_item
        name: (identifier) @name) @definition.method)


; function definitions

(function_item
    name: (identifier) @name) @definition.function

; interface definitions
(interface_item
    name: (type_identifier) @name) @definition.interface

; module definitions
(mod_item
    name: (identifier) @name) @definition.module

; references

(call_expression
    function: (identifier) @name) @reference.call

(call_expression
    function: (field_expression
        field: (field_identifier) @name)) @reference.call

; implementations

(impl_item
    interface: (type_identifier) @name) @reference.implementation

(impl_item
    type: (type_identifier) @name
    !interface) @reference.implementation
