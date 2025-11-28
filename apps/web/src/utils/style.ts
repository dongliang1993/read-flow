import type { ViewSettings } from '@/types/book'

const getLayoutStyles = (
  overrideLayout: boolean,
  paragraphMargin: number,
  lineSpacing: number,
  wordSpacing: number,
  letterSpacing: number,
  textIndent: number,
  justify: boolean,
  hyphenate: boolean,
  zoomLevel: number,
  writingMode: string,
  vertical: boolean
) => {
  const layoutStyle = `
  @namespace epub "http://www.idpf.org/2007/ops";
  html {
    --default-text-align: ${justify ? 'justify' : 'start'};
    hanging-punctuation: allow-end last;
    orphans: 2;
    widows: 2;
  }
  [align="left"] { text-align: left; }
  [align="right"] { text-align: right; }
  [align="center"] { text-align: center; }
  [align="justify"] { text-align: justify; }
  :is(hgroup, header) p {
      text-align: unset;
      hyphens: unset;
  }
  pre {
      white-space: pre-wrap !important;
      tab-size: 2;
  }
  html, body {
    ${writingMode === 'auto' ? '' : `writing-mode: ${writingMode} !important;`}
    text-align: var(--default-text-align);
    max-height: unset;
  }
  body {
    overflow: unset;
    zoom: ${zoomLevel};
  }
  svg, img {
    height: auto;
    width: auto;
    background-color: transparent !important;
  }
  /* enlarge the clickable area of links */
  a {
    position: relative !important;
  }
  a::before {
    content: '';
    position: absolute;
    top: -10px;
    left: -10px;
    right: -10px;
    bottom: -10px;
  }
  p, blockquote, dd, div:not(:has(*:not(b, a, em, i, strong, u, span))) {
    line-height: ${lineSpacing} ${overrideLayout ? '!important' : ''};
    word-spacing: ${wordSpacing}px ${overrideLayout ? '!important' : ''};
    letter-spacing: ${letterSpacing}px ${overrideLayout ? '!important' : ''};
    text-indent: ${vertical ? textIndent * 1.2 : textIndent}em ${
    overrideLayout ? '!important' : ''
  };
    ${
      justify
        ? `text-align: justify ${overrideLayout ? '!important' : ''};`
        : ''
    }
    ${!justify && overrideLayout ? 'text-align: unset !important;' : ''};
    -webkit-hyphens: ${hyphenate ? 'auto' : 'manual'};
    hyphens: ${hyphenate ? 'auto' : 'manual'};
    -webkit-hyphenate-limit-before: 3;
    -webkit-hyphenate-limit-after: 2;
    -webkit-hyphenate-limit-lines: 2;
    hanging-punctuation: allow-end last;
    widows: 2;
  }
  p:has(> img:only-child), p:has(> span:only-child > img:only-child),
  p:has(> img:not(.has-text-siblings)),
  p:has(> a:first-child + img:last-child) {
    text-indent: initial !important;
  }
  blockquote[align="center"], div[align="center"],
  p[align="center"], dd[align="center"],
  li p, ol p, ul p {
    text-indent: initial !important;
  }
  p {
    ${
      vertical
        ? `margin-left: ${paragraphMargin}em ${
            overrideLayout ? '!important' : ''
          };`
        : ''
    }
    ${
      vertical
        ? `margin-right: ${paragraphMargin}em ${
            overrideLayout ? '!important' : ''
          };`
        : ''
    }
    ${
      !vertical
        ? `margin-top: ${paragraphMargin}em ${
            overrideLayout ? '!important' : ''
          };`
        : ''
    }
    ${
      !vertical
        ? `margin-bottom: ${paragraphMargin}em ${
            overrideLayout ? '!important' : ''
          };`
        : ''
    }
  }
  div {
    ${
      vertical && overrideLayout
        ? `margin-left: ${paragraphMargin}em !important;`
        : ''
    }
    ${
      vertical && overrideLayout
        ? `margin-right: ${paragraphMargin}em !important;`
        : ''
    }
    ${
      !vertical && overrideLayout
        ? `margin-top: ${paragraphMargin}em !important;`
        : ''
    }
    ${
      !vertical && overrideLayout
        ? `margin-bottom: ${paragraphMargin}em !important;`
        : ''
    }
  }
  h1, h2, h3, h4, h5, h6 {
    text-align: initial;
  }

  :lang(zh), :lang(ja), :lang(ko) {
    widows: 1;
    orphans: 1;
  }

  pre {
    white-space: pre-wrap !important;
  }

  .epubtype-footnote,
  aside[epub|type~="endnote"],
  aside[epub|type~="footnote"],
  aside[epub|type~="note"],
  aside[epub|type~="rearnote"] {
    display: none;
  }

  /* Now begins really dirty hacks to fix some badly designed epubs */
  img.pi {
    ${vertical ? 'transform: rotate(90deg);' : ''}
    ${vertical ? 'transform-origin: center;' : ''}
    ${vertical ? 'height: 2em;' : ''}
    ${vertical ? `width: ${lineSpacing}em;` : ''}
    ${vertical ? 'vertical-align: unset;' : ''}
  }

  .duokan-footnote-content,
  .duokan-footnote-item {
    display: none;
  }

  .calibre {
    color: unset;
  }

  /* inline images without dimension */
  sup img {
    height: 1em;
  }
  img.has-text-siblings {
    height: 1em;
    vertical-align: baseline;
  }
  .ie6 img {
    width: auto;
    height: auto;
  }
  .duokan-footnote img {
    width: 0.8em;
    height: 0.8em;
  }

  /* workaround for some badly designed epubs */
  div.left *, p.left * { text-align: left; }
  div.right *, p.right * { text-align: right; }
  div.center *, p.center * { text-align: center; }
  div.justify *, p.justify * { text-align: justify; }

  .nonindent, .noindent {
    text-indent: unset !important;
  }
`
  return layoutStyle
}

