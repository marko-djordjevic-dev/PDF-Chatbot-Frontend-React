import types from "./types"

interface Settings {
    theme: string,
}
interface InitialState {
    settings: Settings,
}
interface Action {
    type: string,
    payload: any
}
const initialState: InitialState = {
    settings: {
        theme: localStorage.getItem('theme') || 'light'
    }
}
const reducer = (state = initialState, action: Action) => {
    switch (action.type) {
        case types.UPDATE_THEME:
            return {
                settings: {
                    ...state,
                    theme: action.payload
                }
            }
        default:
            return state
    }
}
export default reducer