# oxi-treesitter

A Treesitter parser for Oxi.

## Neovim Integration (nvim-treesitter)

To use this parser with Neovim locally for development:

```lua
local parser_config = require("nvim-treesitter.parsers").get_parser_configs()

parser_config.oxilang = {
  install_info = {
    url = "<...>/oxi-treesitter", -- Absolute path to this directory
    files = { "src/parser.c" },
    generate_requires_npm = false,
    requires_generate_from_grammar = false,
  },
  filetype = "oxi",
}

vim.filetype.add({
  extension = {
    oxi = "oxi",
  },
})

vim.opt.runtimepath:append("<...>/oxi-treesitter") -- Absolute path to this directory
```
