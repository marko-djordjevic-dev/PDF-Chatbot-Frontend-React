import Types from './types'
// type Settings = {
//     theme: 'light',
//     // prompt: string,
// }
export const changeTheme = (data: string) => ({
    type: Types.UPDATE_THEME,
    payload: data
})
