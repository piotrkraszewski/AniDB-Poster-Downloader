import React from 'react'
import ReactDom from 'react-dom'
import { motion, AnimatePresence } from "framer-motion"

export default function FirstTimeLoginModal({open, onClose,proceedToLoginUser}) {

  return (
    <div className='FirstTimeLoginModal-animation'>
    <AnimatePresence exitBeforeEnter>
    {open && (
      <motion.div 
        initial={{ opacity: 0, zIndex: 4000 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25}}
      >
      <div className='Modal-Overlay'/>
      <div className='Modal-Style FirstTimeLoginModal'>
        <button className='btn btn-exit' onClick={onClose}>X</button>
        <div>
          <h4>This is your first login attempt</h4>
          <h5>Chrome browser will open up on top of the app to log you</h5>
          <div className='line'/>
          <p className='FirstTimeLogin-paragraph'>Chrome has to stay on top in order to type your username and password in browser. It is advised to not do anything during this process. It shouldn't take longer than 10s.<br/><br/> 

          After successful or unsuccessful login it should automatically close. If it doesn't close and just stays on an open page doing nothing, then app probably crashed and you need to restart it.</p>
          <div className='line'/>
        </div>
        <button className='btn btn-success btn-FirstTimeLogin' onClick={proceedToLoginUser}>Let's log in</button>
      </div>
    </motion.div>)}
    </AnimatePresence>
    </div>
  )
}
