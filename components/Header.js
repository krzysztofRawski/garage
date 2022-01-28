import Link from 'next/link'
import { useContext } from 'react'
import { AppData } from '../context/AppData'
import Nav from './Nav'

const Header = () => {
  const { state } = useContext(AppData)
  const { activeTab, userLogedIn } = state

  return (
    <header className='main-header'>
      <Link href='/'>
        <a className='logo'>
          <h1>Stacja Kontroli Pojazdów</h1>
        </a>
      </Link>
      {userLogedIn && <Nav activeTab={activeTab} />}
    </header>
  )
}

export default Header
