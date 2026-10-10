// Single entry point for every backend call the UI makes.
//
// Today all of it runs on the in-browser mock. When the backend is ready,
// set VITE_API_URL and implement the same functions with fetch() — see the
// endpoint list in README.md. Screens import only from here, never from
// ./mock directly.
import * as mock from './mock'

export const API_URL = import.meta.env.VITE_API_URL as string | undefined

export const api = {
  login: mock.login,
  signup: mock.signup,
  me: mock.me,
  logout: mock.logout,
  route: mock.route,
  streamChat: mock.streamChat,
  listConversations: mock.listConversations,
  listImages: mock.listImages,
  generateImage: mock.generateImage,
  runMission: mock.runMission,
  usage: mock.usage,
  replyFor: mock.replyFor,
}

export * from './types'
export { MODELS, PLANS, modelById } from './data'
