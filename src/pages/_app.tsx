import { ReactElement } from 'react'
import type { AppProps } from 'next/app'
import { UserPreferencesProvider } from '@context/UserPreferences'
import UrqlProvider from '@context/UrqlProvider'
import ConsentProvider from '@context/CookieConsent'
import { SearchBarStatusProvider } from '@context/SearchBarStatus'
import App from '../../src/components/App'
import '@oceanprotocol/typographies/css/ocean-typo.css'
import '../stylesGlobal/styles.css'
import Decimal from 'decimal.js'
import MarketMetadataProvider from '@context/MarketMetadata'
import { WagmiConfig } from 'wagmi'
import { ConnectKitProvider } from 'connectkit'
import { connectKitTheme, wagmiClient } from '@utils/wallet'
import AutomationProvider from '../@context/Automation/AutomationProvider'
import { FilterProvider } from '@context/Filter'
import { UseCasesProvider } from '../@context/UseCases'
import Script from 'next/script'
import { plausibleDataDomain } from 'app.config'

function MyApp({ Component, pageProps }: AppProps): ReactElement {
  Decimal.set({ rounding: 1 })

  return (
    <>
      {plausibleDataDomain && (
        <Script
          data-domain={plausibleDataDomain}
          src="https://plausible.io/js/script.js"
        />
      )}
      <WagmiConfig client={wagmiClient}>
        <ConnectKitProvider
          options={{ initialChainId: 0 }}
          customTheme={connectKitTheme}
        >
          <MarketMetadataProvider>
            <UrqlProvider>
              <UserPreferencesProvider>
                <UseCasesProvider>
                  <AutomationProvider>
                    <ConsentProvider>
                      <SearchBarStatusProvider>
                        <FilterProvider>
                          <App>
                            <Component {...pageProps} />
                          </App>
                        </FilterProvider>
                      </SearchBarStatusProvider>
                    </ConsentProvider>
                  </AutomationProvider>
                </UseCasesProvider>
              </UserPreferencesProvider>
            </UrqlProvider>
          </MarketMetadataProvider>
        </ConnectKitProvider>
      </WagmiConfig>
    </>
  )
}

export default MyApp
