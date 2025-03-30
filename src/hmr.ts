// @ts-expect-error -- ignore
import RefreshRuntime from '/@react-refresh'

RefreshRuntime.injectIntoGlobalHook(window)
// @ts-expect-error -- ignore
window.$RefreshReg$ = () => {}
// @ts-expect-error -- ignore
window.$RefreshSig$ = () => type => type
// @ts-expect-error -- ignore
window.__vite_plugin_react_preamble_installed__ = true
