import React from 'react'
import Link from 'next/link'
import { Sms, DirectionsCar, Settings } from '@material-ui/icons'
import Logout from './Logout'

const Nav = ({ activeTab }) => {
  const menuItems = [
    {
      id: 1,
      name: 'Powiadomienia',
      slug: 'powiadomienia',
      icon: Sms,
    },
    {
      id: 2,
      name: 'Lista pojazdów',
      slug: 'pojazdy',
      icon: DirectionsCar,
    },
    ,
    {
      id: 3,
      name: 'Ustawienia',
      slug: 'ustawienia',
      icon: Settings,
    },
  ]
  return (
    <nav>
      <ul>
        {menuItems.map((item) => {
          return (
            <Link href={`/${item.slug}`} key={item.id}>
              <li className={activeTab === item.slug ? 'active' : ''}>
                {React.createElement(item.icon)}
                <span>{item.name}</span>
              </li>
            </Link>
          )
        })}
        <Logout />
      </ul>
    </nav>
  )
}

export default Nav
