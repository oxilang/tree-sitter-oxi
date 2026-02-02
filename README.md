# tree-sitter-oxi

A Treesitter parser for Oxi.

## Neovim Integration (nvim-treesitter)

To use this parser with Neovim locally for development with lazy.nvim:

```lua
return {
  'nvim-treesitter/nvim-treesitter',
  dependencies = {
    { 'oxilang/tree-sitter-oxi', build = false },
  },
  branch = 'main',
  lazy = false,
  build = ':TSUpdate',
  config = function()
    vim.filetype.add {
      extension = {
        oxi = 'oxi',
      },
    }

    vim.api.nvim_create_autocmd('User', {
      pattern = ':TSUpdate',
      callback = function()
        require('nvim-treesitter.parsers').oxi = {
          install_info = {
            url = 'https://github.com/oxilang/tree-sitter-oxi.git',
          },
        }
      end,
    })

    local filetypes = {
      'oxi',
    }
    require('nvim-treesitter').install(filetypes)
    vim.api.nvim_create_autocmd('FileType', {
      pattern = filetypes,
      callback = function() vim.treesitter.start() end,
    })
  end,
}
```
