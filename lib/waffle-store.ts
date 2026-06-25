import type { WaffleData } from '@/types'

/* eslint-disable no-var */
declare global {
  var _waffleData: WaffleData | undefined
}

const DEFAULT_DATA: WaffleData = {
  items: [
    { id: '1', name: 'ApeXhit FHT', iconUrl: '', link: 'https://apexhit-fht.vercel.app', type: 'app', order: 1, createdAt: new Date().toISOString() },
    { id: '2', name: 'ApeXhit LinkIT', iconUrl: '', link: 'https://apexhit-linkit.vercel.app', type: 'app', order: 2, createdAt: new Date().toISOString() },
    { id: '3', name: 'ApeXhit DBC', iconUrl: '', link: 'https://apexhit-dbc.vercel.app', type: 'app', order: 3, createdAt: new Date().toISOString() },
    { id: '4', name: 'ApeXhit', iconUrl: '', link: 'https://apexhit.org', type: 'website', order: 1, createdAt: new Date().toISOString() },
    { id: '5', name: 'Buzzrock Enterprise', iconUrl: '', link: 'https://apexhit-buzzrock.vercel.app', type: 'website', order: 2, createdAt: new Date().toISOString() },
    { id: '6', name: 'LinkIT', iconUrl: '', link: 'https://apexhit-linkit.vercel.app', type: 'website', order: 3, createdAt: new Date().toISOString() },
    { id: '7', name: 'ApeXhit FHT', iconUrl: '', link: 'https://apexhit-fht.vercel.app', type: 'website', order: 4, createdAt: new Date().toISOString() },
    { id: '8', name: 'ApeXhit DBC', iconUrl: '', link: 'https://apexhit-dbc.vercel.app', type: 'website', order: 5, createdAt: new Date().toISOString() },
  ],
  updatedAt: new Date().toISOString()
}

export async function getWaffleData(): Promise<WaffleData> {
  return global._waffleData ?? DEFAULT_DATA
}

export async function saveWaffleData(data: WaffleData): Promise<void> {
  global._waffleData = data
}
