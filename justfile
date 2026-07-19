build:
    tree-sitter generate
    tree-sitter build

test:
    tree-sitter test

nvim-use: build
    mkdir -p ~/.local/share/nvim/site/parser
    ln -sf $(pwd)/oxi.so ~/.local/share/nvim/site/parser/oxi.so
    @if [ -d ~/.local/share/nvim/lazy/tree-sitter-oxi ]; then \
        mkdir -p ~/.local/share/nvim/lazy/tree-sitter-oxi/parser && \
        ln -sf $(pwd)/oxi.so ~/.local/share/nvim/lazy/tree-sitter-oxi/parser/oxi.so && \
        rm -rf ~/.local/share/nvim/lazy/tree-sitter-oxi/queries && \
        ln -sf $(pwd)/queries ~/.local/share/nvim/lazy/tree-sitter-oxi/queries; \
    fi
    @if [ -f ~/.local/share/nvim/lazy/nvim-treesitter/parser/oxi.so ]; then \
        rm -f ~/.local/share/nvim/lazy/nvim-treesitter/parser/oxi.so; \
    fi
    @echo "\nParser linked. Restart neovim."
