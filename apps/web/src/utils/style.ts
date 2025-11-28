// export const getStyles = (viewSettings: ViewSettings, themeCode?: ThemeCode) => {
//   if (!themeCode) {
//     themeCode = getThemeCode();
//   }
//   const layoutStyles = getLayoutStyles(
//     viewSettings.overrideLayout!,
//     viewSettings.paragraphMargin!,
//     viewSettings.lineHeight!,
//     viewSettings.wordSpacing!,
//     viewSettings.letterSpacing!,
//     viewSettings.textIndent!,
//     viewSettings.fullJustification!,
//     viewSettings.hyphenation!,
//     viewSettings.zoomLevel! / 100.0,
//     viewSettings.writingMode!,
//     viewSettings.vertical!,
//   );
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
//   const scrollbarStyles = getScrollbarStyles(themeCode);
//   const userStylesheet = viewSettings.userStylesheet!;
//   return `${layoutStyles}\n${fontStyles}\n${colorStyles}\n${translationStyles}\n${scrollbarStyles}\n${userStylesheet}`;
// };
