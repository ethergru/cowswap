import { useActiveWeb3React } from 'hooks/web3'
import { useEffect, useState } from 'react'
import { getProfileData } from 'api/gnosisProtocol'
import { ProfileData } from 'api/gnosisProtocol/api'

type FetchProfileState = {
  profileData: ProfileData | null
  error: string
  isLoading: boolean
}

const emptyState: FetchProfileState = {
  profileData: null,
  error: '',
  isLoading: false,
}

const FETCH_INTERVAL_IN_MINUTES = 5

export default function useFetchProfile(): FetchProfileState {
  const { account, chainId } = useActiveWeb3React()
  const [profile, setProfile] = useState<FetchProfileState>(emptyState)

  useEffect(() => {
    setProfile({ ...emptyState, isLoading: true })
    async function fetchAndSetProfileData() {
      if (!chainId || !account) {
        setProfile((prevState: FetchProfileState) => {
          return { ...prevState, isLoading: false }
        })
        return
      }

      try {
        const profileData = await getProfileData(chainId, account)
        setProfile((prevState: FetchProfileState) => {
          return { ...prevState, isLoading: false, profileData }
        })
      } catch (e) {
        setProfile((prevState: FetchProfileState) => {
          return { ...prevState, isLoading: false, error: 'Error getting profileData' }
        })
      }
    }

    const intervalId = setInterval(fetchAndSetProfileData, FETCH_INTERVAL_IN_MINUTES * 60_000)

    return () => clearInterval(intervalId)
  }, [account, chainId])

  return profile
}
