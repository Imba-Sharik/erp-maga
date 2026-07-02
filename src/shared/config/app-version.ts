// Штамп билда инъектируется на этапе сборки (vite `define`, см. vite.config.ts):
// версия — из package.json, SHA и дата — из git/CI. Это единственная точка
// доступа к значениям штампа в приложении.
export const APP_VERSION = __APP_VERSION__
export const BUILD_SHA = __BUILD_SHA__
export const BUILD_DATE = __BUILD_DATE__
