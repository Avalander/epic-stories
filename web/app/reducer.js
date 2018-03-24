export const makeReducer = reducers => (acc, { type, data }) => reducers[type](acc, data)