const getScrollbarStyles = () => {
  const scrollbarStyles = `
    /* 自定义滚动条样式 - 应用到iframe内容 */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    
    ::-webkit-scrollbar-thumb {
      background: #afb0b3;
      border-radius: 10px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: #9ca0a5;
    }
    
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    
    /* 针对滚动模式优化 */
    html[data-flow="scrolled"] ::-webkit-scrollbar {
      width: 8px;
    }
    
    html[data-flow="scrolled"] ::-webkit-scrollbar-thumb {
      background: ${'#afb0b3'};
      border-radius: 4px;
    }
    
    html[data-flow="scrolled"] ::-webkit-scrollbar-thumb:hover {
      background: ${'#9ca0a5'};
    }
  `
  return scrollbarStyles
}

export const getStyles = (viewSettings: ViewSettings) => {
  //   if (!themeCode) {
  //     themeCode = getThemeCode();
  //   }
  const layoutStyles = getLayoutStyles(
    viewSettings.overrideLayout!,
    viewSettings.paragraphMargin!,
    viewSettings.lineHeight!,
    viewSettings.wordSpacing!,
    viewSettings.letterSpacing!,
    viewSettings.textIndent!,
    viewSettings.fullJustification!,
    viewSettings.hyphenation!,
    viewSettings.zoomLevel! / 100.0,
    viewSettings.writingMode!,
    viewSettings.vertical!
  )

  //   const fontStyles = getFontStyles(
  //     viewSettings.serifFont!,
  //     viewSettings.sansSerifFont!,
  //     viewSettings.monospaceFont!,
  //     viewSettings.defaultFont!,
  //     viewSettings.defaultCJKFont!,
  //     viewSettings.defaultFontSize!,
  //     viewSettings.minimumFontSize!,
  //     viewSettings.fontWeight!,
  //     viewSettings.overrideFont!,
  //   );
  //   const colorStyles = getColorStyles(viewSettings.overrideColor!, viewSettings.invertImgColorInDark!, themeCode);
  //   const translationStyles = getTranslationStyles(viewSettings.showTranslateSource!);
  const scrollbarStyles = getScrollbarStyles()
  //   const userStylesheet = viewSettings.userStylesheet!;
  //   return `${layoutStyles}\n${fontStyles}\n${colorStyles}\n${translationStyles}\n${scrollbarStyles}\n${userStylesheet}`;

  return `${layoutStyles}\n${scrollbarStyles}`
}
