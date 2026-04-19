export const setToken = (token: string) => {
  if (typeof window !== 'undefined') localStorage.setItem('token', token)
}
export const getToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem('token') : null
export const removeToken = () => {
  if (typeof window !== 'undefined') localStorage.removeItem('token')
}
export const isLoggedIn = () => !!getToken()
