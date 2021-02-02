import React from 'react'
import ReactDom from 'react-dom'
import { motion, AnimatePresence } from "framer-motion"

export default function AboutLogin({open, onClose}) {
  return (
    <div className='AboutLogin-animation'>
    <AnimatePresence exitBeforeEnter>
    {open && (
      <motion.div 
        initial={{ opacity: 0, zIndex: 2000 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25}}
      >
      <div className='Modal-Overlay'/>
      <div className='Modal-Style AboutLogin'>
        <button className='btn btn-exit' onClick={onClose}>X</button>
        <h3>About Login</h3>

        <hr className='line'/>

        <p>
        Most searches don't need an account.
        Account is necessary to search for restricted content.<br/><br/>
        
        To login to aniDB provide your username and password and click login button. Browser will open on top and login you. It is advised to not do anything during this process. It shouldn't take longer than 10s. <br/><br/>

        Wheter you are loged in or not is determined by cookies file saved in app. Cookies tell aniDB what user you are loged as so you don't need to login every time. Remember that after some time your cookies may expire.<br/><br/> 

        App will try to automatically log in you during search if your cookies became invalid. To prevent continous login atempt with wrong login or password clear login data or provide corrent login and password<br/><br/>

        Automatic login opens browser infront of an app just like during login<br/><br/>

        Lowest button will open browser to help you creat you aniDB account.
        </p>
        <div className='line'/>
        <button className='btn btn-primary btn-CloseAboutLogin' onClick={onClose}>Close</button>
      </div>
    </motion.div>)}
    </AnimatePresence>
    </div>
  )
}
