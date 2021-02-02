import React from 'react'
import ReactDom from 'react-dom'
import { motion, AnimatePresence } from "framer-motion"

export default function ConfirmModal({open, onClose, clearUserData}) {
  return (
    <div className='ClearCacheConfirmModal-animation'>
    <AnimatePresence exitBeforeEnter>
    {open && (
      <motion.div 
        initial={{ opacity: 0, zIndex: 3000 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25}}
      >
      <div className='Modal-Overlay'/>
      <div className='Modal-Style ClearCacheConfirmModal'>
        <div>
          <h4>Do you really want to clear your login data?</h4>
          <p>This operation will delete your login, password form app and cookies file that hold you session information</p>
        </div>
        <div className='confirmation-buttons'>
          <button className='btn btn-danger btn-confirmation' onClick={clearUserData}>Yes</button>
          <button className='btn btn-primary btn-confirmation' onClick={onClose}>No</button>
        </div>
      </div>
    </motion.div>)}
    </AnimatePresence>
    </div>
  )
}
