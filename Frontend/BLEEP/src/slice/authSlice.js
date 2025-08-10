import { createSlice } from "@reduxjs/toolkit";

const userIdFromStorage = localStorage.getItem('userId');

const initialState = {
    userId: userIdFromStorage || null
}



const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        //reducers take current state and an action and return a new updated state
        login: (state, action) => {
            const userIdFromLogin=action.payload.userId
            state.userId=userIdFromLogin

            localStorage.setItem('userId',userIdFromLogin)
        },
        logout: (state) => {
            state.userId=null

            localStorage.removeItem('userId')
        }
    }
})

export const {login,logout}=authSlice.actions

export default authSlice.reducer;