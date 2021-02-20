import React from 'react'
import ScrollBar from 'react-perfect-scrollbar'
// import './ScroolbarStyle.css'

export default function AppScrollbar (props) {
  return (
    <ScrollBar className='AppScroolbar'>
      {props.children}
    </ScrollBar>
  )
}