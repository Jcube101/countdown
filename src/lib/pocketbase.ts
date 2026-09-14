import PocketBase from 'pocketbase'

export const pb = new PocketBase('https://pb-apps.job-joseph.com')

export const OWNER_COLLECTION = 'countdown_owners'
export const COUNTDOWN_COLLECTION = 'countdown_items'

export function magicLinkTarget(otp: string, otpId: string) {
  const params = new URLSearchParams({ otp, otpId })
  return `/manage?${params.toString()}`
}

export async function requestOwnerMagicLink(email: string) {
  return pb.collection(OWNER_COLLECTION).requestOTP(email)
}

export async function completeOwnerMagicLink(otpId: string, otp: string) {
  return pb.collection(OWNER_COLLECTION).authWithOTP(otpId, otp)
}

export async function refreshOwnerSession() {
  if (!pb.authStore.isValid) return false
  try {
    await pb.collection(OWNER_COLLECTION).authRefresh()
    return true
  } catch {
    pb.authStore.clear()
    return false
  }
}
