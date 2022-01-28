import '../styles/style.sass'
import Head from 'next/head'
import AppDataProvider from '../context/AppData'
import Header from '../components/Header'

function MyApp({ Component, pageProps }) {
  return (
    <AppDataProvider>
      <div className='app'>
        <Head>
          <title>Garage Tarnobrzeg</title>
          <meta name='description' content='Generated by create next app' />
          <link rel='icon' href='/favicon.ico' />
        </Head>
        <Header />
        <main>
          <Component {...pageProps} />
        </main>
      </div>
    </AppDataProvider>
  )
}

export default MyApp
