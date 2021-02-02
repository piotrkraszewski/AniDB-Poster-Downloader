import React from 'react'
import {shell} from 'electron'
import ReactDom from 'react-dom'
import { motion, AnimatePresence } from "framer-motion"

export default function LoginModal({open, onClose, onOpenAbout,onOpenConfirmModal, login, onLoginChange, password, onPasswordChange, loginUser, islogged}) {

  const creatAccount = () => {
    shell.openExternal('https://anidb.net/user/register')
  }

  return (
    <AnimatePresence exitBeforeEnter>
    {open && (
      <motion.div className='backdrop'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25}}
      >
      <div className='Modal-Overlay'/>
      <div className='Modal-Style'>
        <div className='top-bar'>
          <p 
            className='Login-paragraph About-Login'
            onClick={onOpenAbout}
          >About Login</p>
          <button className='btn btn-exit' onClick={onClose}>X</button>
        </div>
        <h3>{islogged ? 'Logged in' : 'Not logged in'}</h3>
        <div className="form">
          <div className='line'/>
          <input 
            placeholder="Username" 
            value={login} 
            onChange={e => onLoginChange(event.target.value)}
          />
          <input 
            placeholder="Password" 
            value={password} 
            onChange={e => onPasswordChange(event.target.value)}
          />
          <button 
            className="btn btn-success btn-green"
            onClick={loginUser}
            >Log In
          </button>
          <button 
            className="btn btn-warning"
            onClick={onOpenConfirmModal}
            >Clear login data
          </button>
          <div className='line'/>
          <p 
            className='Login-paragraph'
            onClick={creatAccount}
            >Creat AniDB Account</p>
          <p className='login-info'>*Account is not needed for basic search</p>
        </div>
      </div>
    </motion.div>)}
  </AnimatePresence>
  )
}