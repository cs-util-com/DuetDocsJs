// src/converter.js — Lightweight HTML ⇄ Markdown converter (refactored)
// Works in both browser and Node.js environments.
// Dependencies: showdown, turndown, turndown-plugin-gfm

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    // Node / CommonJS
    module.exports = factory(
      require('showdown'),
      require('turndown'),
      require('turndown-plugin-gfm').gfm
    );
  } else {
    // Browser (UMD)
    root.converter = factory(
      root.showdown,
      root.TurndownService,
      root.turndownPluginGfm && root.turndownPluginGfm.gfm
    );
  }
})(
  typeof self !== 'undefined' ? self : this,
  function (Showdown, TurndownService, gfmPlugin) {
    if (!Showdown || !TurndownService) {
      throw new Error(
        'Showdown and Turndown must be loaded before converter.js'
      );
    }

    const showdownConverter = new Showdown.Converter({
      tables: true,
      strikethrough: true,
      tasklists: true,
      ghCodeBlocks: true,
      parseImgDimensions: true,
      ghCompatibleHeaderId: true,
      requireSpaceBeforeHeadingText: true,
      tablesHeaderId: true,
      simpleLineBreaks: false,
      footnotes: true,
      ghMentions: false,
      keepReferences: true,
    });
    showdownConverter.setFlavor('github');

    const turndownService = new TurndownService({
      headingStyle: 'atx',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
      emDelimiter: '*',
      strongDelimiter: '**',
      linkStyle: 'inlined',
    });

    if (gfmPlugin) {
      turndownService.use(gfmPlugin);
    }

    turndownService.addRule('smartDel', {
      filter: ['del'],
      replacement: function (content) {
        const htmlPattern = /[<>&]|html|tag|element|attribute/i;
        if (htmlPattern.test(content)) {
          return '<del>' + content + '</del>';
        }
        return '~~' + content + '~~';
      },
    });

    // Helper to build headerLine and alignmentRow
    function buildHeaderAlignment(headers) {
      if (!headers.length) return { headerLine: '', alignmentRow: '' };
      const headerLine =
        '| ' + headers.map((th) => th.textContent.trim()).join(' | ') + ' |';
      let alignmentRow = '|';
      for (const header of headers) {
        const align =
          header.style.textAlign || getComputedStyle(header).textAlign;
        let marker;
        switch (align) {
          case 'left':
            marker = ' :--- ';
            break;
          case 'center':
            marker = ' :----: ';
            break;
          case 'right':
            marker = ' ----: ';
            break;
          default:
            marker = ' --- ';
            break;
        }
        alignmentRow += marker + '|';
      }
      return { headerLine, alignmentRow };
    }

    // Helper to build body lines
    function buildBodyLines(rows, headers) {
      const bodyLines = [];
      rows.forEach((row) => {
        const cells = Array.from(row.querySelectorAll('td'));
        const rowLine =
          '| ' +
          cells
            .map((cell, idx) => {
              const content = cell.textContent.trim();
              const align =
                cell.style.textAlign || getComputedStyle(cell).textAlign;
              if (align === 'center') {
                const totalWidth = headers[idx]
                  ? headers[idx].textContent.trim().length
                  : content.length;
                const padding = Math.max(totalWidth - content.length, 0);
                const leftPad = Math.floor(padding / 2);
                const rightPad = padding - leftPad;
                return ' '.repeat(leftPad) + content + ' '.repeat(rightPad);
              } else if (align === 'right') {
                const totalWidth = headers[idx]
                  ? headers[idx].textContent.trim().length
                  : content.length;
                const padding = Math.max(totalWidth - content.length, 0);
                return ' '.repeat(padding) + content;
              }
              return content + ' '.repeat(4);
            })
            .join(' | ') +
          ' |';
        bodyLines.push(rowLine);
      });
      return bodyLines;
    }

    // Custom list item rule (kept small)
    turndownService.addRule('customListItem', {
      filter: 'li',
      replacement: function (content, node, options) {
        content = content.replace(/\\n/g, '\n');
        let isNestedListContent = content.startsWith('  ');
        if (!isNestedListContent) content = content.trim();
        if (content.includes('\n') && !isNestedListContent) {
          content = content.replace(/\n/gm, '\n    ');
        }

        var prefix = '';
        var parent = node.parentNode;
        if (parent.nodeName === 'OL') {
          var start = parent.getAttribute('start');
          var index = Array.prototype.indexOf.call(parent.children, node);
          prefix = (start ? Number(start) + index : index + 1) + '. ';
        } else {
          prefix = options.bulletListMarker + ' ';
        }

        let trailingNewline = '';
        if (node.nextSibling) {
          trailingNewline = '\n';
        } else if (content.includes('\n')) {
          trailingNewline = '\n';
        }

        return prefix + content + trailingNewline;
      },
    });

    turndownService.keep(['kbd']);

    turndownService.addRule('tableCell', {
      filter: ['th', 'td'],
      replacement: function (content, node) {
        const trimmedContent = content.trim();
        const align = node.style.textAlign || getComputedStyle(node).textAlign;
        if (align === 'center') return ' ' + trimmedContent + ' ';
        if (align === 'right') return '    ' + trimmedContent + ' ';
        return ' ' + trimmedContent + '    ';
      },
    });

    turndownService.addRule('tableWithAlignment', {
      filter: 'table',
      replacement: function (content, node) {
        if (!content.trim()) return '';
        const headers = Array.from(node.querySelectorAll('thead th'));
        let { headerLine, alignmentRow } = buildHeaderAlignment(headers);
        let rows = Array.from(node.querySelectorAll('tbody tr'));
        let bodyLines = buildBodyLines(rows, headers);

        if (!headerLine && rows.length > 0) {
          const firstRowCells = Array.from(rows[0].querySelectorAll('td'));
          if (firstRowCells.length > 0) {
            headerLine =
              '| ' +
              firstRowCells.map((cell) => cell.textContent.trim()).join(' | ') +
              ' |';
            alignmentRow =
              '| ' + firstRowCells.map(() => '---').join(' | ') + ' |';
            bodyLines.shift();
          } else {
            return '';
          }
        } else if (!headerLine && rows.length === 0) {
          return '';
        }

        return (
          headerLine +
          '\n' +
          alignmentRow +
          (bodyLines.length > 0 ? '\n' + bodyLines.join('\n') : '')
        );
      },
    });

    turndownService.addRule('footnoteRef', {
      filter: (node) => {
        if (node.nodeName === 'A' && node.getAttribute('rel') === 'footnote') {
          const href = node.getAttribute('href');
          if (href && href.startsWith('#fn-')) return true;
        }
        return false;
      },
      replacement: (content, node) => {
        const href = node.getAttribute('href');
        const footnoteId = href.substring(4);
        return `[^${footnoteId}]`;
      },
    });

    turndownService.addRule('footnoteDefinition', {
      filter: (node) =>
        node.nodeName === 'LI' && node.id && node.id.startsWith('fn-'),
      replacement: (content, node) => {
        const id = node.id.substring(3);
        const clonedNode = node.cloneNode(true);
        const backlink = clonedNode.querySelector('a[rev="footnote"]');
        if (backlink) backlink.parentNode.removeChild(backlink);
        let footnoteText = turndownService
          .turndown(clonedNode.innerHTML)
          .trim();
        return `[^${id}]: ${footnoteText}\n`;
      },
    });

    function markdownToHtml(markdown) {
      return showdownConverter.makeHtml(markdown);
    }

    function htmlToMarkdown(html) {
      let markdown = turndownService.turndown(html);
      markdown = markdown.replace(/\\\[\^([\w\d-]+)\\\]/g, '[^$1]');
      markdown = markdown.replace(/\\\[\^([\w\d-]+)\\\]:/g, '[^$1]:');
      markdown = markdown.replace(/\\\[\^([^\]]+)\\\]/g, '[^$1]');
      return markdown;
    }

    return { markdownToHtml, htmlToMarkdown };
  }
);
